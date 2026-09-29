import { DashboardView } from "@/components/finance/DashboardView";
import { HistorySkeleton } from "@/components/finance/HistorySkeleton";
import { copy } from "@/lib/copy";

export default function TransactionsLoading() {
  return <DashboardView heading={copy.transactions} history={<HistorySkeleton />} historyIndex="01" />;
}
