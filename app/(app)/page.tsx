import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CategoryReport } from "@/components/finance/CategoryReport";
import { MonthProvider } from "@/components/finance/DashboardProvider";
import { DashboardView } from "@/components/finance/DashboardView";
import { EmptyState } from "@/components/finance/EmptyState";
import { History } from "@/components/finance/History";
import { LoadError } from "@/components/finance/LoadError";
import { MonthEmptyState } from "@/components/finance/MonthEmptyState";
import { TextLink } from "@/components/ui/TextLink";
import { copy } from "@/lib/copy";
import { getCategoryTotals, getDashboardData } from "@/lib/dashboard";
import { REPORTS_PATH, TRANSACTIONS_PATH, monthHref, navHref } from "@/lib/period";
import { resolvePeriod } from "./month";

export const metadata: Metadata = { title: "Suas finanças · Saldo." };

const TOP_CATEGORIES = 3;
const RECENT = 5;

const moreLinkClass = "text-sm font-medium whitespace-nowrap md:text-[15px]";

/** Início: resumo do mês, maiores gastos e últimas movimentações, com links para as outras abas. */
export default async function HomePage({ searchParams }: PageProps<"/">) {
  const { mes, categoria } = await searchParams;
  const period = resolvePeriod(mes, "/");
  const { month, current } = period;
  // Compatibilidade (V3): o filtro por categoria vive em Movimentações.
  if (typeof categoria === "string") {
    redirect(navHref({ path: TRANSACTIONS_PATH, month, current, categoria }));
  }
  const [data, totals] = await Promise.all([getDashboardData(month, RECENT), getCategoryTotals(month)]);
  const t = copy.home;

  const report =
    totals && totals.length > 0 ? (
      <CategoryReport
        totals={totals}
        period={period}
        limit={TOP_CATEGORIES}
        title={t.topTitle(period.label.name)}
        aside={
          <TextLink href={monthHref(month, current, REPORTS_PATH)} className={moreLinkClass}>
            {t.topMore}
          </TextLink>
        }
      />
    ) : null;

  if (!data.ok) {
    return (
      <MonthProvider summary={null} month={month}>
        <DashboardView summary={{ kind: "error" }} history={<LoadError />} period={period} report={report} />
      </MonthProvider>
    );
  }

  const history =
    data.totalCount === 0 ? (
      <EmptyState />
    ) : data.transactions.length === 0 ? (
      <MonthEmptyState period={period} />
    ) : (
      <History transactions={data.transactions} moreHref={null} />
    );
  const historyAside =
    data.transactions.length > 0 ? (
      <TextLink href={monthHref(month, current, TRANSACTIONS_PATH)} className={moreLinkClass}>
        {t.recentMore}
      </TextLink>
    ) : undefined;

  return (
    <MonthProvider summary={data.summary} month={month}>
      <DashboardView
        summary={{ kind: "ready", summary: data.summary }}
        history={history}
        historyIndex={report ? "03" : "02"}
        historyTitle={t.recentTitle}
        historyAside={historyAside}
        period={period}
        report={report}
      />
    </MonthProvider>
  );
}
