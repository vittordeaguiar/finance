import "server-only";
import type { PostgrestError } from "@supabase/supabase-js";
import { monthRange, type Month } from "./dates";
import { NO_CATEGORY_EXPENSE, NO_CATEGORY_INCOME } from "./period";
import { ensureRecurrences } from "./recurrence";
import type { TransactionType } from "./money";
import { toCategoryTotals, type CategoryTotal, type CategoryTotalRow } from "./report";
import { createClient } from "./supabase/server";
import {
  PAGE_SIZE,
  RECURRENCE_COLUMNS,
  escapeLike,
  monthTotals,
  sortRecurrences,
  toRecurrence,
  TRANSACTION_COLUMNS,
  toSummary,
  toTransaction,
  type Category,
  type Recurrence,
  type RecurrenceRow,
  type Summary,
  type SummaryRow,
  type Transaction,
  type TransactionRow,
} from "./transactions";

export type DashboardData =
  | {
      ok: true;
      /** Saldo acumulado (todas as movimentações); receitas, despesas e contagens só do mês. */
      summary: Summary;
      /** Total de movimentações da conta, em qualquer mês (0 = conta nova, estado vazio original). */
      totalCount: number;
      transactions: Transaction[];
      hasMore: boolean;
    }
  | { ok: false };

type MonthRow = Pick<TransactionRow, "type" | "amount_cents">;

/**
 * O Auth arredonda o `iat` do token para o segundo mais próximo; logo após login/cadastro o PostgREST
 * pode recusá-lo por até ~0,5s ("JWT issued at future", PGRST303). Nesse caso tentamos de novo uma vez.
 */
const JWT_FUTURE = "PGRST303";
const RETRY_DELAY_MS = 700;

type Supabase = Awaited<ReturnType<typeof createClient>>;

/** Linhas por página: igual ao `max_rows` da Data API, que corta respostas maiores sem avisar. */
const MONTH_PAGE = 1000;

/**
 * Todas as linhas do mês (só tipo e valor) para somar os totais. Pagina porque a Data API limita cada
 * resposta a `max_rows`: um select único subcontaria meses com mais de 1000 movimentações.
 */
async function fetchMonthRows(
  supabase: Supabase,
  start: string,
  end: string,
): Promise<{ data: MonthRow[] | null; error: PostgrestError | null }> {
  const rows: MonthRow[] = [];
  for (let from = 0; ; from += MONTH_PAGE) {
    const { data, error } = await supabase
      .from("transactions")
      .select("type,amount_cents")
      .gte("occurred_at", start)
      .lt("occurred_at", end)
      .order("id")
      .range(from, from + MONTH_PAGE - 1)
      .returns<MonthRow[]>();
    if (error || !data) return { data: null, error };
    rows.push(...data);
    if (data.length < MONTH_PAGE) return { data: rows, error: null };
  }
}

/**
 * Filtro do histórico: id de categoria, `"sem"` (despesas sem categoria), `"sem-receita"` (receitas sem
 * categoria, V7) ou `null` (todas).
 */
export type CategoryFilter = string | null;

export type MonthSummary = { ok: true; summary: Summary; totalCount: number } | { ok: false };

/**
 * Só o resumo do mês (V7, Relatórios): saldo acumulado + receitas e despesas do mês, sem o histórico.
 * Mesma fonte do slab da Início.
 */
export async function getMonthSummary(month: Month, retry = true): Promise<MonthSummary> {
  const { start, end } = monthRange(month);
  const supabase = await createClient();
  const [summaryResult, monthResult] = await Promise.all([
    supabase
      .from("transaction_summary")
      .select("income_cents,expense_cents,balance_cents,income_count,expense_count")
      .maybeSingle<SummaryRow>(),
    fetchMonthRows(supabase, start, end),
  ]);
  const error = summaryResult.error ?? monthResult.error;
  if (retry && error?.code === JWT_FUTURE) {
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    return getMonthSummary(month, false);
  }
  if (error || !monthResult.data) {
    console.error("Erro ao carregar o resumo do mês", error);
    return { ok: false };
  }
  const all = toSummary(summaryResult.data);
  return {
    ok: true,
    summary: { ...monthTotals(monthResult.data), balanceCents: all.balanceCents },
    totalCount: all.incomeCount + all.expenseCount,
  };
}

/**
 * Resumo + totais do mês + histórico do mês em paralelo. A RLS limita tudo ao usuário da sessão.
 * O filtro de categoria e a busca (V8) valem só para a lista: slab e totais continuam do mês inteiro.
 */
