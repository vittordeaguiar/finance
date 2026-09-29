import { DashboardView } from "@/components/finance/DashboardView";
import { HistorySkeleton } from "@/components/finance/HistorySkeleton";

export default function DashboardLoading() {
  return <DashboardView summary={{ kind: "loading" }} history={<HistorySkeleton />} />;
}
