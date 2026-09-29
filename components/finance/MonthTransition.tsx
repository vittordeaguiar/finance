"use client";

import { motion } from "motion/react";
import { BASE } from "@/lib/motion";
import { useState, type ReactNode } from "react";

/** Deslocamento de entrada ao trocar de mês (docs/12: 24px em 240ms). */
const OFFSET = 24;

/**
 * Ao trocar de mês, o histórico entra deslizando na direção da navegação: um mês anterior vem da
 * esquerda, um posterior da direita. Na primeira renderização não anima.
 */
export function MonthTransition({ month, children }: { month: string; children: ReactNode }) {
  const [previous, setPrevious] = useState(month);
  const [direction, setDirection] = useState(0);
  if (month !== previous) {
    setDirection(month > previous ? 1 : -1);
    setPrevious(month);
  }

  return (
    <motion.div
      key={month}
      initial={direction === 0 ? false : { opacity: 0, x: direction * OFFSET }}
      animate={{ opacity: 1, x: 0 }}
      transition={BASE}
      className="flex flex-col gap-3 md:gap-4"
    >
      {children}
    </motion.div>
  );
}
