"use client";

import { motion } from "motion/react";
import { useId, useRef, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";

type SegmentedProps<V extends string> = {
  label: string;
  value: V;
  options: { value: V; label: string }[];
  onChange: (value: V) => void;
  disabled?: boolean;
};

/**
 * Controle segmentado neutro (role="radiogroup", setas trocam a seleção), no mesmo desenho do seletor de
 * tipo da edição. A seleção desliza entre as opções.
 */
export function Segmented<V extends string>({ label, value, options, onChange, disabled }: SegmentedProps<V>) {
  const refs = useRef<Partial<Record<V, HTMLButtonElement | null>>>({});
  const indicatorId = useId();

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const step =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? -1
          : 0;
    if (!step) return;
    event.preventDefault();
    const index = options.findIndex((o) => o.value === value);
    const next = options[(index + step + options.length) % options.length].value;
    onChange(next);
    refs.current[next]?.focus();
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
      className="grid rounded-sm border border-border"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((option, index) => {
        const checked = option.value === value;
        return (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[option.value] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative h-12 cursor-pointer bg-surface font-mono text-xs tracking-label md:h-11",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed",
              index > 0 && "border-l border-border",
              checked ? "font-semibold text-text" : "font-medium text-text-secondary",
            )}
          >
            {checked && (
              <motion.span
                aria-hidden="true"
                layoutId={indicatorId}
                className="absolute inset-0 bg-background shadow-[inset_0_0_0_2px_var(--color-text)]"
              />
            )}
            <span className="relative">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
