"use client";

import { useSearchParams } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { deleteTransaction } from "@/app/(app)/actions";
import { useDismissToast, useToast } from "@/components/ui/Toast";
import { copy } from "@/lib/copy";
import { formatBalance } from "@/lib/money";
import { monthParamForNav } from "@/lib/period";
import { summaryWithout, type Category, type Summary, type Transaction } from "@/lib/transactions";

const HIGHLIGHT_MS = 3000;
/** V8: tempo para desfazer uma exclusão. */
const UNDO_MS = 6000;

/** Estado do app inteiro (layout): vive entre as abas. */
type AppContextValue = {
  /** "Hoje" em São Paulo, calculado no servidor (evita divergência na hidratação). */
  today: string;
  currentMonth: string;
  /** Categorias do usuário (todas, ordem alfabética), lidas uma vez por request no layout. */
  categories: Category[];
  highlightId: string | null;
  highlight: (id: string) => void;
};

/** Estado da página: mês exibido e resumo (saldo usado em excluir/editar), já sem as exclusões pendentes. */
type MonthContextValue = {
  summary: Summary | null;
  month: string;
};

/** V8: exclusões que ainda não terminaram no servidor (a que pode ser desfeita e as que estão indo). */
type PendingDeleteValue = {
  pending: Transaction[];
  remove: (tx: Transaction) => void;
};

const NO_PENDING: PendingDeleteValue = { pending: [], remove: () => {} };

type DashboardContextValue = AppContextValue & MonthContextValue;

const AppContext = createContext<AppContextValue | null>(null);
const MonthContext = createContext<MonthContextValue | null>(null);
const PendingDeleteContext = createContext<PendingDeleteValue>(NO_PENDING);

/** Exclusões pendentes da página. Fora de um `MonthProvider` (ex.: loading.tsx), lista vazia. */
export function usePendingDeletes(): PendingDeleteValue {
  return useContext(PendingDeleteContext);
}

/**
 * App + página. Fora de uma página com `MonthProvider` (ex.: o "+" no layout), o mês vem do `?mes=` da
 * URL e o resumo é `null`.
 */
export function useDashboard(): DashboardContextValue {
  const app = useContext(AppContext);
  const page = useContext(MonthContext);
  const searchParams = useSearchParams();
  if (!app) throw new Error("useDashboard precisa de <AppProvider>");
  return {
    ...app,
    summary: page?.summary ?? null,
    month: page?.month ?? monthParamForNav(searchParams.get("mes"), app.currentMonth),
  };
}

export function AppProvider({
  today,
  categories,
  children,
}: {
  today: string;
  categories: Category[];
  children: ReactNode;
}) {
  // `seq` reinicia o timer quando a mesma linha é destacada de novo (ex.: editar logo após criar).
  const [target, setTarget] = useState<{ id: string; seq: number } | null>(null);
  const highlight = useCallback((id: string) => setTarget((t) => ({ id, seq: (t?.seq ?? 0) + 1 })), []);
  const highlightId = target?.id ?? null;

  useEffect(() => {
    if (!target) return;
    const timer = window.setTimeout(() => setTarget(null), HIGHLIGHT_MS);
    return () => window.clearTimeout(timer);
  }, [target]);

  return (
    <AppContext.Provider value={{ today, currentMonth: today.slice(0, 7), categories, highlightId, highlight }}>
      {children}
    </AppContext.Provider>
  );
}

export function MonthProvider({
  summary,
  month,
  children,
}: {
  summary: Summary | null;
  month: string;
  children: ReactNode;
}) {
  const toast = useToast();
  const dismissToast = useDismissToast();
  // Cada exclusão guarda o mês em que foi feita: trocar de mês pelo stepper reaproveita o provider.
  const [entries, setEntries] = useState<{ tx: Transaction; month: string }[]>([]);
  const pending = useMemo(() => entries.filter((e) => e.month === month).map((e) => e.tx), [entries, month]);
  const [announcement, setAnnouncement] = useState("");
  // A exclusão que o aviso ainda pode desfazer. Ref: o aviso e a desmontagem leem sem depender do render.
  const undoable = useRef<{ tx: Transaction; toastId: number } | null>(null);

  const effective = useMemo(
    () => (summary ? pending.reduce((acc, tx) => summaryWithout(acc, tx), summary) : null),
    [summary, pending],
  );

  const forget = useCallback((id: string) => setEntries((list) => list.filter((e) => e.tx.id !== id)), []);

  /** Manda ao servidor. Só a primeira chamada para a exclusão desfazível vale (prazo, ×, aviso novo, saída). */
  const commit = useCallback(
    (tx: Transaction) => {
      if (undoable.current?.tx.id !== tx.id) return;
      undoable.current = null;
      // Rejeição (ex.: conexão caiu) segue o mesmo caminho de uma falha: a linha volta e o erro aparece.
      void deleteTransaction(tx.id)
        .then(
          (result) => result.ok,
          () => false,
        )
        .then((ok) => {
          forget(tx.id);
          if (!ok) toast({ title: copy.del.toastErrorTitle, body: copy.del.error, tone: "error" });
        });
    },
    [forget, toast],
  );

  const remove = useCallback(
    (tx: Transaction) => {
      const balance = effective ? summaryWithout(effective, tx).balanceCents : null;
      // O aviso novo substitui o anterior, que confirma a exclusão dele (`onDismiss` "replaced") antes daqui.
      const toastId = toast({
        title: copy.del.toastTitle[tx.type],
        body: copy.del.toastBody(tx.description, balance === null ? "" : formatBalance(balance)),
        duration: UNDO_MS,
        action: {
          label: copy.del.toastUndo,
          onClick: () => {
            if (undoable.current?.tx.id !== tx.id) return;
            undoable.current = null;
            forget(tx.id);
            setAnnouncement(copy.del.toastUndone);
          },
        },
        onDismiss: () => commit(tx),
      });
      undoable.current = { tx, toastId };
      setAnnouncement("");
      setEntries((list) => [...list, { tx, month }]);
    },
    [commit, effective, forget, month, toast],
  );

  // Trocar de aba desmonta o provider e trocar de mês muda `month`: nos dois casos confirma a exclusão
  // pendente e tira o "Desfazer" da tela.
  useEffect(
    () => () => {
      const current = undoable.current;
      if (!current) return;
      dismissToast(current.toastId);
      commit(current.tx);
    },
    [commit, dismissToast, month],
  );

  return (
    <MonthContext.Provider value={{ summary: effective, month }}>
      <PendingDeleteContext.Provider value={{ pending, remove }}>
        {children}
        <span aria-live="polite" className="sr-only">
          {announcement}
        </span>
      </PendingDeleteContext.Provider>
    </MonthContext.Provider>
  );
}
