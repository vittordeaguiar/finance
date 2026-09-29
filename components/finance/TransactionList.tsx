"use client";

import { AnimatePresence, motion } from "motion/react";
import { copy } from "@/lib/copy";
import { cn } from "@/lib/cn";
import { formatDateMobile } from "@/lib/dates";
import { formatSigned } from "@/lib/money";
import type { Transaction } from "@/lib/transactions";
import { useDashboard } from "./DashboardProvider";
import { ROW_MOTION } from "./row-motion";

type TransactionListProps = {
  transactions: Transaction[];
  /** Toque na linha abre o detalhe (Fase 5). */
  onSelect?: (tx: Transaction) => void;
};

/** Histórico no mobile: cada linha é um botão que abre o detalhe. */
export function TransactionList({ transactions, onSelect }: TransactionListProps) {
  const { highlightId, today } = useDashboard();
  return (
    <ul className="flex flex-col border border-border bg-surface">
      <AnimatePresence initial={false}>
        {transactions.map((tx) => (
          <motion.li
            key={tx.id}
            {...ROW_MOTION}
            className="overflow-hidden border-b border-border-subtle last:border-b-0"
          >
            <button
              type="button"
              aria-label={copy.dash.rowDetailLabel(tx.description)}
              onClick={() => onSelect?.(tx)}
              data-highlight={tx.id === highlightId || undefined}
              className={cn(
                "group flex min-h-[68px] w-full cursor-pointer items-center justify-between gap-3 py-3 pr-3 pl-4 text-left transition-colors duration-(--duration-slow)",
                tx.id === highlightId && (tx.type === "income" ? "bg-income-bg" : "bg-expense-bg"),
              )}
            >
              <span className="flex min-w-0 flex-col gap-1.5">
                <span className="truncate text-base font-medium">{tx.description}</span>
                <span className="truncate font-mono text-[11px] tracking-[0.06em] text-text-secondary">
                  {tx.occurredAt === today ? copy.dash.rowToday : formatDateMobile(tx.occurredAt)} ·{" "}
                  <span className={cn("font-medium", tx.type === "income" ? "text-income" : "text-expense")}>
                    {copy.type[tx.type]}
                  </span>
                  {tx.categoryName && <> · {tx.categoryName.toUpperCase()}</>}
                  {tx.recurrenceId && <> · {copy.recurrence.tag}</>}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <span
                  className={cn(
                    "tabular text-[17px] font-semibold whitespace-nowrap",
                    tx.type === "income" ? "text-income" : "text-expense",
                  )}
                >
                  {formatSigned(tx.type, tx.amountCents)}
                </span>
                <span
                  aria-hidden="true"
                  className="text-lg text-border-strong transition-transform duration-(--duration-instant) group-hover:translate-x-0.5"
                >
                  ›
                </span>
              </span>
            </button>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
