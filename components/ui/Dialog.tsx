"use client";

import { animate, motion, useDragControls, useMotionValue, type PanInfo } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { copy } from "@/lib/copy";
import { cn } from "@/lib/cn";
import { DURATION_FAST, EASE_EMPHASIZED, EASE_STANDARD, prefersReducedMotion } from "@/lib/motion";

/** Fração da altura do sheet que, arrastada para baixo, fecha ao soltar. */
const DRAG_CLOSE_RATIO = 0.25;
/** Velocidade (px/s) de um gesto rápido para baixo que fecha mesmo com pouco deslocamento. */
const DRAG_CLOSE_VELOCITY = 500;
/** Classe da saída animada: some com o ::backdrop junto (app/globals.css). */
const CLOSING_CLASS = "is-closing";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  role?: "dialog" | "alertdialog";
  /** Largura no desktop: md = 520px (movimentação), sm = 480px (exclusão). */
  width?: "md" | "sm";
  /** `false` enquanto uma ação está em andamento: Esc e clique no overlay não fecham. */
  dismissible?: boolean;
  children: ReactNode;
};

/**
 * Diálogo responsivo sobre `<dialog>` nativo (foco preso, Esc, foco devolvido ao fechar).
 * < 768px: bottom sheet com alça · ≥ 768px: modal centralizado.
 * Foco inicial: o primeiro elemento com `data-autofocus` dentro do conteúdo.
 */
export function Dialog({
  open,
  onClose,
  labelledBy,
  role = "dialog",
  width = "md",
  dismissible = true,
  children,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const onCloseRef = useRef(onClose);
  const dismissibleRef = useRef(dismissible);
  // Durante a animação de saída o pai já limpou o conteúdo (ex.: transação = null): mostramos o último.
  // Fechado, o <dialog> nativo fica invisível e inerte, então manter esse conteúdo montado é inofensivo.
  const [shown, setShown] = useState<ReactNode>(open ? children : null);
  if (open && shown !== children) setShown(children);
  const y = useMotionValue(0);
  const opacity = useMotionValue(1);
  const dragControls = useDragControls();

  useEffect(() => {
    onCloseRef.current = onClose;
    dismissibleRef.current = dismissible;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open) {
      y.set(0);
      opacity.set(1);
      el.classList.remove(CLOSING_CLASS);
      if (!el.open) {
        el.showModal();
        el.querySelector<HTMLElement>("[data-autofocus]")?.focus();
      }
      return;
    }
    if (!el.open) return;

    // Saída: sheet desce (mobile); modal faz fade + 8px (desktop). Só depois fecha o <dialog> nativo,
    // que devolve o foco ao elemento que o abriu.
    if (prefersReducedMotion()) {
      el.close();
      return;
    }
    el.classList.add(CLOSING_CLASS);
    const desktop = window.matchMedia("(min-width: 768px)").matches;
    const exit = { duration: DURATION_FAST, ease: EASE_STANDARD };
    const animations = desktop ? [animate(y, 8, exit), animate(opacity, 0, exit)] : [animate(y, el.offsetHeight, exit)];
    let cancelled = false;
    Promise.all(animations.map((a) => a.finished)).then(() => {
      if (cancelled) return;
      el.close();
      el.classList.remove(CLOSING_CLASS);
    });
    return () => {
      cancelled = true;
      animations.forEach((a) => a.stop());
    };
  }, [open, y, opacity]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handleCancel = (event: Event) => {
      event.preventDefault();
      if (dismissibleRef.current) onCloseRef.current();
    };
    el.addEventListener("cancel", handleCancel);
    return () => el.removeEventListener("cancel", handleCancel);
  }, []);

  /** Arrastar a alça do sheet para baixo: fecha além de 25% da altura ou com um gesto rápido. */
  function handleDragEnd(_: unknown, info: PanInfo) {
    const el = ref.current;
    const far = el ? info.offset.y > el.offsetHeight * DRAG_CLOSE_RATIO : false;
    if (dismissibleRef.current && (far || info.velocity.y > DRAG_CLOSE_VELOCITY)) {
      onCloseRef.current();
    } else {
      if (prefersReducedMotion()) y.set(0);
      else animate(y, 0, { duration: DURATION_FAST, ease: EASE_EMPHASIZED });
    }
  }

  const content = open ? children : shown;

  return (
    <motion.dialog
      ref={ref}
      role={role === "alertdialog" ? "alertdialog" : undefined}
      aria-labelledby={labelledBy}
      aria-modal="true"
      style={{ y, opacity }}
      drag="y"
      dragListener={false}
      dragControls={dragControls}
      dragConstraints={{ top: 0 }}
      dragElastic={{ top: 0, bottom: 1 }}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      onClick={(event) => {
        // Clique fora do conteúdo (no ::backdrop) só fecha no desktop.
        const desktop = window.matchMedia("(min-width: 768px)").matches;
        if (event.target === event.currentTarget && desktop && dismissibleRef.current) onCloseRef.current();
      }}
      className={cn(
        "saldo-dialog bg-surface p-0 text-text shadow-modal",
        "mx-0 mt-auto mb-0 max-h-[100dvh] w-full max-w-none overflow-y-auto border-t border-border",
        "md:m-auto md:max-h-[calc(100dvh-48px)] md:border",
        width === "md" ? "md:w-[520px]" : "md:w-[480px]",
      )}
    >
      {content !== null && (
        <>
          <div
            aria-hidden="true"
            onPointerDown={(event) => {
              if (dismissibleRef.current) dragControls.start(event);
            }}
            className="flex cursor-grab touch-none justify-center pt-2.5 pb-1 active:cursor-grabbing md:hidden"
          >
            <div className="h-1 w-10 bg-border" />
          </div>
          {content}
        </>
      )}
    </motion.dialog>
  );
}

type DialogHeaderProps = {
  eyebrow: string;
  eyebrowTone?: "accent" | "error";
  title: string;
  titleId: string;
  onClose: () => void;
  closeDisabled?: boolean;
  /** Linha abaixo do título (ex.: etiqueta de tipo + dica). */
  children?: ReactNode;
  titleClassName?: string;
};

export function DialogHeader({
  eyebrow,
  eyebrowTone = "accent",
  title,
  titleId,
  onClose,
  closeDisabled,
  children,
  titleClassName,
}: DialogHeaderProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-border-subtle px-5 pt-3 pb-5 md:gap-4 md:px-8 md:pt-8 md:pb-6">
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "font-mono text-[11px] tracking-label md:text-xs",
            eyebrowTone === "error" ? "text-expense" : "text-accent",
          )}
        >
          {eyebrow}
        </span>
        <button
          type="button"
          aria-label={copy.common.close}
          onClick={onClose}
          disabled={closeDisabled}
          className="-my-3 -mr-3 flex size-11 cursor-pointer items-center justify-center text-[22px] text-text-secondary hover:text-text disabled:cursor-not-allowed disabled:opacity-60 md:text-xl"
        >
          ×
        </button>
      </div>
      <h2
        id={titleId}
        className={cn("text-[28px] leading-[1.1] font-semibold tracking-tight md:text-[32px]", titleClassName)}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}

export function DialogBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex flex-col gap-3.5 px-5 py-4 md:gap-5 md:px-8 md:py-7", className)}>{children}</div>;
}

/** Passe a ação principal primeiro: no mobile fica em cima; no desktop, à direita. */
export function DialogFooter({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5 border-t border-border-subtle bg-background px-5 pt-3 pb-[max(28px,env(safe-area-inset-bottom))] md:flex-row-reverse md:justify-start md:gap-3 md:px-8 md:py-5">
      {children}
    </div>
  );
}
