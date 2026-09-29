"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { copy } from "@/lib/copy";
import type { Month } from "@/lib/dates";
import { TRANSACTIONS_PATH, navHref } from "@/lib/period";
import { fieldBorder, inputClass } from "@/components/ui/Field";

const DEBOUNCE_MS = 300;

type SearchFieldProps = {
  /** Busca atual (`?q=` já validado pela página). */
  q: string | null;
  month: Month;
  current: Month;
  categoria: string | null;
};

/** V8: busca por descrição em Movimentações. Atualiza `?q=` sem entrar no histórico do navegador. */
export function SearchField({ q, month, current, categoria }: SearchFieldProps) {
  const router = useRouter();
  const [value, setValue] = useState(q ?? "");
  const [syncedQ, setSyncedQ] = useState(q);
  const timer = useRef<number | null>(null);
  // Último termo enviado à URL: `q` só muda quando a navegação termina, e limpar durante uma busca em
  // andamento precisa substituí-la.
  const [requested, setRequested] = useState(q ?? "");
  const t = copy.search;

  // "Limpar busca" no estado vazio (ou voltar no navegador) muda `q` de fora: o campo acompanha. A busca
  // que o próprio campo aplicou não reescreve o que está sendo digitado (ex.: espaço no fim).
  if (q !== syncedQ) {
    setSyncedQ(q);
    setRequested(q ?? "");
    if (value.trim() !== (q ?? "")) setValue(q ?? "");
  }

  useEffect(() => () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
  }, []);

  function apply(next: string) {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
    const term = next.trim();
    if (term === requested) return;
    setRequested(term);
    router.replace(navHref({ path: TRANSACTIONS_PATH, month, current, categoria, q: term || null }), { scroll: false });
  }

  function change(next: string) {
    setValue(next);
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => apply(next), DEBOUNCE_MS);
  }

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        apply(value);
      }}
      className="relative w-full md:max-w-[320px]"
    >
      <label htmlFor="busca" className="sr-only">
        {t.label}
      </label>
      <input
        id="busca"
        type="search"
        value={value}
        maxLength={80}
        placeholder={t.placeholder}
        autoComplete="off"
        onChange={(e) => change(e.target.value)}
        className={cn(inputClass, fieldBorder(null), "pr-11 [&::-webkit-search-cancel-button]:hidden")}
      />
      {value && (
        <button
          type="button"
          aria-label={t.clear}
          onClick={() => {
            setValue("");
            apply("");
          }}
          className="absolute inset-y-0 right-0 flex w-11 cursor-pointer items-center justify-center text-xl text-text-secondary hover:text-text"
        >
          ×
        </button>
      )}
    </form>
  );
}
