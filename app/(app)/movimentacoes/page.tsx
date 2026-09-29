import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MonthProvider } from "@/components/finance/DashboardProvider";
import { DashboardView } from "@/components/finance/DashboardView";
import { EmptyState } from "@/components/finance/EmptyState";
import { History } from "@/components/finance/History";
import { LoadError } from "@/components/finance/LoadError";
import { MonthEmptyState } from "@/components/finance/MonthEmptyState";
import { SearchEmptyState } from "@/components/finance/SearchEmptyState";
import { SearchField } from "@/components/finance/SearchField";
import { copy } from "@/lib/copy";
import { getCategories, getDashboardData } from "@/lib/dashboard";
import { NO_CATEGORY_EXPENSE, NO_CATEGORY_INCOME, TRANSACTIONS_PATH, makePeriod, navHref } from "@/lib/period";
import { PAGE_SIZE } from "@/lib/transactions";
import { parseSearch } from "@/lib/validation";
import { parseLimit, resolvePeriod } from "../month";

export const metadata: Metadata = { title: "Movimentações · Saldo." };

const MAX_ITEMS = 1000;
const HISTORY_INDEX = "01";

/** Aba Movimentações: histórico do mês, com filtro `?categoria=` (drill-down do relatório). */
export default async function TransactionsPage({ searchParams }: PageProps<"/movimentacoes">) {
  const { itens, mes, categoria, q: rawQ } = await searchParams;
  const q = parseSearch(rawQ);
  const resolved = resolvePeriod(mes, TRANSACTIONS_PATH);
  // V8: o período leva a busca para o seletor de mês manter o `q`.
  const period = makePeriod(resolved.month, resolved.current, TRANSACTIONS_PATH, q);
  const { month, current } = period;
  const heading = copy.transactions;
  const limit = parseLimit(itens, PAGE_SIZE, MAX_ITEMS);
  // `categoria`: "sem", "sem-receita" (V7) ou id de uma categoria do usuário. Qualquer outro valor volta para o mês sem filtro.
  const categoryParam = typeof categoria === "string" ? categoria : categoria === undefined ? null : "";
  // Remover o filtro de categoria mantém a busca; limpar a busca mantém a categoria.
  const monthOnlyHref = navHref({ path: TRANSACTIONS_PATH, month, current, q });
  const [data, categories] = await Promise.all([
    getDashboardData(month, limit, categoryParam || null, q),
    getCategories(),
  ]);
  const filterName =
    categoryParam === null
      ? null
      : categoryParam === NO_CATEGORY_EXPENSE || categoryParam === NO_CATEGORY_INCOME
        ? copy.category.none
        : (categories.find((c) => c.id === categoryParam)?.name ?? null);
  if (categoryParam !== null && filterName === null) redirect(monthOnlyHref);
  const filter = filterName === null ? null : { name: filterName, clearHref: monthOnlyHref };

  if (!data.ok) {
    return (
      <MonthProvider summary={null} month={month}>
        <DashboardView heading={heading} history={<LoadError />} historyIndex={HISTORY_INDEX} period={period} />
      </MonthProvider>
    );
  }

  const moreHref =
    data.hasMore && limit < MAX_ITEMS
      ? navHref({ path: TRANSACTIONS_PATH, month, current, categoria: categoryParam, q, itens: limit + PAGE_SIZE })
      : null;
  const clearSearchHref = navHref({ path: TRANSACTIONS_PATH, month, current, categoria: categoryParam });
  const list =
    data.transactions.length > 0 ? (
      <History transactions={data.transactions} moreHref={moreHref} />
    ) : q ? (
      <SearchEmptyState term={q} clearHref={clearSearchHref} />
    ) : (
      <MonthEmptyState period={period} />
    );
  // Busca só quando o mês tem o que buscar. Com busca ativa o campo sempre aparece, para dar como limpá-la.
  const history =
    data.totalCount === 0 && !q ? (
      <EmptyState />
    ) : data.transactions.length === 0 && !q ? (
      list
    ) : (
      <div className="flex flex-col gap-3 md:gap-4">
        <SearchField q={q} month={month} current={current} categoria={categoryParam} />
        {list}
      </div>
    );
  return (
    <MonthProvider summary={data.summary} month={month}>
      <DashboardView
        heading={heading}
        history={history}
        historyIndex={HISTORY_INDEX}
        period={period}
        filter={filter}
      />
    </MonthProvider>
  );
}
