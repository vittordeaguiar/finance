"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { THEME_COOKIE, THEMES, type Theme } from "@/lib/theme";
import { z } from "zod";
import { UNIQUE_VIOLATION, resolveCategoryId } from "@/lib/categories";
import { copy } from "@/lib/copy";
import type { TransactionType } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";
import {
  validateCategoryName,
  validateNewPassword,
  validateProfileName,
  validateRecurrenceEdit,
  type FieldErrors,
  type RecurrenceField,
} from "@/lib/validation";

/** Estado de um formulário de um campo só (nome de categoria, nome do perfil). */
export type FieldState =
  | { status: "idle" }
  | { status: "invalid"; error: string }
  | { status: "error" }
  | { status: "success"; seq: number };

export type PasswordState =
  | { status: "idle" }
  | { status: "invalid"; fieldErrors: FieldErrors<"password" | "confirm"> }
  | { status: "error" }
  | { status: "success"; seq: number };

const uuidSchema = z.uuid();

function isTransactionType(value: unknown): value is TransactionType {
  return value === "income" || value === "expense";
}

/** Categorias aparecem no layout (seletor do "+"): invalida todas as abas. */
function revalidateApp() {
  revalidatePath("/", "layout");
}

/** Adicionar: nome repetido (ignorando caixa e espaços) reusa a existente, sem erro. */
export async function createCategory(
  type: TransactionType,
  _prev: FieldState,
  formData: FormData,
): Promise<FieldState> {
  if (!isTransactionType(type)) return { status: "error" };
  const parsed = validateCategoryName(formData.get("name"));
  if (!parsed.ok) return { status: "invalid", error: parsed.error };

  const supabase = await createClient();
  const id = await resolveCategoryId(supabase, type, { kind: "new", name: parsed.name });
  if (id === undefined) return { status: "error" };

  revalidateApp();
  return { status: "success", seq: Date.now() };
}

/** Renomear: nome já usado no mesmo tipo vira erro de campo. A RLS limita ao dono. */
export async function renameCategory(id: string, _prev: FieldState, formData: FormData): Promise<FieldState> {
  if (!uuidSchema.safeParse(id).success) return { status: "error" };
  const parsed = validateCategoryName(formData.get("name"));
  if (!parsed.ok) return { status: "invalid", error: parsed.error };

  const supabase = await createClient();
  const { error, count } = await supabase
    .from("categories")
    .update({ name: parsed.name }, { count: "exact" })
    .eq("id", id);

  if (error?.code === UNIQUE_VIOLATION) {
    return { status: "invalid", error: copy.settings.categories.errorDuplicate };
  }
  if (error || count !== 1) {
    if (error) console.error("Erro ao renomear categoria", error);
    return { status: "error" };
  }

  revalidateApp();
  return { status: "success", seq: Date.now() };
}

export type DeleteCategoryResult = { ok: true } | { ok: false };

/** Excluir: as movimentações ficam sem categoria (`on delete set null`). A RLS limita ao dono. */
export async function deleteCategory(id: string): Promise<DeleteCategoryResult> {
  if (!uuidSchema.safeParse(id).success) return { ok: false };

  const supabase = await createClient();
  const { error, count } = await supabase.from("categories").delete({ count: "exact" }).eq("id", id);
  if (error || count !== 1) {
    if (error) console.error("Erro ao excluir categoria", error);
    return { ok: false };
  }

  revalidateApp();
  return { ok: true };
}

// ---------- Recorrências (V6) ----------

export type RecurrenceState =
  | { status: "idle" }
  | { status: "invalid"; fieldErrors: FieldErrors<RecurrenceField> }
  | { status: "error" }
  | { status: "success"; description: string };

/**
 * Editar a série: descrição, valor e categoria, só para os próximos lançamentos. Tipo e dia não mudam.
 * A RLS limita ao dono e a séries ativas: id alheio ou série encerrada afeta 0 linhas e vira erro.
 */
export async function updateRecurrence(
  id: string,
  _prev: RecurrenceState,
  formData: FormData,
): Promise<RecurrenceState> {
  if (!uuidSchema.safeParse(id).success) return { status: "error" };
  const parsed = validateRecurrenceEdit(formData);
  if (!parsed.ok) return { status: "invalid", fieldErrors: parsed.fieldErrors };

  const supabase = await createClient();
  // A categoria nova (ou escolhida) precisa ser do tipo da série: o tipo vem do banco, não do formulário.
  const { data: series, error: readError } = await supabase
    .from("recurrences")
    .select("type")
    .eq("id", id)
    .is("ended_at", null)
    .single<{ type: TransactionType }>();
  if (readError || !series) return { status: "error" };

  const categoryId = await resolveCategoryId(supabase, series.type, parsed.data.category);
  if (categoryId === undefined) return { status: "error" };

  const { error, count } = await supabase
    .from("recurrences")
    .update(
      { description: parsed.data.description, amount_cents: parsed.data.amountCents, category_id: categoryId },
      { count: "exact" },
    )
    .eq("id", id);
  if (error || count !== 1) {
    if (error) console.error("Erro ao editar recorrência", error);
    return { status: "error" };
  }

  // Categoria nova aparece no layout (seletor do "+").
  revalidateApp();
  return { status: "success", description: parsed.data.description };
}

export type EndRecurrenceResult = { ok: true } | { ok: false };

/** Encerrar: para de lançar e mantém as movimentações já feitas. Não há reativar. */
export async function endRecurrence(id: string): Promise<EndRecurrenceResult> {
  if (!uuidSchema.safeParse(id).success) return { ok: false };

  const supabase = await createClient();
  // A página pode estar aberta desde antes de uma data vencer: lança o devido antes de encerrar.
  const { error: materializeError } = await supabase.rpc("materialize_recurrences");
  if (materializeError) {
    console.error("Erro ao lançar recorrências antes de encerrar", materializeError);
    return { ok: false };
  }
  const { error, count } = await supabase
    .from("recurrences")
    .update({ ended_at: new Date().toISOString() }, { count: "exact" })
    .eq("id", id);
  if (error || count !== 1) {
    if (error) console.error("Erro ao encerrar recorrência", error);
    return { ok: false };
  }

  revalidatePath("/configuracoes");
  return { ok: true };
}

export async function updateProfileName(_prev: FieldState, formData: FormData): Promise<FieldState> {
  const parsed = validateProfileName(formData.get("name"));
  if (!parsed.ok) return { status: "invalid", error: parsed.error };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error" };

  const { error, count } = await supabase
    .from("profiles")
    .update({ name: parsed.name }, { count: "exact" })
    .eq("id", user.id);
  if (error || count !== 1) {
    if (error) console.error("Erro ao atualizar perfil", error);
    return { status: "error" };
  }

  revalidatePath("/configuracoes");
  return { status: "success", seq: Date.now() };
}

export async function updatePassword(_prev: PasswordState, formData: FormData): Promise<PasswordState> {
  const parsed = validateNewPassword(formData);
  if (!parsed.ok) return { status: "invalid", fieldErrors: parsed.fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.password });
  if (error) {
    console.error("Erro ao alterar senha", error);
    return { status: "error" };
  }
  return { status: "success", seq: Date.now() };
}

/** Grava a preferência de tema (um ano). O cliente já aplicou; o cookie vale para os próximos carregamentos. */
export async function setTheme(theme: Theme): Promise<void> {
  if (!THEMES.includes(theme)) return;
  (await cookies()).set(THEME_COOKIE, theme, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
}
