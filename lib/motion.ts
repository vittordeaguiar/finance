// Espelho de `handoff/design/tokens.css` (seção Movimento) para o Motion, que não lê variáveis CSS.
// Não criar curvas nem durações novas aqui: docs/02 "Movimento".

/** --duration-instant: troca de cor. */
export const DURATION_INSTANT = 0.12;
/** --duration-fast: entrada e saída de modal, sheet, toast e linhas. */
export const DURATION_FAST = 0.18;
/** --duration-base: troca de mês, régua da aba, revelação do saldo, toast (V5). */
export const DURATION_BASE = 0.24;
/** --duration-slow: teto (300ms). Contagem, linha nova, exclusão, barras do relatório (V5). */
export const DURATION_SLOW = 0.3;
/** --stagger: intervalo entre itens escalonados (V5). */
export const STAGGER = 0.03;

/** --ease-standard */
export const EASE_STANDARD = [0.2, 0, 0, 1] as const;
/** --ease-emphasized */
export const EASE_EMPHASIZED = [0.16, 1, 0.3, 1] as const;

/** Transição padrão de entrada/saída (sem spring, sem bounce). */
export const FAST = { duration: DURATION_FAST, ease: EASE_EMPHASIZED } as const;
/** V5: troca de mês, régua da aba, revelação do saldo. */
export const BASE = { duration: DURATION_BASE, ease: EASE_EMPHASIZED } as const;
/** V5: contagem, linha nova, exclusão e barras do relatório. */
export const SLOW = { duration: DURATION_SLOW, ease: EASE_EMPHASIZED } as const;

/** `prefers-reduced-motion` para animações imperativas (fora do <MotionConfig>). */
export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
