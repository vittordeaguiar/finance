"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import Link from "next/link";
import { SectionIndex } from "@/components/brand/SectionIndex";
import { copy } from "@/lib/copy";
import { cn } from "@/lib/cn";
import { formatSigned, type TransactionType } from "@/lib/money";
import { SLOW, STAGGER } from "@/lib/motion";
import { NO_CATEGORY_EXPENSE, NO_CATEGORY_INCOME, TRANSACTIONS_PATH, navHref, type Period } from "@/lib/period";
import { formatShare, shareMillis, topCategoryTotals, totalsWithout, type CategoryTotal } from "@/lib/report";
import { usePendingDeletes } from "./DashboardProvider";

type CategoryReportProps = {
  totals: CategoryTotal[];
  /** V7: receitas por categoria em Relatórios (padrão: despesas). */
  type?: TransactionType;
  period: Period;
  /** Índice da seção: "02" no dashboard, "01" na aba Relatórios. */
  index?: string;
  /** Início: só as N maiores (percentuais continuam sobre o total do mês). */
  limit?: number;
  /** Título no lugar de "Para onde foi o dinheiro…" (mesmo texto no mobile). */
  title?: string;
  /** Conteúdo à direita do título no lugar do resumo "N CATEGORIAS · TOTAL". */
  aside?: ReactNode;
};

/**
 * "Para onde foi o dinheiro" (despesas) ou "De onde veio o dinheiro" (receitas, V7): totais do mês por
 * categoria. Cada linha filtra o histórico.
 */
export function CategoryReport({
  totals: serverTotals,
  type = "expense",
  period,
  index,
  limit,
  title: customTitle,
  aside,
}: CategoryReportProps) {
  const t = copy.report;
  const income = type === "income";
  const { pending } = usePendingDeletes();
  // V8: a exclusão pendente já sai dos totais, antes de ir ao servidor.
  const totals = pending.reduce<CategoryTotal[]>((acc, tx) => totalsWithout(acc, tx, type), serverTotals);
  const sum = totals.reduce((acc, row) => acc + row.totalCents, 0);
  const title = customTitle ?? (income ? t.incomeTitle(period.label.name) : t.title(period.label.name));
  const titleMobile = customTitle ?? (income ? t.incomeTitleMobile : t.titleMobile);
  const sectionId = income ? "relatorio-receitas" : "relatorio";
  const rowLabel = income ? t.incomeRowLabel : t.rowLabel;
  const countLabel = income ? copy.dash.incomeCount : copy.dash.expenseCount;
  const noCategory = income ? NO_CATEGORY_INCOME : NO_CATEGORY_EXPENSE;
  const rows = limit ? topCategoryTotals(totals, limit) : totals;

  return (
    <section aria-labelledby={sectionId} className="flex flex-col gap-3 px-5 pt-6 md:gap-4 md:p-0">
      <SectionIndex
        id={sectionId}
        index={index ?? t.index}
        title={
          <>
            <span className="md:hidden">{titleMobile}</span>
            <span className="hidden md:inline">{title}</span>
          </>
        }
        aside={
          aside ?? (
            <span className="font-mono text-xs tracking-label whitespace-nowrap text-text-secondary max-md:hidden">
              {t.aside(totals.length, formatSigned(type, sum))}
            </span>
          )
        }
      />
      <ol aria-label={title} className="flex flex-col border border-border bg-surface">
        {rows.map((row, i) => {
          const name = row.name ?? copy.category.none;
          const millis = shareMillis(row.totalCents, sum);
          const href = navHref({
            path: TRANSACTIONS_PATH,
            month: period.month,
            current: period.current,
            categoria: row.categoryId ?? noCategory,
          });
          return (
            <li key={row.categoryId ?? "sem"} className="border-b border-border-subtle last:border-b-0">
              <Link
                href={href}
                scroll={false}
                aria-label={rowLabel(name)}
                className="grid grid-cols-[minmax(0,1fr)_3.5rem] items-center text-text no-underline gap-x-4 gap-y-2 px-4 py-3 transition-colors duration-[120ms] hover:bg-background focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent md:h-14 md:grid-cols-[minmax(0,1fr)_2fr_9rem_3.5rem] md:gap-6 md:px-6 md:py-0"
              >
                {/* Mobile: nome e valor na primeira linha; desktop: `contents` devolve os dois à grade. */}
                <span className="col-span-2 flex min-w-0 items-baseline justify-between gap-3 md:contents">
                  <span className="flex min-w-0 items-baseline gap-3">
                    <span className="truncate text-base font-medium">{name}</span>
                    <span className="shrink-0 text-[13px] whitespace-nowrap text-text-secondary">
                      {countLabel(row.count)}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "tabular shrink-0 text-right text-[17px] font-semibold whitespace-nowrap md:col-start-3 md:row-start-1",
                      income ? "text-income" : "text-expense",
                    )}
                  >
                    {formatSigned(type, row.totalCents)}
                  </span>
                </span>
                <span aria-hidden="true" className="h-2 w-full bg-surface-muted md:col-start-2 md:row-start-1">
                  <motion.span
                    key={period.month}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ ...SLOW, delay: i * STAGGER }}
                    style={{ width: `${millis / 10}%` }}
                    className={cn("block h-2 origin-left rounded-none", income ? "bg-income" : "bg-expense")}
                  />
                </span>
                <span className="text-right font-mono text-xs text-text-secondary md:col-start-4 md:row-start-1">
                  {formatShare(millis)}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
