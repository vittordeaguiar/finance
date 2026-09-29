"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { copy } from "@/lib/copy";
import { BASE, DURATION_SLOW, EASE_EMPHASIZED } from "@/lib/motion";

/** Por que o aviso saiu: prazo, × (ou gesto, ou link) ou outro aviso por cima. */
export type ToastDismissReason = "timeout" | "close" | "replaced";

export type ToastData = {
  title: string;
  body: string;
  link?: { href: string; label: string };
  /** V8: ação no aviso (ex.: "Desfazer"). Clicar executa e fecha sem chamar `onDismiss`. */
  action?: { label: string; onClick: () => void };
  /** Tempo na tela (ms). Padrão: 5 s. */
  duration?: number;
  /** V8: erro (sem o ✓ e com o título em `expense-on-slab`). */
  tone?: "error";
  /** V8: avisa quem abriu o aviso quando ele sai por qualquer motivo que não seja a ação. */
  onDismiss?: (reason: ToastDismissReason) => void;
};
type ToastState = ToastData & { id: number };

const AUTO_DISMISS_MS = 5000;
/** Deslocamento (px) ou velocidade (px/s) horizontal que dispensa o toast ao soltar. */
const SWIPE_DISTANCE = 80;
const SWIPE_VELOCITY = 500;

type ToastContextValue = {
  /** Mostra o aviso (substitui o atual) e devolve o id dele. */
  show: (toast: ToastData) => number;
  /** Fecha o aviso `id` se ele ainda estiver na tela, sem chamar `onDismiss`. */
  dismiss: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function useToastContext(): ToastContextValue {
  const value = useContext(ToastContext);
  if (!value) throw new Error("useToast precisa de <ToastProvider>");
  return value;
}

export function useToast(): (toast: ToastData) => number {
  return useToastContext().show;
}

export function useDismissToast(): (id: number) => void {
  return useToastContext().dismiss;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const nextId = useRef(0);
  // O aviso na tela, fora do estado: `onDismiss` roda uma vez, fora de um updater do React.
  const current = useRef<ToastState | null>(null);

  const replace = useCallback((next: ToastState | null, reason: ToastDismissReason | null) => {
    const previous = current.current;
    current.current = next;
    setToast(next);
    if (previous && reason) previous.onDismiss?.(reason);
  }, []);

  const show = useCallback(
    (data: ToastData) => {
      nextId.current += 1;
      replace({ ...data, id: nextId.current }, "replaced");
      return nextId.current;
    },
    [replace],
  );

  const dismiss = useCallback(
    (id: number, reason: ToastDismissReason | null) => {
      if (current.current?.id === id) replace(null, reason);
    },
    [replace],
  );

  const value = useMemo(() => ({ show, dismiss: (id: number) => dismiss(id, null) }), [show, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-[calc(108px+env(safe-area-inset-bottom))] z-50 md:inset-x-auto md:right-6 md:bottom-6 md:w-[400px]"
      >
        <AnimatePresence>
          {toast && <Toast key={toast.id} {...toast} onClose={(reason) => dismiss(toast.id, reason)} />}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

type ToastProps = Omit<ToastData, "onDismiss"> & {
  /** `null`: saiu pela ação, sem avisar `onDismiss`. */
  onClose: (reason: ToastDismissReason | null) => void;
};

export function Toast({ title, body, link, action, duration = AUTO_DISMISS_MS, tone, onClose }: ToastProps) {
  // O pai recria `onClose` a cada render: o timer lê a versão atual sem reiniciar.
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });
  useEffect(() => {
    const timer = window.setTimeout(() => closeRef.current("timeout"), duration);
    return () => window.clearTimeout(timer);
  }, [duration]);
  const error = tone === "error";

  return (
    <motion.div
      role="status"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0, transition: BASE }}
      exit={{ opacity: 0, y: 8 }}
      // Arrastar para o lado dispensa (gesto comum em toasts no mobile); curto demais, volta ao lugar.
      drag="x"
      dragSnapToOrigin
      dragElastic={0.6}
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.x) > SWIPE_DISTANCE || Math.abs(info.velocity.x) > SWIPE_VELOCITY) onClose("close");
      }}
      className="pointer-events-auto relative flex touch-pan-y items-center justify-between gap-3 bg-slab px-4 py-3.5 text-slab-text shadow-modal"
    >
      {/* V5 (docs/12): régua verde que se desenha da esquerda na entrada. */}
      <motion.span
        aria-hidden="true"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: DURATION_SLOW, ease: EASE_EMPHASIZED }}
        className={cn("absolute inset-x-0 top-0 h-0.5 origin-left", error ? "bg-expense-on-slab" : "bg-slab-accent")}
      />
      <div className="flex flex-col gap-1">
        <span className={cn("font-mono text-[11px] tracking-label", error ? "text-expense-on-slab" : "text-slab-accent")}>
          {/* V5: toast de sucesso confirma uma ação concluída. */}
          {!error && (
            <span aria-hidden="true" className="mr-1.5">
              ✓
            </span>
          )}
          {title}
        </span>
        <span className="text-[15px] leading-snug">
          {body}
          {link && (
            <>
              {" "}
              <Link
                href={link.href}
                onClick={() => onClose("close")}
                className="font-medium text-slab-accent underline underline-offset-2 hover:text-slab-text"
              >
                {link.label}
              </Link>
            </>
          )}
        </span>
      </div>
      {action && (
        <button
          type="button"
          onClick={() => {
            action.onClick();
            onClose(null);
          }}
          className="h-11 shrink-0 cursor-pointer px-1 text-[15px] font-medium text-slab-accent underline underline-offset-2 hover:text-slab-text"
        >
          {action.label}
        </button>
      )}
      <button
        type="button"
        aria-label={copy.common.closeToast}
        onClick={() => onClose("close")}
        className="-mr-2.5 flex size-11 shrink-0 cursor-pointer items-center justify-center text-xl text-slab-text-muted hover:text-slab-text"
      >
        ×
      </button>
    </motion.div>
  );
}
