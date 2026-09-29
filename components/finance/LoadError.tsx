import { copy } from "@/lib/copy";
import { RetryButton } from "./RetryButton";
import { TableHeader } from "./TableHeader";

/** Erro ao carregar: alerta solto no mobile; dentro da tabela no desktop. */
export function LoadError({ reset }: { reset?: () => void }) {
  const t = copy.dash;
  return (
    <>
      <div role="alert" className="flex flex-col gap-3 border-l-[3px] border-expense bg-expense-bg p-4 md:hidden">
        <span className="font-mono text-[11px] tracking-label text-expense">{t.errorTitle}</span>
        <p className="text-[15px] leading-normal">{t.errorBody}</p>
        <RetryButton reset={reset} />
      </div>
      <div className="hidden border border-border bg-surface md:block">
        <TableHeader decorative />
        <div className="p-6 pt-8">
          <div role="alert" className="flex items-center justify-between gap-6 border-l-[3px] border-expense bg-expense-bg px-6 py-5">
            <div className="flex flex-col gap-1.5">
              <span className="font-mono text-[11px] tracking-label text-expense">{t.errorTitle}</span>
              <span className="text-base">{t.errorBody}</span>
            </div>
            <RetryButton reset={reset} />
          </div>
        </div>
      </div>
    </>
  );
}
