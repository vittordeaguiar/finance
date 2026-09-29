"use client";

import { useSearchParams } from "next/navigation";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { useToast } from "@/components/ui/Toast";
import { copy } from "@/lib/copy";
import { monthLabel, monthOf } from "@/lib/dates";
import { TRANSACTIONS_PATH, monthHref } from "@/lib/period";
import type { TransactionType } from "@/lib/money";
import type { Transaction } from "@/lib/transactions";
import { useDashboard } from "./DashboardProvider";
import { TransactionDialog } from "./TransactionDialog";

const CreateContext = createContext<((type: TransactionType) => void) | null>(null);

/** Abre o formulário de criação de qualquer aba (sidebar, barra inferior). */
export function useCreateTransaction(): (type: TransactionType) => void {
  const open = useContext(CreateContext);
  if (!open) throw new Error("useCreateTransaction precisa de <CreateTransaction>");
  return open;
}

function initialTypeFrom(novo: string | null): TransactionType | null {
  return novo === "receita" ? "income" : novo === "despesa" ? "expense" : null;
}

/**
 * Modal de criação, montado uma vez no layout. Sucesso: fecha, mostra o toast e destaca a linha nova.
 * Deep link opcional em qualquer aba: `?novo=receita` ou `?novo=despesa`.
 */
export function CreateTransaction({ children }: { children: ReactNode }) {
  const novo = useSearchParams().get("novo");
  const initialType = initialTypeFrom(novo);
  const [openType, setOpenType] = useState<TransactionType | null>(initialType);
  const [session, setSession] = useState(0);
  const [lastType, setLastType] = useState<TransactionType>(initialType ?? "income");
  // O layout persiste entre navegações: um `?novo=` que aparece depois (link, voltar) também abre o modal.
  const [seenNovo, setSeenNovo] = useState(novo);
  if (novo !== seenNovo) {
    setSeenNovo(novo);
    if (initialType) {
      setSession((s) => s + 1);
      setLastType(initialType);
      setOpenType(initialType);
    }
  }
  const toast = useToast();
  const { highlight, month, currentMonth } = useDashboard();

  const open = useCallback((type: TransactionType) => {
    setSession((s) => s + 1);
    setLastType(type);
    setOpenType(type);
  }, []);

  const close = useCallback(() => setOpenType(null), []);

  const onSaved = useCallback(
    (tx: Transaction, recurrence?: { day: number; inserted: number }) => {
      setOpenType(null);
      highlight(tx.id);
      if (recurrence) {
        const r = copy.recurrence;
        toast({
          title: r.toastTitle,
          body:
            recurrence.inserted > 1
              ? r.toastBodyBackfill(recurrence.day, recurrence.inserted)
              : r.toastBody(recurrence.day),
        });
        return;
      }
      const target = monthOf(tx.occurredAt);
      if (target === month) {
        toast({ title: copy.tx.toastTitle[tx.type], body: copy.tx.toastBody[tx.type](tx.amountCents) });
        return;
      }
      const { name, year } = monthLabel(target);
      toast({
        title: copy.tx.toastTitle[tx.type],
        body: copy.period.savedIn(name, year),
        link: { href: monthHref(target, currentMonth, TRANSACTIONS_PATH), label: copy.period.see(name) },
      });
    },
    [highlight, toast, month, currentMonth],
  );

  return (
    <CreateContext.Provider value={open}>
      {children}
      <TransactionDialog
        key={session}
        type={openType ?? lastType}
        open={openType !== null}
        onClose={close}
        onSaved={onSaved}
      />
    </CreateContext.Provider>
  );
}
