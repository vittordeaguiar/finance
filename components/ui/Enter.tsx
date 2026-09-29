"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { DURATION_FAST, DURATION_BASE, EASE_EMPHASIZED, STAGGER } from "@/lib/motion";

/** Peças escalonadas além desta entram juntas com a última (docs/12: no máximo 6). */
const MAX_STAGGERED = 5;

/**
 * Entrada escalonada de uma seção da aba (docs/12): fade + 16px, 180ms, 30ms depois da anterior.
 * Só anima na montagem: revalidações e troca de mês mantêm o componente e não repetem a entrada.
 */
export function Enter({ index = 0, className, children }: { index?: number; className?: string; children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION_FAST, ease: EASE_EMPHASIZED, delay: Math.min(index, MAX_STAGGERED) * STAGGER }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Revelação por máscara (saldo): o conteúdo sobe de baixo de um recorte, 240ms, só na montagem. */
export function Reveal({ children }: { children: ReactNode }) {
  return (
    <span className="block overflow-hidden">
      <motion.span
        className="block"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ duration: DURATION_BASE, ease: EASE_EMPHASIZED }}
      >
        {children}
      </motion.span>
    </span>
  );
}
