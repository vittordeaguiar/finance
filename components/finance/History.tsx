"use client";

import { useCallback, useMemo, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { copy } from "@/lib/copy";
import { monthLabel, monthOf } from "@/lib/dates";
import { TRANSACTIONS_PATH, monthHref } from "@/lib/period";
import { formatBalance, formatSigned } from "@/lib/money";
import type { Transaction } from "@/lib/transactions";
import { DeleteDialog, type DeleteStep } from "./DeleteDialog";
import { useDashboard, usePendingDeletes } from "./DashboardProvider";
import { TransactionList } from "./TransactionList";
import { TransactionTable } from "./TransactionTable";

type HistoryProps = {
  transactions: Transaction[];
  /** Link para a próxima página (mais de 50 itens), ou null. */
  moreHref: string | null;
};

type Selection = { tx: Transaction; step: DeleteStep };

/** Tabela (desktop) e lista (mobile) recebem o mesmo array. V8: exclusão sem confirmação, com "Desfazer" no aviso. */
export function History({ transactions: serverTransactions, moreHref }: HistoryProps) {
  const [selection, setSelection] = useState<Selection | null>(null);
  // Remonta o diálogo a cada abertura (zera o erro anterior) sem desmontá-lo ao fechar,
  // para que o <dialog> nativo devolva o foco ao botão que o abriu.
  const [session, setSession] = useState(0);
  const select = useCallback((next: Selection) => {
    setSession((n) => n + 1);
    setSelection(next);
  }, []);
  const { summary, highlight, month, currentMonth } = useDashboard();
  const toast = useToast();

  const { pending, remove } = usePendingDeletes();
  const transactions = useMemo(() => {
    const hidden = new Set(pending.map((tx) => tx.id));
    return serverTransactions.filter((tx) => !hidden.has(tx.id));
  }, [serverTransactions, pending]);

  const close = useCallback(() => setSelection(null), []);
  const onDelete = useCallback(
    (tx: Transaction) => {
      setSelection(null);
      remove(tx);
    },
    [remove],
  );
  const onEdited = useCallback(
    (tx: Transaction, balance: number | null) => {
      setSelection(null);
      highlight(tx.id);
      const target = monthOf(tx.occurredAt);
      if (target !== month) {
        // A linha sai da lista do mês exibido.
        const { name, year } = monthLabel(target);
        toast({
          title: copy.edit.toastTitle[tx.type],
          body: copy.period.movedTo(name, year),
          link: { href: monthHref(target, currentMonth, TRANSACTIONS_PATH), label: copy.period.see(name) },
        });
        return;
      }
      toast({
        title: copy.edit.toastTitle[tx.type],
        body: copy.edit.toastBody(
          tx.description,
          formatSigned(tx.type, tx.amountCents),
          balance === null ? "" : formatBalance(balance),
        ),
      });
    },
    [highlight, toast, month, currentMonth],
  );

  return (
    <>
      <div className="hidden md:block">
        <TransactionTable
          transactions={transactions}
          renderAction={(tx) => (
            <span className="flex gap-1">
              <button
                type="button"
                aria-label={copy.dash.rowEditLabel(tx.description)}
                onClick={() => select({ tx, step: "edit" })}
                className="h-9 cursor-pointer rounded-sm border border-transparent px-2.5 text-[13px] font-medium text-accent transition-colors duration-[120ms] hover:border-border"
              >
                {copy.dash.rowEdit}
              </button>
              <button
                type="button"
                aria-label={copy.dash.rowDeleteLabel(tx.description)}
                onClick={() => onDelete(tx)}
                className="h-9 cursor-pointer rounded-sm border border-transparent px-2.5 text-[13px] font-medium text-text-secondary transition-colors duration-[120ms] hover:border-border hover:text-text"
              >
                {copy.dash.rowDelete}
              </button>
            </span>
          )}
        />
      </div>
      <div className="md:hidden">
        <TransactionList transactions={transactions} onSelect={(tx) => select({ tx, step: "detail" })} />
      </div>
      {moreHref && (
        <div className="flex justify-center pt-2">
          <ButtonLink href={moreHref} scroll={false} variant="secondary">
            {copy.dash.loadMore}
          </ButtonLink>
        </div>
      )}
      <DeleteDialog
        key={session}
        transaction={selection?.tx ?? null}
        step={selection?.step ?? "detail"}
        balanceBefore={summary?.balanceCents ?? null}
        onStepChange={(step) => setSelection((s) => (s ? { ...s, step } : s))}
        onClose={close}
        onDelete={onDelete}
        onEdited={onEdited}
      />
    </>
  );
}
