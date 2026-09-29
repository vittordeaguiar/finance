import type { ReactNode } from "react";
import { BrandPanel } from "@/components/brand/BrandPanel";
import { Logo } from "@/components/brand/Logo";
import { copy } from "@/lib/copy";
import { cn } from "@/lib/cn";

export type AuthVariant = "login" | "signup" | "recovery";

type AuthShellProps = {
  variant: AuthVariant;
  children: ReactNode;
};

/**
 * Casca das telas de autenticação.
 * Desktop: painel de marca à esquerda, formulário de 400px centralizado à direita.
 * Mobile: slab no topo (varia por tela) e formulário ocupando o resto da altura.
 */
export function AuthShell({ variant, children }: AuthShellProps) {
  const panel = variant === "signup" ? copy.brandPanel.signup : copy.brandPanel.login;
  return (
    <div className="flex min-h-dvh flex-col md:grid md:grid-cols-2">
      <div className="hidden md:flex">
        <BrandPanel {...panel} />
      </div>
      <MobileSlab variant={variant} />
      <main className="flex flex-1 flex-col md:items-center md:justify-center md:p-10 lg:p-16">
        <div
          className={cn(
            "flex flex-1 flex-col px-5 pb-7 md:w-full md:max-w-[400px] md:flex-none md:p-0",
            variant === "signup" ? "pt-6" : variant === "recovery" ? "pt-8" : "pt-7",
          )}
        >
          {children}
        </div>
      </main>
    </div>
  );
}

function MobileSlab({ variant }: { variant: AuthVariant }) {
  if (variant === "recovery") {
    return (
      <header className="bg-slab p-5 text-slab-text md:hidden">
        <Logo tone="slab" />
      </header>
    );
  }
  const isSignup = variant === "signup";
  const display = isSignup ? copy.brandPanel.signupMobile : copy.brandPanel.login;
  return (
    <header
      className={cn(
        "flex flex-col bg-slab px-5 pt-5 text-slab-text md:hidden",
        isSignup ? "gap-7 pb-7" : "gap-12 pb-8",
      )}
    >
      <Logo tone="slab" />
      <div className={cn("flex flex-col", isSignup ? "gap-2.5" : "gap-3")}>
        <span className="font-mono text-[11px] tracking-label text-slab-accent">
          {isSignup ? copy.signup.eyebrow : copy.brandPanel.eyebrow}
        </span>
        <p
          className={cn(
            "font-semibold tracking-display",
            isSignup ? "text-[36px] leading-[1.05]" : "text-[40px] leading-[1.02]",
          )}
        >
          {display.display} <span className="text-slab-accent">{display.displayAccent}</span>
        </p>
      </div>
    </header>
  );
}

type FormHeadingProps = {
  eyebrow: string;
  eyebrowTone?: "accent" | "error";
  title: string;
  body?: ReactNode;
  /** Subtítulo só no desktop (login). */
  bodyDesktopOnly?: boolean;
  /** Cabeçalho inteiro só no desktop (cadastro: no mobile ele está no slab). */
  desktopOnly?: boolean;
};

export function FormHeading({ eyebrow, eyebrowTone = "accent", title, body, bodyDesktopOnly, desktopOnly }: FormHeadingProps) {
  return (
    <div className={cn("flex-col gap-1.5 md:gap-3", desktopOnly ? "hidden md:flex" : "flex", body ? "gap-2.5" : null)}>
      <span
        className={cn(
          "font-mono text-[11px] tracking-label md:text-xs",
          eyebrowTone === "error" ? "text-expense" : "text-accent",
        )}
      >
        {eyebrow}
      </span>
      <h1 className="text-[26px] leading-[1.1] font-semibold tracking-tight md:text-[40px]">{title}</h1>
      {body && (
        <p
          className={cn(
            "text-[15px] leading-[1.6] text-text-secondary md:text-base",
            bodyDesktopOnly && "hidden md:block md:leading-normal",
          )}
        >
          {body}
        </p>
      )}
    </div>
  );
}

/** Rodapé "Ainda não tem conta? Criar conta": centralizado no mobile, com régua no desktop. */
export function AuthFooter({ children }: { children: ReactNode }) {
  return (
    <p className="text-center text-[15px] text-text-secondary md:border-t md:border-border md:pt-5 md:text-left md:text-sm">
      {children}
    </p>
  );
}
