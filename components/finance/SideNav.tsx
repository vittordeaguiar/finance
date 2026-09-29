"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import { signOut } from "@/app/(app)/actions";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { copy } from "@/lib/copy";
import { BASE } from "@/lib/motion";
import { sidebarCookie } from "@/lib/sidebar";
import { useCreateTransaction } from "./CreateTransaction";
import { useDashboard } from "./DashboardProvider";
import { NAV_ITEMS, isActive, navItemHref } from "./nav-items";

/**
 * Barra lateral do desktop (≥ 768px) + área de conteúdo, que acompanha a largura dela.
 * Recolhida (padrão): 64px, com o índice de cada aba. Aberta: 240px. A escolha fica em cookie.
 */
export function SideNavShell({
  email,
  initialOpen,
  children,
}: {
  email: string | null;
  initialOpen: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(initialOpen);
  const toggle = () => {
    const next = !open;
    setOpen(next);
    document.cookie = sidebarCookie(next);
  };

  return (
    <>
      <SideNav email={email} open={open} onToggle={toggle} />
      <div className={cn("flex min-h-dvh flex-col", open ? "md:pl-60" : "md:pl-16")}>{children}</div>
    </>
  );
}

function SideNav({ email, open, onToggle }: { email: string | null; open: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  const mes = useSearchParams().get("mes");
  const { currentMonth } = useDashboard();
  const create = useCreateTransaction();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-border bg-surface md:flex",
        open ? "w-60" : "w-16",
      )}
    >
      <div className={cn("flex h-16 shrink-0 items-center", open ? "justify-between pr-2 pl-6" : "justify-center")}>
        {open && <Logo />}
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-label={open ? copy.nav.collapse : copy.nav.expand}
          title={open ? copy.nav.collapse : copy.nav.expand}
          className="flex size-11 cursor-pointer items-center justify-center rounded-sm text-[22px] text-text-secondary transition-colors duration-[120ms] hover:text-text"
        >
          <span aria-hidden="true">{open ? "‹" : "›"}</span>
        </button>
      </div>

      <div className={cn("flex flex-col gap-2.5 pt-4", open ? "px-4" : "items-center px-2")}>
        {open ? (
          <>
            <Button onClick={() => create("income")} fullWidth>
              <span aria-hidden="true" className="text-slab-accent">
                +
              </span>
              {copy.dash.ctaIncome}
            </Button>
            <Button variant="secondary" onClick={() => create("expense")} fullWidth>
              <span aria-hidden="true" className="text-expense">
                −
              </span>
              {copy.dash.ctaExpense}
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={() => create("income")}
              aria-label={copy.dash.ctaIncome}
              title={copy.dash.ctaIncome}
              className="size-12 px-0 text-lg"
            >
              <span aria-hidden="true" className="text-slab-accent">
                +
              </span>
            </Button>
            <Button
              variant="secondary"
              onClick={() => create("expense")}
              aria-label={copy.dash.ctaExpense}
              title={copy.dash.ctaExpense}
              className="size-12 px-0 text-lg"
            >
              <span aria-hidden="true" className="text-expense">
                −
              </span>
            </Button>
          </>
        )}
      </div>

      <nav aria-label={copy.nav.label} className={cn("pt-8", open ? "px-4" : "px-2")}>
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.path, pathname);
            return (
              <li key={item.path}>
                <Link
                  href={navItemHref(item.path, mes, currentMonth)}
                  aria-current={active ? "page" : undefined}
                  aria-label={open ? undefined : item.label}
                  title={open ? undefined : item.label}
                  className={cn(
                    "relative flex h-11 items-center rounded-sm no-underline transition-colors duration-[120ms]",
                    open ? "px-4 text-[15px] font-medium" : "justify-center font-mono text-xs tracking-label",
                    active ? "bg-background text-text" : "text-text-secondary hover:text-text",
                  )}
                >
                  {active && (
                    <motion.span layoutId="regua-side" transition={BASE} aria-hidden="true" className="absolute inset-y-2 left-0 w-0.5 bg-accent" />
                  )}
                  {open ? item.label : item.index}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div
        className={cn(
          "mt-auto flex flex-col gap-3 border-t border-border-subtle py-5",
          open ? "px-6" : "items-center px-2",
        )}
      >
        {open && email && <span className="truncate font-mono text-[13px] text-text-secondary">{email}</span>}
        <form action={signOut}>
          <button
            type="submit"
            title={open ? undefined : (email ?? undefined)}
            className={cn(
              "h-9 cursor-pointer rounded-sm border border-transparent px-3 text-sm font-medium text-text transition-colors duration-[120ms] hover:border-border",
              open && "-mx-3",
            )}
          >
            {copy.header.logout}
          </button>
        </form>
      </div>
    </aside>
  );
}
