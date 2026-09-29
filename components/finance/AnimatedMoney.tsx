"use client";

import { animate, useMotionValue, useMotionValueEvent } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { SLOW, prefersReducedMotion } from "@/lib/motion";
import { formatBalance, formatExpense, formatIncome } from "@/lib/money";

export type MoneyKind = "balance" | "income" | "expense" | "result";

const FORMAT: Record<MoneyKind, (cents: number) => string> = {
  balance: formatBalance,
  income: formatIncome,
  expense: formatExpense,
  // Resultado do mês: "+ R$ 1.433,20", "R$ 0,00" ou "− R$ 312,40".
  result: (cents) => (cents > 0 ? formatIncome(cents) : formatBalance(cents)),
};

/**
 * Valor do resumo que conta do número anterior ao novo depois de criar, editar ou excluir.
 * V5 (docs/12): na primeira renderização conta a partir de zero (300ms). O HTML do servidor já traz
 * o valor final; a contagem começa só depois da hidratação.
 * Cada quadro é arredondado para centavos inteiros antes de formatar (nunca float na tela).
 */
export function AnimatedMoney({ cents, kind }: { cents: number; kind: MoneyKind }) {
  const value = useMotionValue(cents);
  const first = useRef(true);
  const [display, setDisplay] = useState(cents);
  useMotionValueEvent(value, "change", (latest) => setDisplay(Math.round(latest)));

  useEffect(() => {
    const isFirst = first.current;
    first.current = false;
    if (prefersReducedMotion()) {
      value.set(cents);
      return;
    }
    if (isFirst) value.set(0);
    const controls = animate(value, cents, SLOW);
    return () => controls.stop();
  }, [cents, value]);

  return <>{FORMAT[kind](display)}</>;
}
