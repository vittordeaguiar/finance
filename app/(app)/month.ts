import "server-only";
import { redirect } from "next/navigation";
import { monthOf, parseMonthParam, todayInSaoPaulo } from "@/lib/dates";
import { makePeriod, type AppPath, type Period } from "@/lib/period";

/**
 * Mês da aba a partir do `?mes=`. Sem parâmetro = mês atual; inválido ou futuro redireciona para a
 * mesma aba sem `mes`.
 */
export function resolvePeriod(mes: string | string[] | undefined, path: AppPath): Period {
  const current = monthOf(todayInSaoPaulo());
  const month = mes === undefined ? current : parseMonthParam(mes, current);
  if (month === null) redirect(path);
  return makePeriod(month, current, path);
}

/** `?itens=` (histórico paginado): múltiplo de PAGE_SIZE entre PAGE_SIZE e MAX_ITEMS. */
export function parseLimit(raw: string | string[] | undefined, pageSize: number, max: number): number {
  const n = Number(Array.isArray(raw) ? raw[0] : raw);
  if (!Number.isInteger(n) || n <= pageSize) return pageSize;
  return Math.min(Math.ceil(n / pageSize) * pageSize, max);
}
