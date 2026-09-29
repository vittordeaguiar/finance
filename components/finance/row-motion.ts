import { DURATION_FAST, DURATION_INSTANT, DURATION_SLOW, EASE_STANDARD, SLOW } from "@/lib/motion";

/**
 * Linhas do histórico (tabela e lista), docs/12: entrada com fade + 16px (300ms); saída desliza 24px
 * para a direita e recolhe a altura (300ms no total); `layout` para deslizar até a nova posição quando
 * a data muda na edição. Com prefers-reduced-motion o <MotionProvider> zera as durações.
 */
export const ROW_MOTION = {
  layout: "position",
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: SLOW },
  exit: {
    opacity: 0,
    x: 24,
    height: 0,
    transition: {
      duration: DURATION_SLOW,
      ease: EASE_STANDARD,
      x: { duration: DURATION_FAST, ease: EASE_STANDARD },
      opacity: { duration: DURATION_FAST, ease: EASE_STANDARD },
      height: { delay: DURATION_INSTANT, duration: DURATION_FAST, ease: EASE_STANDARD },
    },
  },
} as const;
