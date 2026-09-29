import { DashboardView } from "@/components/finance/DashboardView";
import { Skeleton } from "@/components/ui/Skeleton";
import { copy } from "@/lib/copy";

export default function ReportsLoading() {
  return (
    <DashboardView heading={copy.reports} summary={{ kind: "loading" }}>
      <div aria-busy="true" className="mx-5 mt-6 flex flex-col border border-border bg-surface md:m-0">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex h-14 items-center gap-6 border-b border-border-subtle px-6 last:border-b-0">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-2 flex-1" />
          </div>
        ))}
      </div>
    </DashboardView>
  );
}
