import { cn } from "@/lib/cn";

type CategoryTagProps = {
  name: string;
  /** Mesmos tamanhos da `TypeTag`: sm tabela · md modal · xs card de detalhe */
  size?: "xs" | "sm" | "md";
  className?: string;
};

const sizes = {
  xs: "h-6 px-2 text-[11px]",
  sm: "h-[26px] px-2.5 text-[11px]",
  md: "h-7 px-2.5 text-[11px] md:px-3 md:text-xs",
} as const;

/** Etiqueta neutra da categoria. Trunca com reticências (máx. ~16 caracteres); `title` traz o nome completo. */
export function CategoryTag({ name, size = "sm", className }: CategoryTagProps) {
  return (
    <span
      title={name}
      className={cn(
        "inline-flex min-w-0 shrink items-center rounded-sm border border-border bg-surface font-mono font-medium tracking-label text-text-secondary uppercase",
        sizes[size],
        className,
      )}
    >
      <span className="max-w-[16ch] truncate">{name}</span>
    </span>
  );
}
