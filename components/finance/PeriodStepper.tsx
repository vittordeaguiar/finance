import Link from "next/link";
import { TextLink } from "@/components/ui/TextLink";
import { cn } from "@/lib/cn";
import { copy } from "@/lib/copy";
import { nextMonthHref, periodHref, prevMonthHref, type Period } from "@/lib/period";
import { LinkPending } from "./LinkPending";

const stepClass =
  "flex size-11 shrink-0 items-center justify-center text-[22px] text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

/**
 * Seletor de mês `‹ SETEMBRO 2026 ›`. Navegação por <Link>: o Server Component refaz a busca.
 * Desktop: linha com label PERÍODO. Mobile: largura total, logo abaixo do header.
 */
export function PeriodStepper({ period }: { period: Period }) {
  const t = copy.period;
  const next = nextMonthHref(period);
  const isCurrent = period.month === period.current;

  return (
    <div className="flex flex-col gap-2 px-5 py-3 md:-my-2 md:flex-row md:items-center md:gap-5 md:p-0">
      <span className="hidden font-mono text-xs tracking-label text-text-secondary md:inline">{t.label}</span>
      <div className="group flex items-center border border-border bg-surface">
        <Link
          href={prevMonthHref(period)}
          aria-label={t.prev}
          className={cn(stepClass, "border-r border-border-subtle")}
        >
          <LinkPending>‹</LinkPending>
        </Link>
        <span
          aria-live="polite"
          className="flex-1 text-center transition-opacity duration-[120ms] group-has-[[data-pending]]:opacity-50 font-mono text-[13px] font-medium tracking-label text-text md:min-w-[200px]"
        >
          {t.title(period.label.name, period.label.year)}
        </span>
        {next ? (
          <Link href={next} aria-label={t.next} className={cn(stepClass, "border-l border-border-subtle")}>
            <LinkPending>›</LinkPending>
          </Link>
        ) : (
          <span
            role="link"
            aria-label={t.next}
            aria-disabled="true"
            className={cn(stepClass, "border-l border-border-subtle text-text-secondary opacity-50")}
          >
            ›
          </span>
        )}
      </div>
      {!isCurrent && (
        <TextLink href={periodHref(period, period.current)} className="self-center text-sm font-medium md:text-[15px]">
          {t.back}
        </TextLink>
      )}
    </div>
  );
}
