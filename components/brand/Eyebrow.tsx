import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type EyebrowTone = "accent" | "muted" | "error" | "slab-accent" | "slab-muted";

const tones: Record<EyebrowTone, string> = {
  accent: "text-accent",
  muted: "text-text-secondary",
  error: "text-expense",
  "slab-accent": "text-slab-accent",
  "slab-muted": "text-slab-text-muted",
};

type EyebrowProps = {
  tone?: EyebrowTone;
  as?: "span" | "p";
  className?: string;
  children: ReactNode;
};

/** Label mono em caixa alta (eyebrows, índices, cabeçalhos). 11px no mobile, 12px no desktop. */
export function Eyebrow({ tone = "accent", as: Tag = "span", className, children }: EyebrowProps) {
  return (
    <Tag className={cn("font-mono text-[11px] tracking-label uppercase md:text-xs", tones[tone], className)}>
      {children}
    </Tag>
  );
}
