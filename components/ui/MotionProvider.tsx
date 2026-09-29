"use client";

import { MotionConfig, MotionGlobalConfig, useReducedMotion } from "motion/react";
import { useEffect, type ReactNode } from "react";
import { FAST } from "@/lib/motion";

/**
 * Transição padrão de todo o app. Com `prefers-reduced-motion`, docs/02 pede que tudo desligue:
 * `reducedMotion="user"` sozinho ainda faria fades de opacidade, então zeramos a duração também.
 * V5: componentes com transição própria (linhas, régua, barras) ignoram o `transition` do MotionConfig,
 * por isso `instantAnimations` também é ligado globalmente.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  useEffect(() => {
    MotionGlobalConfig.instantAnimations = reduced === true;
  }, [reduced]);
  return (
    <MotionConfig reducedMotion="user" transition={reduced ? { duration: 0 } : FAST}>
      {children}
    </MotionConfig>
  );
}
