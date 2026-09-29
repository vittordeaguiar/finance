import { copy } from "@/lib/copy";
import { cn } from "@/lib/cn";

// ≥ 1100px: DATA | DESCRIÇÃO | TIPO | VALOR | ação. Entre 768 e 1100px a coluna TIPO some e a etiqueta
// vai junto da descrição.
export const TABLE_GRID =
  "grid grid-cols-[112px_minmax(0,1fr)_160px_176px] wide:grid-cols-[140px_minmax(0,1fr)_180px_200px_176px] items-center px-6";

/** Cabeçalho da tabela. `decorative` quando usado fora da tabela (vazio, carregando, erro). */
export function TableHeader({ decorative = false }: { decorative?: boolean }) {
  const t = copy.dash.table;
  const cell = decorative ? undefined : "columnheader";
  return (
    <div
      role={decorative ? undefined : "row"}
      aria-hidden={decorative || undefined}
      className={cn(TABLE_GRID, "h-11 border-b border-border font-mono text-[11px] tracking-label text-text-secondary")}
    >
      <span role={cell}>{t.date}</span>
      <span role={cell}>{t.desc}</span>
      <span role={cell} className="hidden wide:block">
        {t.type}
      </span>
      <span role={cell} className="text-right">
        {t.value}
      </span>
      <span role={cell} />
    </div>
  );
}
