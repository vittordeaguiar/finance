import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

// Partes compartilhadas por TextField, MoneyField e DateField.

export const labelClass = "font-mono text-[11px] tracking-label text-text-secondary md:text-xs";

export const inputClass = cn(
  "h-[52px] w-full rounded-sm border bg-surface px-4 text-[17px] text-text md:h-12 md:text-base",
  "placeholder:text-text-secondary disabled:opacity-60",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
);

export function fieldBorder(error?: ReactNode): string {
  return error ? "border-expense" : "border-border";
}

export function describedBy(id: string, hint?: ReactNode, error?: ReactNode): string | undefined {
  const ids = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean);
  return ids.length ? ids.join(" ") : undefined;
}

type FieldShellProps = {
  id: string;
  label: string;
  /** Conteúdo à direita do label (ex.: link "Esqueci minha senha", marca HOJE). */
  labelAside?: ReactNode;
  hint?: ReactNode;
  /** `mono` = hint em caixa alta mono (ex.: MÍNIMO DE 8 CARACTERES); `text` = ajuda em texto corrido. */
  hintStyle?: "mono" | "text";
  error?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function FieldShell({
  id,
  label,
  labelAside,
  hint,
  hintStyle = "text",
  error,
  className,
  children,
}: FieldShellProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className={labelClass}>
          {label}
        </label>
        {labelAside}
      </div>
      {children}
      {hint && (
        <span
          id={`${id}-hint`}
          className={cn(
            hintStyle === "mono"
              ? "font-mono text-[11px] tracking-[0.06em]"
              : "text-[13px] leading-normal",
            error && hintStyle === "mono" ? "text-expense" : "text-text-secondary",
          )}
        >
          {hint}
        </span>
      )}
      {error && (
        <span id={`${id}-error`} className="text-[13px] leading-normal text-expense">
          {error}
        </span>
      )}
    </div>
  );
}

/** Marca de campo alterado na edição ("ALTERADO · ERA R$ 412,80"). */
export function ChangedNote({ children }: { children: ReactNode }) {
  return <span className="font-mono text-[11px] tracking-[0.06em] text-accent md:text-xs">{children}</span>;
}
