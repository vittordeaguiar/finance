import type { Metadata } from "next";
import { CategoryReport } from "@/components/finance/CategoryReport";
import { MonthProvider } from "@/components/finance/DashboardProvider";
import { DashboardView } from "@/components/finance/DashboardView";
import { LoadError } from "@/components/finance/LoadError";
import { MonthEmptyState } from "@/components/finance/MonthEmptyState";
import { copy } from "@/lib/copy";
import { getCategoryTotals, getMonthSummary } from "@/lib/dashboard";
import { REPORTS_PATH } from "@/lib/period";
import { resolvePeriod } from "../month";

export const metadata: Metadata = { title: "Relatórios · Saldo." };

/**
 * Aba Relatórios (V7): resumo do mês, despesas e receitas por categoria. Seção sem dados some; mês sem
 * nenhuma movimentação mostra o estado vazio do mês.
 */
export default async function ReportsPage({ searchParams }: PageProps<"/relatorios">) {
  const { mes } = await searchParams;
  const period = resolvePeriod(mes, REPORTS_PATH);
  const [summary, expenses, incomes] = await Promise.all([
    getMonthSummary(period.month),
    getCategoryTotals(period.month, "expense"),
    getCategoryTotals(period.month, "income"),
  ]);

  const failed = expenses === null || incomes === null;
  const hasExpenses = !!expenses && expenses.length > 0;
  const hasIncomes = !!incomes && incomes.length > 0;
  const sections = failed ? (
    <div className="px-5 pt-6 md:p-0">
      <LoadError />
    </div>
  ) : hasExpenses || hasIncomes ? (
    <>
      {hasExpenses && <CategoryReport totals={expenses} period={period} index="01" />}
      {hasIncomes && (
        <CategoryReport totals={incomes} type="income" period={period} index={hasExpenses ? "02" : "01"} />
      )}
    </>
  ) : (
    <div className="px-5 pt-6 md:p-0">
      <MonthEmptyState period={period} tableHeader={false} />
    </div>
  );

  return (
    <MonthProvider summary={summary.ok ? summary.summary : null} month={period.month}>
      <DashboardView
        heading={copy.reports}
        period={period}
        summary={summary.ok ? { kind: "ready", summary: summary.summary } : { kind: "error" }}
      >
        <div className="flex flex-col md:gap-10">{sections}</div>
      </DashboardView>
    </MonthProvider>
  );
}
