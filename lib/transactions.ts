import type { TransactionType } from "./money";

export type Transaction = {
  id: string;
  type: TransactionType;
  description: string;
  amountCents: number;
  /** YYYY-MM-DD */
  occurredAt: string;
  createdAt: string;
  categoryId: string | null;
  categoryName: string | null;
  /** Série de origem (V6); `null` = movimentação avulsa. */
  recurrenceId: string | null;
};

/** Série de recorrência mensal ativa (V6). */
export type Recurrence = {
  id: string;
  type: TransactionType;
  description: string;
  amountCents: number;
  categoryId: string | null;
  categoryName: string | null;
  dayOfMonth: number;
  /** YYYY-MM-DD: próxima data a lançar */
  nextDueOn: string;
};

export type Category = { id: string; type: TransactionType; name: string };

export type Summary = {
  incomeCents: number;
  expenseCents: number;
  balanceCents: number;
  incomeCount: number;
  expenseCount: number;
};

export const EMPTY_SUMMARY: Summary = {
  incomeCents: 0,
  expenseCents: 0,
  balanceCents: 0,
  incomeCount: 0,
  expenseCount: 0,
};

export const PAGE_SIZE = 50;

/** Colunas lidas de `transactions`, na ordem do select. */
export const TRANSACTION_COLUMNS = "id,type,description,amount_cents,occurred_at,created_at,category_id,recurrence_id,category:categories(name)";

export type TransactionRow = {
  id: string;
  type: TransactionType;
  description: string;
  amount_cents: number;
  occurred_at: string;
  created_at: string;
  category_id: string | null;
  recurrence_id: string | null;
  category: { name: string } | null;
};

export type SummaryRow = {
  income_cents: number;
  expense_cents: number;
  balance_cents: number;
  income_count: number;
  expense_count: number;
};

export function toTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    type: row.type,
    description: row.description,
    amountCents: Number(row.amount_cents),
    occurredAt: row.occurred_at,
    createdAt: row.created_at,
    categoryId: row.category_id,
    categoryName: row.category_id ? (row.category?.name ?? null) : null,
    recurrenceId: row.recurrence_id,
  };
}

/** A view não devolve linha para quem não tem movimentações: tudo zero. */
export function toSummary(row: SummaryRow | null): Summary {
  if (!row) return EMPTY_SUMMARY;
  return {
    incomeCents: Number(row.income_cents),
    expenseCents: Number(row.expense_cents),
    balanceCents: Number(row.balance_cents),
    incomeCount: Number(row.income_count),
    expenseCount: Number(row.expense_count),
  };
}

/** Saldo depois de remover a movimentação (tela de confirmação de exclusão). */
export function balanceAfterDelete(balanceCents: number, tx: Pick<Transaction, "type" | "amountCents">): number {
  return tx.type === "income" ? balanceCents - tx.amountCents : balanceCents + tx.amountCents;
}

/** Resumo sem a movimentação `tx` do mês exibido (V8: exclusão pendente, antes de ir ao servidor). */
export function summaryWithout(summary: Summary, tx: Pick<Transaction, "type" | "amountCents">): Summary {
  const balanceCents = balanceAfterDelete(summary.balanceCents, tx);
  return tx.type === "income"
    ? { ...summary, balanceCents, incomeCents: summary.incomeCents - tx.amountCents, incomeCount: summary.incomeCount - 1 }
    : { ...summary, balanceCents, expenseCents: summary.expenseCents - tx.amountCents, expenseCount: summary.expenseCount - 1 };
}

/** Saldo depois de trocar a movimentação `before` por `after` (tela de edição). */
export function balanceAfterEdit(
  balanceCents: number,
  before: Pick<Transaction, "type" | "amountCents">,
  after: Pick<Transaction, "type" | "amountCents">,
): number {
  const signed = (tx: Pick<Transaction, "type" | "amountCents">) =>
    tx.type === "income" ? tx.amountCents : -tx.amountCents;
  return balanceCents - signed(before) + signed(after);
}

/** Receitas, despesas e contagens de um conjunto de linhas (resumo do mês). Sem o saldo. */
export function monthTotals(
  rows: ReadonlyArray<{ type: TransactionType; amount_cents: number }>,
): Omit<Summary, "balanceCents"> {
  const totals = { incomeCents: 0, expenseCents: 0, incomeCount: 0, expenseCount: 0 };
  for (const row of rows) {
    if (row.type === "income") {
      totals.incomeCents += Number(row.amount_cents);
      totals.incomeCount += 1;
    } else {
      totals.expenseCents += Number(row.amount_cents);
      totals.expenseCount += 1;
    }
  }
  return totals;
}

// ---------- Recorrências (V6) ----------

/** Colunas lidas de `recurrences`, na ordem do select. */
export const RECURRENCE_COLUMNS = "id,type,description,amount_cents,category_id,day_of_month,next_due_on,category:categories(name)";

export type RecurrenceRow = {
  id: string;
  type: TransactionType;
  description: string;
  amount_cents: number;
  category_id: string | null;
  day_of_month: number;
  next_due_on: string;
  category: { name: string } | null;
};

export function toRecurrence(row: RecurrenceRow): Recurrence {
  return {
    id: row.id,
    type: row.type,
    description: row.description,
    amountCents: Number(row.amount_cents),
    categoryId: row.category_id,
    categoryName: row.category_id ? (row.category?.name ?? null) : null,
    dayOfMonth: Number(row.day_of_month),
    nextDueOn: row.next_due_on,
  };
}

/** Configurações: despesas primeiro, depois receitas; cada grupo pelo dia do mês. */
export function sortRecurrences(list: Recurrence[]): Recurrence[] {
  const rank = (r: Recurrence) => (r.type === "expense" ? 0 : 1);
  return [...list].sort(
    (a, b) => rank(a) - rank(b) || a.dayOfMonth - b.dayOfMonth || a.description.localeCompare(b.description, "pt-BR"),
  );
}

/**
 * Termo da busca (V8) pronto para `ilike`: escapa `\`, `%` e `_` (o Postgres usa `\` como escape no LIKE) e
 * remove `*`, que o PostgREST trata como curinga e não tem escape.
 */
export function escapeLike(term: string): string {
  return term.replace(/\*/g, "").replace(/[\\%_]/g, (c) => `\\${c}`);
}
