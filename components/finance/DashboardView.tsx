import type { ReactNode } from "react";
import { Eyebrow } from "@/components/brand/Eyebrow";
import { SectionIndex } from "@/components/brand/SectionIndex";
import { Enter } from "@/components/ui/Enter";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { copy } from "@/lib/copy";
import type { Period } from "@/lib/period";
import { MonthTransition } from "./MonthTransition";
import { PeriodStepper } from "./PeriodStepper";
import { SummarySlab, type SummaryState } from "./SummarySlab";

type DashboardViewProps = {
  /** Slab do resumo. Ausente nas abas que não o mostram (Movimentações, Relatórios). */
  summary?: SummaryState;
  /** V4: título da aba (padrão: o do dashboard). No mobile fica só para leitores de tela. */
  heading?: { eyebrow: string; title: string };
  /** Conteúdo do histórico: tabela/lista, vazio, carregando ou erro. Ausente = sem a seção. */
  history?: ReactNode;
  /** Título e conteúdo à direita da seção de histórico no lugar dos padrões (Início). */
  historyTitle?: ReactNode;
  historyAside?: ReactNode;
  /** Índice da seção de histórico (padrão "03", depois do relatório). */
  historyIndex?: string;
  /** Conteúdo extra depois do relatório (ex.: estado vazio de Relatórios). */
  children?: ReactNode;
  /** V2: mês selecionado (stepper, labels do resumo e título do histórico). */
  period?: Period;
  /** V3: relatório por categoria (entre o slab e o histórico), quando o mês tem despesas. */
  report?: ReactNode;
  /** V3: filtro ativo do histórico (nome exibido e link que remove o filtro). */
  filter?: { name: string; clearHref: string } | null;
};

/** Estrutura das abas (Início, Movimentações, Relatórios), compartilhada pelas páginas, loading.tsx e error.tsx. */
export function DashboardView({
  summary,
  heading,
  history,
  historyIndex,
  historyTitle,
  historyAside,
  period,
  report,
  filter,
  children,
}: DashboardViewProps) {
  const t = copy.dash;
  const { eyebrow, title } = heading ?? t;
  return (
    <main className="flex flex-1 flex-col pb-[calc(120px+env(safe-area-inset-bottom))] md:gap-10 md:px-16 md:py-12">
      <div className="flex flex-col gap-2.5 max-md:sr-only">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="text-[44px] leading-[1.05] font-semibold tracking-tight">{title}</h1>
      </div>

      {period && (
        <Enter index={0}>
          <PeriodStepper period={period} />
        </Enter>
      )}

      {summary && (
        <Enter index={1}>
          <SummarySlab state={summary} period={period} />
        </Enter>
      )}

      {report && <Enter index={2}>{report}</Enter>}

      {children && <Enter index={3}>{children}</Enter>}

      {history !== undefined && (
        <Enter index={4}>
          <section aria-labelledby="historico" className="flex flex-col gap-3 px-5 pt-6 md:gap-4 md:p-0">
            <SectionIndex
              id="historico"
              index={historyIndex ?? t.historyIndex}
              title={
                historyTitle ??
                (period && filter ? (
                  t.historyTitleFiltered(period.label.name, filter.name)
                ) : period ? (
                  t.historyTitleV2(period.label.name)
                ) : (
                  <>
                    <span className="md:hidden">{t.historyTitleMobile}</span>
                    <span className="hidden md:inline">{t.historyTitle}</span>
                  </>
                ))
              }
              aside={
                historyAside ??
                (filter ? (
                  <FilterChip {...filter} />
                ) : (
                  <span
                    className={cn(
                      "font-mono text-[10px] tracking-label whitespace-nowrap text-text-secondary md:text-xs",
                      period && "max-md:hidden",
                    )}
                  >
                    {t.historyOrder}
                  </span>
                ))
              }
            />
            {period ? <MonthTransition month={period.month}>{history}</MonthTransition> : history}
          </section>
        </Enter>
      )}
    </main>
  );
}

/** Chip do filtro ativo: mesmo estilo da `CategoryTag` md; o × remove o filtro (alvo de 44px). */
function FilterChip({ name, clearHref }: { name: string; clearHref: string }) {
  return (
    <span className="inline-flex h-7 max-w-[60%] shrink-0 items-center rounded-sm border border-border bg-surface pl-2.5 font-mono text-[11px] font-medium tracking-label text-text-secondary uppercase md:pl-3 md:text-xs">
      <span className="truncate" title={name}>
        {name}
      </span>
      <Link
        href={clearHref}
        scroll={false}
        aria-label={copy.dash.filterRemove(name)}
        className="-my-2 inline-flex h-11 w-11 shrink-0 items-center justify-center text-sm text-text hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
      >
        ×
      </Link>
    </span>
  );
}
