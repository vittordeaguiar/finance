import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "danger-outline" | "quiet";
export type ButtonSize = "sm" | "md" | "lg" | "xl";

type ButtonProps = ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Mostra `pendingLabel`, desabilita e marca `aria-busy`. */
  pending?: boolean;
  pendingLabel?: string;
  /** Ícone à direita, com o texto à esquerda (ex.: "Entrar →"). */
  trailing?: ReactNode;
  fullWidth?: boolean;
};

const variants: Record<ButtonVariant, string> = {
  primary: "saldo-press bg-text text-on-primary hover:bg-accent",
  secondary: "bg-surface text-text border border-border-strong hover:bg-surface-hover",
  ghost: "bg-transparent text-text border border-border hover:border-border-strong",
  danger: "bg-expense text-on-primary",
  "danger-outline": "bg-transparent text-expense border border-expense hover:bg-expense-bg",
  quiet: "bg-transparent text-text-secondary border border-transparent hover:text-text hover:border-border",
};

const pendingVariants: Partial<Record<ButtonVariant, string>> = {
  primary: "bg-primary-pending hover:bg-primary-pending",
  danger: "bg-danger-pending hover:bg-danger-pending",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-sm font-medium",
  md: "h-12 px-5 text-[15px] font-semibold",
  lg: "h-[52px] px-5 text-base font-semibold",
  xl: "h-14 px-5 text-base font-semibold",
};

/** V5: a seta à direita desliza 2px no hover (docs/12). */
const TRAILING =
  "transition-transform duration-(--duration-instant) ease-standard group-hover:translate-x-0.5 group-disabled:translate-x-0";

type StyleOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  pending?: boolean;
  justify?: "between" | "center";
  fullWidth?: boolean;
  className?: string;
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  pending = false,
  justify = "center",
  fullWidth = false,
  className,
}: StyleOptions): string {
  return cn(
    "group inline-flex cursor-pointer items-center gap-2.5 rounded-sm no-underline transition-colors duration-[120ms] ease-standard",
    "disabled:cursor-not-allowed",
    justify === "between" ? "justify-between" : "justify-center",
    variants[variant],
    pending && pendingVariants[variant],
    sizes[size],
    fullWidth && "w-full",
    className,
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  trailing?: ReactNode;
  fullWidth?: boolean;
};

/** Link com aparência de botão (ex.: "Pedir novo link →"). */
export function ButtonLink({ variant, size, trailing, fullWidth, className, children, ...rest }: ButtonLinkProps) {
  return (
    <Link
      className={buttonClasses({ variant, size, fullWidth, justify: trailing ? "between" : "center", className })}
      {...rest}
    >
      {trailing ? (
        <>
          <span>{children}</span>
          <span aria-hidden="true" className={TRAILING}>
            {trailing}
          </span>
        </>
      ) : (
        children
      )}
    </Link>
  );
}

export function Button({
  variant = "primary",
  size = "md",
  pending = false,
  pendingLabel,
  trailing,
  fullWidth = false,
  disabled,
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  const showTrailing = trailing != null;
  const label = pending && pendingLabel ? pendingLabel : children;
  return (
    <button
      type={type}
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      className={buttonClasses({
        variant,
        size,
        pending,
        fullWidth,
        justify: showTrailing ? "between" : "center",
        className,
      })}
      {...rest}
    >
      {showTrailing ? (
        <>
          <span>{label}</span>
          <span aria-hidden="true" className={TRAILING}>
            {trailing}
          </span>
        </>
      ) : (
        label
      )}
    </button>
  );
}
