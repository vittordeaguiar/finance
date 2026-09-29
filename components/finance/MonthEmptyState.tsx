import { copy } from "@/lib/copy";
import type { Period } from "@/lib/period";
import { TableHeader } from "./TableHeader";

/**
 * Mês sem movimentações (prints 42 e 45). A conta tem dados em outros meses.
 * `tableHeader={false}` (Relatórios, V7): sem o cabeçalho da tabela de histórico no desktop.
 */
export function MonthEmptyState({ period, tableHeader = true }: { period: Period; tableHeader?: boolean }) {
  const t = copy.dash;
  const { name, year } = period.label;
  return (
    <>
      <div className="flex flex-col gap-3 border border-border bg-surface px-5 py-8 md:hidden">
        <span className="font-mono text-[11px] tracking-label text-accent">{t.monthEmptyIndex(name, year)}</span>
        <h3 className="text-[22px] leading-[1.15] font-semibold tracking-tight">{t.monthEmptyTitle(name)}</h3>
        <p className="text-[15px] leading-[1.65] text-text-secondary">{t.monthEmptyBody}</p>
      </div>
      <div className="hidden border border-border bg-surface md:block">
        {tableHeader && <TableHeader decorative />}
        <div className="flex flex-col items-center gap-3 px-6 py-[72px] text-center">
          <span className="font-mono text-xs tracking-label text-accent">{t.monthEmptyIndex(name, year)}</span>
          <h3 className="text-[28px] font-semibold tracking-tight">{t.monthEmptyTitle(name)}</h3>
          <p className="max-w-[46ch] text-base leading-[1.65] text-text-secondary">{t.monthEmptyBody}</p>
        </div>
      </div>
    </>
  );
}
