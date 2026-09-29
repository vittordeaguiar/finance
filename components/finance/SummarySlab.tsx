"use client";

import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/Enter";
import { Skeleton } from "@/components/ui/Skeleton";
import { copy } from "@/lib/copy";
import { cn } from "@/lib/cn";
import { AnimatedMoney } from "./AnimatedMoney";
import type { Period } from "@/lib/period";
import { summaryWithout, type Summary } from "@/lib/transactions";
import { usePendingDeletes } from "./DashboardProvider";

export type SummaryState = { kind: "ready"; summary: Summary } | { kind: "loading" } | { kind: "error" };

/**
 * Resumo financeiro (slab preto).
 * Desktop: grade 1.4fr 1fr 1fr com divisórias verticais. Mobile: saldo em cima, receitas/despesas em 2 colunas.
 */
export function SummarySlab({ state, period }: { state: SummaryState; period?: Period }) {
  const t = copy.dash;
  const { pending } = usePendingDeletes();
  // V8: a exclusão pendente já sai do resumo, antes de ir ao servidor.
  const summary = state.kind === "ready" ? pending.reduce((acc, tx) => summaryWithout(acc, tx), state.summary) : null;
  const negative = summary !== null && summary.balanceCents < 0;
  const month = period?.label;
  const result = summary ? summary.incomeCents - summary.expenseCents : null;

  return (
    <section
      aria-label={t.summaryLabel}
      aria-busy={state.kind === "loading" || undefined}
      className="border border-slab-border bg-slab text-slab-text md:grid md:grid-cols-[1.4fr_1fr_1fr]"
    >
      {/* @container: o tamanho do saldo depende da largura da coluna (com a barra lateral, a viewport engana). */}
      <div className="@container flex flex-col gap-2.5 px-5 pt-6 pb-5 md:gap-4 md:px-6 md:py-8 wide:px-10">
        <span className="font-mono text-[11px] tracking-label text-slab-accent md:text-xs">
          {month ? (
            <>
              <span className="md:hidden">{t.balanceLabelMobileV2}</span>
              <span className="hidden md:inline">{t.balanceLabel}</span>
            </>
          ) : (
            t.balanceLabel
          )}
        </span>
        {state.kind === "loading" ? (
          <Skeleton tone="slab" className="h-10 w-[220px] max-w-full md:h-14 md:w-[300px]" />
        ) : (
          <Reveal>
            <span
              className={cn(
                "tabular block text-[40px] leading-none font-semibold tracking-display md:text-[44px] @min-[27rem]:text-[56px]",
                negative ? "text-expense-on-slab" : "text-slab-text",
              )}
            >
              {summary ? <AnimatedMoney cents={summary.balanceCents} kind="balance" /> : t.unavailableValue}
            </span>
          </Reveal>
        )}
        {negative && summary ? (
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
            <span className="inline-flex h-6 shrink-0 items-center self-start rounded-sm bg-expense-on-slab px-2 font-mono whitespace-nowrap text-[11px] font-medium tracking-label text-slab md:self-auto">
              {t.balanceNegativeTag}
            </span>
            <span className="text-sm leading-normal text-slab-text-muted">
              {t.balanceNegativeCaption(-summary.balanceCents)}
            </span>
          </div>
        ) : (
          <span className="hidden text-sm text-slab-text-muted md:block">
            {month ? t.balanceCaptionV2 : t.balanceCaption}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 border-t border-slab-border md:contents">
        <TotalCell
          label={month ? t.incomeLabelV2(month.short) : t.incomeLabel}
          labelMobile={month ? t.incomeLabelMobileV2(month.short) : t.incomeLabelMobile}
          tone="income"
          state={state}
          value={summary && <AnimatedMoney cents={summary.incomeCents} kind="income" />}
          caption={summary && t.incomeCount(summary.incomeCount)}
        />
        <TotalCell
          label={month ? t.expenseLabelV2(month.short) : t.expenseLabel}
          labelMobile={month ? t.expenseLabelMobileV2(month.short) : t.expenseLabelMobile}
          tone="expense"
          state={state}
          value={summary && <AnimatedMoney cents={summary.expenseCents} kind="expense" />}
          caption={summary && t.expenseCount(summary.expenseCount)}
          className="border-l border-slab-border"
        />
      </div>

      {month && (
        <div className="flex items-baseline justify-between gap-3 border-t border-slab-border px-5 py-2.5 md:col-span-full md:justify-start md:px-6 md:py-3.5 wide:px-10">
          <span className="font-mono text-[11px] tracking-label text-slab-text-muted md:text-xs">
            <span className="md:hidden">{t.resultLabelMobile}</span>
            <span className="hidden md:inline">{t.resultLabel(month.name, month.year)}</span>
          </span>
          <span className="tabular text-[15px] font-semibold text-slab-text md:text-base">
            {result === null ? "—" : <AnimatedMoney cents={result} kind="result" />}
          </span>
          <span className="hidden text-sm text-slab-text-muted md:inline">{t.resultCaption}</span>
        </div>
      )}
    </section>
  );
}

type TotalCellProps = {
  label: string;
  labelMobile: string;
  tone: "income" | "expense";
  state: SummaryState;
  value: ReactNode;
  caption: ReactNode;
  className?: string;
};

function TotalCell({ label, labelMobile, tone, state, value, caption, className }: TotalCellProps) {
  const t = copy.dash;
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-2 px-5 py-4 md:gap-4 md:border-l md:border-slab-border md:px-6 md:py-8 wide:px-10",
        className,
      )}
    >
      <span className="font-mono text-[11px] tracking-label text-slab-text-muted md:text-xs">
        <span className="md:hidden">{labelMobile}</span>
        <span className="hidden md:inline">{label}</span>
      </span>
      {state.kind === "loading" ? (
        <Skeleton tone="slab" className="h-[22px] w-[110px] max-w-full md:h-8 md:w-[200px]" />
      ) : (
        <span
          className={cn(
            "tabular truncate text-[19px] font-semibold tracking-[-0.02em] md:text-2xl md:leading-none md:tracking-tight wide:text-[32px]",
            tone === "income" ? "text-income-on-slab" : "text-expense-on-slab",
          )}
        >
          {value ?? "—"}
        </span>
      )}
      <span className="hidden text-sm text-slab-text-muted md:block">
        {state.kind === "loading" ? t.loadingCaption : state.kind === "error" ? t.unavailable : caption}
      </span>
    </div>
  );
}
