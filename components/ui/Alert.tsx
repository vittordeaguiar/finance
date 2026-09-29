import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type AlertProps = {
  tone: "error" | "info";
  title?: string;
  children: ReactNode;
  /** Ação à direita (ex.: "Tentar novamente"). */
  action?: ReactNode;
  /** Padrão: `alert` para erro; nenhum para informação estática. */
  role?: "alert" | "status" | null;
  className?: string;
};

export function Alert({ tone, title, children, action, role, className }: AlertProps) {
  const resolvedRole = role === undefined ? (tone === "error" ? "alert" : undefined) : (role ?? undefined);
  return (
    <div
      role={resolvedRole}
      className={cn(
        "flex items-center gap-4 border-l-[3px]",
        title ? "px-4 py-3.5" : "px-3.5 py-3",
        tone === "error" ? "border-expense bg-expense-bg" : "border-info bg-info-bg",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {title && (
          <span
            className={cn(
              "font-mono text-[11px] tracking-label",
              tone === "error" ? "text-expense" : "text-info",
            )}
          >
            {title}
          </span>
        )}
        <span className={cn("leading-normal text-text", title ? "text-sm md:text-[15px]" : "text-sm")}>
          {children}
        </span>
      </div>
      {action}
    </div>
  );
}
