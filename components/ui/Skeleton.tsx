import { cn } from "@/lib/cn";

type SkeletonProps = {
  tone?: "light" | "slab";
  className?: string;
};

/** Bloco de carregamento que pulsa (V5). Tamanho via `className` (ex.: "h-4 w-24"). */
export function Skeleton({ tone = "light", className }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("saldo-pulse block", tone === "slab" ? "bg-slab-muted" : "bg-surface-muted", className)}
    />
  );
}
