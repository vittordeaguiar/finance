"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Fragment, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogBody, DialogHeader } from "@/components/ui/Dialog";
import { cn } from "@/lib/cn";
import { copy } from "@/lib/copy";
import { BASE } from "@/lib/motion";
import type { TransactionType } from "@/lib/money";
import { useCreateTransaction } from "./CreateTransaction";
import { useDashboard } from "./DashboardProvider";
import { NAV_ITEMS, isActive, navItemHref } from "./nav-items";

const CHOOSER_TITLE_ID = "nav-new-title";

/** Navegação do mobile (< 768px): abas + "+" central fixos no rodapé. */
export function BottomNav() {
  const pathname = usePathname();
  const mes = useSearchParams().get("mes");
  const { currentMonth } = useDashboard();
  const create = useCreateTransaction();
  const [choosing, setChoosing] = useState(false);
  const plusAt = Math.ceil(NAV_ITEMS.length / 2);

  const choose = (type: TransactionType) => {
    setChoosing(false);
    create(type);
  };

  return (
    <>
      <nav
        aria-label={copy.nav.label}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <ul className="grid h-16" style={{ gridTemplateColumns: `repeat(${NAV_ITEMS.length + 1}, minmax(0, 1fr))` }}>
          {NAV_ITEMS.map((item, index) => {
            const active = isActive(item.path, pathname);
            return (
              <Fragment key={item.path}>
                {index === plusAt && <PlusSlot onClick={() => setChoosing(true)} />}
                <li className="flex min-w-0">
                  <Link
                    href={navItemHref(item.path, mes, currentMonth)}
                    aria-current={active ? "page" : undefined}
                    aria-label={item.short ? item.label : undefined}
                    className={cn(
                      "relative flex min-w-0 flex-1 items-center justify-center px-1 font-mono text-[10px] tracking-label whitespace-nowrap uppercase no-underline",
                      active ? "font-semibold text-accent" : "text-text-secondary",
                    )}
                  >
                    {active && (
                    <motion.span layoutId="regua-bottom" transition={BASE} aria-hidden="true" className="absolute inset-x-3 top-0 h-0.5 bg-accent" />
                  )}
                    {item.short ?? item.label}
                  </Link>
                </li>
              </Fragment>
            );
          })}
        </ul>
      </nav>
      <Dialog open={choosing} onClose={() => setChoosing(false)} labelledBy={CHOOSER_TITLE_ID} width="sm">
        <DialogHeader
          eyebrow={copy.nav.chooseEyebrow}
          title={copy.nav.chooseTitle}
          titleId={CHOOSER_TITLE_ID}
          onClose={() => setChoosing(false)}
        />
        <DialogBody className="pb-[max(28px,env(safe-area-inset-bottom))]">
          <Button size="xl" onClick={() => choose("income")} fullWidth data-autofocus>
            <span aria-hidden="true" className="text-slab-accent">
              +
            </span>
            {copy.dash.ctaIncome}
          </Button>
          <Button variant="secondary" size="xl" onClick={() => choose("expense")} fullWidth>
            <span aria-hidden="true" className="text-expense">
              −
            </span>
            {copy.dash.ctaExpense}
          </Button>
        </DialogBody>
      </Dialog>
    </>
  );
}

function PlusSlot({ onClick }: { onClick: () => void }) {
  return (
    <li className="flex items-center justify-center">
      <button
        type="button"
        aria-label={copy.nav.newLabel}
        onClick={onClick}
        className="flex size-12 cursor-pointer items-center justify-center rounded-sm bg-text text-2xl text-on-primary transition-colors duration-[120ms] hover:bg-accent"
      >
        <span aria-hidden="true">+</span>
      </button>
    </li>
  );
}
