"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { redirect } from "next/navigation";
import type { TransactionType } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";
import { TRANSACTION_COLUMNS, toTransaction, type Transaction, type TransactionRow } from "@/lib/transactions";
import { resolveCategoryId } from "@/lib/categories";
import { copy } from "@/lib/copy";
import {
  repeatSchema,
  validateRecurrenceStart,
  validateTransaction,
  type FieldErrors,
  type TransactionField,
} from "@/lib/validation";

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export type CreateTransactionState =
  | { status: "idle" }
  | { status: "invalid"; fieldErrors: FieldErrors<TransactionField> }
  | { status: "error" }
  | {
      status: "success";
      transaction: Transaction;
      /** "Repetir todo mês": dia da série e quantas movimentações a criação lançou (1 + meses até hoje). */
      recurrence?: { day: number; inserted: number };
    };

const uuidSchema = z.uuid();

function isTransactionType(value: unknown): value is TransactionType {
  return value === "income" || value === "expense";
}


/** `type` vem do botão que abriu o modal (bind no cliente), nunca de um campo do formulário. */
export async function createTransaction(
  type: TransactionType,
  _prev: CreateTransactionState,
  formData: FormData,
): Promise<CreateTransactionState> {
  if (!isTransactionType(type)) return { status: "error" };

  const repeat = repeatSchema.parse(formData.get("repeat"));
  const parsed = repeat ? validateRecurrenceStart(formData) : validateTransaction(formData);
  if (!parsed.ok) return { status: "invalid", fieldErrors: parsed.fieldErrors };

  const supabase = await createClient();
  const categoryId = await resolveCategoryId(supabase, type, parsed.data.category);
  if (categoryId === undefined) return { status: "error" };

  if (repeat) return createRecurrence(supabase, type, { ...parsed.data, categoryId });

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      type,
      description: parsed.data.description,
      amount_cents: parsed.data.amountCents,
      occurred_at: parsed.data.occurredAt,
      category_id: categoryId,
    })
    .select(TRANSACTION_COLUMNS)
    .single<TransactionRow>();

  if (error || !data) {
    console.error("Erro ao criar movimentação", error);
    return { status: "error" };
  }

  // "layout": invalida todas as abas (Início, Movimentações, Relatórios), não só "/".
  revalidatePath("/", "layout");
  return { status: "success", transaction: toTransaction(data) };
}

type Supabase = Awaited<ReturnType<typeof createClient>>;
type CreateRecurrenceRow = { recurrence_id: string; transaction_id: string | null; inserted: number };

/**
 * Série + primeira ocorrência (e os meses até hoje) numa só RPC atômica. A RPC valida de novo as datas e
 * a categoria; os erros de data voltam como erro de campo.
 */
async function createRecurrence(
  supabase: Supabase,
  type: TransactionType,
  input: { description: string; amountCents: number; occurredAt: string; categoryId: string | null },
): Promise<CreateTransactionState> {
  const { data, error } = await supabase
    .rpc("create_recurrence", {
      p_type: type,
      p_description: input.description,
      p_amount_cents: input.amountCents,
      p_category_id: input.categoryId,
      p_start: input.occurredAt,
    })
    .single<CreateRecurrenceRow>();

  if (error?.message === "start_too_old") {
    return { status: "invalid", fieldErrors: { occurredAt: copy.recurrence.errorDateOld } };
  }
  if (error?.message === "start_in_future") {
    return { status: "invalid", fieldErrors: { occurredAt: copy.tx.errorDateFuture } };
  }
  if (error || !data?.transaction_id) {
    console.error("Erro ao criar recorrência", error);
    return { status: "error" };
  }

  // Daqui em diante a série já foi gravada: nunca devolver erro (um novo envio duplicaria a série).
  revalidatePath("/", "layout");
  const { data: row, error: readError } = await supabase
    .from("transactions")
    .select(TRANSACTION_COLUMNS)
    .eq("id", data.transaction_id)
    .single<TransactionRow>();
  if (readError) console.error("Erro ao ler a primeira ocorrência", readError);
  const transaction: Transaction = row
    ? toTransaction(row)
    : {
        id: data.transaction_id,
        type,
        description: input.description,
        amountCents: input.amountCents,
        occurredAt: input.occurredAt,
        createdAt: new Date().toISOString(),
        categoryId: input.categoryId,
        categoryName: null,
        recurrenceId: data.recurrence_id,
      };
  return {
    status: "success",
    transaction,
    recurrence: { day: Number(input.occurredAt.slice(8, 10)), inserted: Number(data.inserted) },
  };
}

export type UpdateTransactionState = CreateTransactionState;

/** Mesmo schema da criação + `type`, que na edição vem do formulário (controle segmentado). */
export async function updateTransaction(
  id: string,
  _prev: UpdateTransactionState,
  formData: FormData,
): Promise<UpdateTransactionState> {
  const type = formData.get("type");
  if (!uuidSchema.safeParse(id).success || !isTransactionType(type)) return { status: "error" };

  const parsed = validateTransaction(formData);
  if (!parsed.ok) return { status: "invalid", fieldErrors: parsed.fieldErrors };

  // A RLS limita ao dono: um id alheio afeta 0 linhas e o `.single()` vira erro.
  // Trocar o tipo sem escolher categoria do novo tipo chega aqui como "sem categoria" (o formulário limpa
  // o campo), então `category_id = null` e a FK composta não quebra. Categoria do tipo errado: a FK recusa.
  const supabase = await createClient();
  // Ocorrência de recorrência não muda de tipo (a FK composta também recusaria).
  const { data: current, error: currentError } = await supabase
    .from("transactions")
    .select("type,recurrence_id")
    .eq("id", id)
    .single<{ type: TransactionType; recurrence_id: string | null }>();
  if (currentError || !current) return { status: "error" };
  if (current.recurrence_id && current.type !== type) return { status: "error" };

  const categoryId = await resolveCategoryId(supabase, type, parsed.data.category);
  if (categoryId === undefined) return { status: "error" };

  const { data, error } = await supabase
    .from("transactions")
    .update({
      type,
      description: parsed.data.description,
      amount_cents: parsed.data.amountCents,
      occurred_at: parsed.data.occurredAt,
      category_id: categoryId,
    })
    .eq("id", id)
    .select(TRANSACTION_COLUMNS)
    .single<TransactionRow>();

  if (error || !data) {
    console.error("Erro ao editar movimentação", error);
    return { status: "error" };
  }

  revalidatePath("/", "layout");
  return { status: "success", transaction: toTransaction(data) };
}

export type DeleteTransactionResult = { ok: true } | { ok: false };

/** A RLS garante que só apaga o que é do usuário: um id alheio afeta 0 linhas e vira erro. */
export async function deleteTransaction(id: string): Promise<DeleteTransactionResult> {
  if (!uuidSchema.safeParse(id).success) return { ok: false };

  const supabase = await createClient();
  const { error, count } = await supabase.from("transactions").delete({ count: "exact" }).eq("id", id);

  if (error || count !== 1) {
    if (error) console.error("Erro ao excluir movimentação", error);
    return { ok: false };
  }

  revalidatePath("/", "layout");
  return { ok: true };
}
