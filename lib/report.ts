import type { TransactionType } from "./money";
import type { Transaction } from "./transactions";

/** Total de despesas de uma categoria no mês (`categoryId` nulo = "Sem categoria"). */
export type CategoryTotal = {
  categoryId: string | null;
  name: string | null;
  totalCents: number;
  count: number;
};

export type CategoryTotalRow = {
  category_id: string | null;
  name: string | null;
  total_cents: number | string;
  tx_count: number | string;
};

/** Converte as linhas da RPC (maior total primeiro) e põe "Sem categoria" sempre por último. */
export function toCategoryTotals(rows: readonly CategoryTotalRow[]): CategoryTotal[] {
  const totals = rows.map((row) => ({
    categoryId: row.category_id,
    name: row.name,
    totalCents: Number(row.total_cents),
    count: Number(row.tx_count),
  }));
  return [...totals.filter((t) => t.categoryId !== null), ...totals.filter((t) => t.categoryId === null)];
}

/** Participação no total em milésimos inteiros (342 = 34,2%). Percentual não é dinheiro. */
export function shareMillis(totalCents: number, sumCents: number): number {
  return sumCents > 0 ? Math.round((totalCents * 1000) / sumCents) : 0;
}

/** 342 -> "34,2%" */
export function formatShare(millis: number): string {
  return `${Math.floor(millis / 10)},${millis % 10}%`;
}

/**
 * As `n` maiores categorias (Início). "Sem categoria" entra se estiver entre elas, mas sempre por
 * último, como no relatório completo. Os percentuais continuam sobre o total do mês.
 */
export function topCategoryTotals(totals: readonly CategoryTotal[], n: number): CategoryTotal[] {
  const top = [...totals].sort((a, b) => b.totalCents - a.totalCents).slice(0, n);
  return [...top.filter((t) => t.categoryId !== null), ...top.filter((t) => t.categoryId === null)];
}

/**
 * Totais sem a movimentação `tx` (V8: exclusão pendente). Só mexe se `tx` for do `type` do relatório;
 * a categoria que fica sem movimentações sai da lista.
 */
export function totalsWithout(
  totals: readonly CategoryTotal[],
  tx: Pick<Transaction, "type" | "amountCents" | "categoryId"> | null,
  type: TransactionType,
): CategoryTotal[] {
  if (!tx || tx.type !== type) return [...totals];
  return totals
    .map((row) =>
      row.categoryId === tx.categoryId
        ? { ...row, totalCents: row.totalCents - tx.amountCents, count: row.count - 1 }
        : row,
    )
    .filter((row) => row.count > 0);
}
