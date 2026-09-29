import { copy } from "@/lib/copy";
import { cn } from "@/lib/cn";
import type { TransactionType } from "@/lib/money";

type TypeTagProps = {
  type: TransactionType;
  /** sm: tabela (26px) · md: modal (28px, 12px no desktop) · xs: card de detalhe (24px) */
  size?: "xs" | "sm" | "md";
  className?: string;
};

const sizes = {
  xs: "h-6 px-2 text-[11px]",
  sm: "h-[26px] px-2.5 text-[11px]",
  md: "h-7 px-2.5 text-[11px] md:px-3 md:text-xs",
} as const;

export function TypeTag({ type, size = "sm", className }: TypeTagProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-sm font-mono font-medium tracking-label whitespace-nowrap",
        type === "income" ? "bg-income-bg text-income" : "bg-expense-bg text-expense",
        sizes[size],
        className,
      )}
    >
      {copy.type[type]}
    </span>
  );
}
