import { Skeleton } from "@/components/ui/Skeleton";
import { copy } from "@/lib/copy";
import { cn } from "@/lib/cn";
import { TABLE_GRID, TableHeader } from "./TableHeader";

/** Histórico carregando: 5 linhas no mobile, 6 no desktop, com aviso em aria-live. */
export function HistorySkeleton() {
  const label = (
    <span role="status" aria-live="polite">
      {copy.dash.loading}
    </span>
  );
  return (
    <>
      <div className="flex flex-col border border-border bg-surface md:hidden">
        <span className="border-b border-border-subtle px-4 py-3 font-mono text-[11px] tracking-label text-text-secondary">
          {label}
        </span>
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex min-h-[68px] items-center justify-between border-b border-border-subtle py-3 pr-4 pl-4 last:border-b-0">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3.5 w-[140px]" />
              <Skeleton className="h-2.5 w-[90px]" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
      <div className="hidden border border-border bg-surface md:block">
        <TableHeader decorative />
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className={cn(TABLE_GRID, "h-14 border-b border-border-subtle")}>
            <Skeleton className="h-3 w-[90px]" />
            <Skeleton className="h-3.5 w-[240px] max-w-full" />
            <Skeleton className="hidden h-[22px] w-24 wide:block" />
            <Skeleton className="h-4 w-[120px] justify-self-end" />
            <span />
          </div>
        ))}
        <span className="block px-6 py-4 font-mono text-[11px] tracking-label text-text-secondary">{label}</span>
      </div>
    </>
  );
}
