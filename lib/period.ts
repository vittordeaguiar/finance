import { monthLabel, shiftMonth, type Month } from "./dates";

/** Rotas das abas. `/` é a Início. */
export type AppPath = "/" | "/movimentacoes" | "/relatorios" | "/configuracoes";

export const TRANSACTIONS_PATH = "/movimentacoes";
export const REPORTS_PATH = "/relatorios";
export const SETTINGS_PATH = "/configuracoes";

export type Period = {
  month: Month;
  current: Month;
  label: { name: string; short: string; year: string };
  /** Aba em que o seletor de mês está: trocar de mês mantém a aba. */
  path: AppPath;
  /** V8: busca ativa em Movimentações; trocar de mês a mantém. */
  q?: string | null;
};

export function makePeriod(month: Month, current: Month, path: AppPath = "/", q: string | null = null): Period {
  return { month, current, label: monthLabel(month), path, q };
}

/** Filtro "Sem categoria" do histórico, por tipo: `sem` = despesas (V3), `sem-receita` = receitas (V7). */
export const NO_CATEGORY_EXPENSE = "sem";
export const NO_CATEGORY_INCOME = "sem-receita";

/**
 * URL de uma aba com mês, filtro de categoria e/ou página do histórico. O mês atual fica sem `mes=`.
 * Nenhum outro parâmetro atravessa abas: quem monta o link decide o que leva.
 */
export function navHref({
  path = "/",
  month,
  current,
  categoria,
  q,
  itens,
}: {
  path?: AppPath;
  month: Month;
  current: Month;
  categoria?: string | null;
  /** V8: busca por descrição (Movimentações). */
  q?: string | null;
  itens?: number;
}): string {
  const params = new URLSearchParams();
  if (month !== current) params.set("mes", month);
  if (categoria) params.set("categoria", categoria);
  if (q) params.set("q", q);
  if (itens) params.set("itens", String(itens));
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

/** URL de uma aba para um mês. */
export function monthHref(month: Month, current: Month, path: AppPath = "/"): string {
  return navHref({ path, month, current });
}

/** URL da aba em outro mês, mantendo a busca (V8). */
export function periodHref(p: Period, month: Month): string {
  return navHref({ path: p.path, month, current: p.current, q: p.q });
}

export function prevMonthHref(p: Period): string {
  return periodHref(p, shiftMonth(p.month, -1));
}

export function nextMonthHref(p: Period): string | null {
  return p.month >= p.current ? null : periodHref(p, shiftMonth(p.month, 1));
}

const MONTH_PARAM = /^\d{4}-(0[1-9]|1[0-2])$/;

/**
 * Mês do `?mes=` para os links da navegação (cliente). Só repassa o formato: a página valida de verdade
 * (futuro ou inválido redireciona).
 */
export function monthParamForNav(raw: string | null, current: Month): Month {
  return raw && MONTH_PARAM.test(raw) && raw <= current ? raw : current;
}