export async function getDashboardData(
  month: Month,
  limit: number = PAGE_SIZE,
  category: CategoryFilter = null,
  search: string | null = null,
  retry = true,
): Promise<DashboardData> {
  const { start, end } = monthRange(month);
  const supabase = await createClient();
  let list = supabase
    .from("transactions")
    .select(TRANSACTION_COLUMNS)
    .gte("occurred_at", start)
    .lt("occurred_at", end);
  // "Sem categoria" vem do relatório, separado por tipo: `sem` = despesas, `sem-receita` = receitas.
  if (category === NO_CATEGORY_EXPENSE) list = list.is("category_id", null).eq("type", "expense");
  else if (category === NO_CATEGORY_INCOME) list = list.is("category_id", null).eq("type", "income");
  else if (category) list = list.eq("category_id", category);
  // V8: busca por trecho da descrição, sem diferenciar caixa. Só a lista; slab e totais são do mês inteiro.
  if (search) list = list.ilike("description", `%${escapeLike(search)}%`);
  const [monthSummary, listResult] = await Promise.all([
    getMonthSummary(month, retry),
    list
      .order("occurred_at", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit + 1)
      .returns<TransactionRow[]>(),
  ]);

  if (retry && listResult.error?.code === JWT_FUTURE) {
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    return getDashboardData(month, limit, category, search, false);
  }

  if (!monthSummary.ok || listResult.error || !listResult.data) {
    if (listResult.error) console.error("Erro ao carregar o dashboard", listResult.error);
    return { ok: false };
  }

  const rows = listResult.data;
  return {
    ok: true,
    summary: monthSummary.summary,
    totalCount: monthSummary.totalCount,
    transactions: rows.slice(0, limit).map(toTransaction),
    hasMore: rows.length > limit,
  };
}

/** Categorias do usuário em ordem alfabética (seletor dos formulários). Falha vira lista vazia. */
export async function getCategories(retry = true): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id,type,name")
    .order("name")
    .returns<Category[]>();
  // Mesmo caso do dashboard: logo após login/cadastro o token pode ser recusado por alguns ms.
  if (retry && error?.code === JWT_FUTURE) {
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    return getCategories(false);
  }
  if (error) console.error("Erro ao carregar categorias", error);
  return data ?? [];
}

/** Despesas (ou receitas, V7) do mês por categoria, agregado no banco pela RPC. Falha vira `null`: a seção some. */
export async function getCategoryTotals(
  month: Month,
  type: TransactionType = "expense",
  retry = true,
): Promise<CategoryTotal[] | null> {
  const { start, end } = monthRange(month);
  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("category_totals", { p_start: start, p_end: end, p_type: type });
  if (retry && error?.code === JWT_FUTURE) {
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    return getCategoryTotals(month, type, false);
  }
  if (error || !data) {
    console.error("Erro ao carregar totais por categoria", error);
    return null;
  }
  return toCategoryTotals(data as CategoryTotalRow[]);
}

/** Quantas movimentações usam cada categoria (Configurações). Falha vira mapa vazio. */
export async function getCategoryUsage(): Promise<Record<string, number>> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("category_usage");
  if (error || !data) {
    if (error) console.error("Erro ao carregar uso das categorias", error);
    return {};
  }
  const rows = data as { category_id: string; tx_count: number | string }[];
  return Object.fromEntries(rows.map((row) => [row.category_id, Number(row.tx_count)]));
}

/** Nome e email do usuário da sessão (Configurações). */
export async function getProfile(): Promise<{ name: string; email: string | null } | null> {
  const supabase = await createClient();
  const [{ data: auth }, { data, error }] = await Promise.all([
    supabase.auth.getClaims(),
    supabase.from("profiles").select("name").maybeSingle<{ name: string }>(),
  ]);
  if (error || !data) {
    if (error) console.error("Erro ao carregar perfil", error);
    return null;
  }
  return { name: data.name, email: auth?.claims.email ?? null };
}

/** Séries ativas (Configurações), despesas primeiro e cada grupo pelo dia. Falha vira `null`. */
export async function getRecurrences(): Promise<Recurrence[] | null> {
  // Lança o que venceu antes de listar: encerrar uma série não pode perder uma ocorrência já devida.
  await ensureRecurrences();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recurrences")
    .select(RECURRENCE_COLUMNS)
    .is("ended_at", null)
    .returns<RecurrenceRow[]>();
  if (error || !data) {
    console.error("Erro ao carregar recorrências", error);
    return null;
  }
  return sortRecurrences(data.map(toRecurrence));
}
