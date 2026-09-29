import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type SectionIndexProps = {
  index: string;
  title: ReactNode;
  id?: string;
  /** Conteúdo alinhado à direita (ex.: MAIS RECENTES PRIMEIRO). */
  aside?: ReactNode;
  className?: string;
};

/** "02  Histórico de movimentações." — índice mono verde + H2. */
export function SectionIndex({ index, title, id, aside, className }: SectionIndexProps) {
  return (
    <div className={cn("flex items-baseline justify-between gap-4", className)}>
      <div className="flex items-baseline gap-2.5 md:gap-4">
        <span className="font-mono text-[11px] tracking-label text-accent md:text-xs">{index}</span>
        <h2 id={id} className="text-xl font-semibold tracking-tight md:text-2xl">
          {title}
        </h2>
      </div>
      {aside}
    </div>
  );
}
