"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { CategoryTag } from "@/components/ui/CategoryTag";
import { TypeTag } from "@/components/ui/TypeTag";
import { copy } from "@/lib/copy";
import { cn } from "@/lib/cn";
import { formatDateDesktop } from "@/lib/dates";
import { formatSigned } from "@/lib/money";
import type { Transaction } from "@/lib/transactions";
import { useDashboard } from "./DashboardProvider";
import { ROW_MOTION } from "./row-motion";
import { TABLE_GRID, TableHeader } from "./TableHeader";

type TransactionTableProps = {
  transactions: Transaction[];
  /** Ação no fim de cada linha (botão "Excluir", Fase 5). */
  renderAction?: (tx: Transaction) => ReactNode;
};

/** Histórico no desktop (tabela). */
export function TransactionTable({ transactions, renderAction }: TransactionTableProps) {
  const { highlightId } = useDashboard();

  return (
    <div role="table" aria-label={copy.dash.historyTitle} className="border border-border bg-surface">
      <div role="rowgroup">
        <TableHeader />
      </div>
      <div role="rowgroup">
        <AnimatePresence initial={false}>
          {transactions.map((tx) => (
            <motion.div
              key={tx.id}
              role="row"
              {...ROW_MOTION}
              data-highlight={tx.id === highlightId || undefined}
              className={cn(
                TABLE_GRID,
                "h-14 overflow-hidden border-b border-border-subtle transition-colors duration-(--duration-slow) last:border-b-0",
                tx.id === highlightId && (tx.type === "income" ? "bg-income-bg" : "bg-expense-bg"),
              )}
            >
              <span role="cell" className="font-mono text-[13px] text-text-secondary">
                {formatDateDesktop(tx.occurredAt)}
              </span>
              <span role="cell" className="flex min-w-0 items-center gap-3">
                <span className="truncate text-base font-medium">{tx.description}</span>
                {tx.categoryName && <CategoryTag name={tx.categoryName} />}
                {tx.recurrenceId && <CategoryTag name={copy.recurrence.tag} className="shrink-0" />}
                <TypeTag type={tx.type} className="wide:hidden" />
              </span>
              <span role="cell" className="hidden wide:block">
                <TypeTag type={tx.type} />
              </span>
              <span
                role="cell"
                className={cn(
                  "tabular text-right text-[17px] font-semibold whitespace-nowrap",
                  tx.type === "income" ? "text-income" : "text-expense",
                )}
              >
                {formatSigned(tx.type, tx.amountCents)}
              </span>
              <span role="cell" className="flex justify-end">
                {renderAction?.(tx)}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
