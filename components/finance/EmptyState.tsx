import { copy } from "@/lib/copy";
import { TableHeader } from "./TableHeader";

/** Estado vazio: card no mobile; dentro da tabela (abaixo do cabeçalho) no desktop. */
export function EmptyState() {
  const t = copy.dash;
  return (
    <>
      <div className="flex flex-col gap-3 border border-border bg-surface px-5 py-8 md:hidden">
        <span className="font-mono text-[11px] tracking-label text-accent">{t.emptyIndex}</span>
        <h3 className="text-[22px] leading-[1.15] font-semibold tracking-tight">{t.emptyTitle}</h3>
        <p className="text-[15px] leading-[1.65] text-text-secondary">{t.emptyBody}</p>
        <span className="border-t border-border-subtle pt-2 font-mono text-[11px] tracking-label text-text-secondary">
          {t.emptyHintMobile}
        </span>
      </div>
      <div className="hidden border border-border bg-surface md:block">
        <TableHeader decorative />
        <div className="flex flex-col items-center gap-3 px-6 py-[72px] text-center">
          <span className="font-mono text-xs tracking-label text-accent">{t.emptyIndex}</span>
          <h3 className="text-[28px] font-semibold tracking-tight">{t.emptyTitle}</h3>
          <p className="max-w-[46ch] text-base leading-[1.65] text-text-secondary">{t.emptyBody}</p>
          <span className="font-mono text-[11px] tracking-label text-text-secondary">{t.emptyHint}</span>
        </div>
      </div>
    </>
  );
}
