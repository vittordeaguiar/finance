"use client";

import { useState, type ChangeEvent } from "react";
import { copy } from "@/lib/copy";
import { cn } from "@/lib/cn";
import { MINUS, maskBRLInput, type TransactionType } from "@/lib/money";
import { ChangedNote, FieldShell, describedBy } from "./Field";

type MoneyFieldProps = {
  id: string;
  name: string;
  type: TransactionType;
  label?: string;
  defaultValue?: string;
  error?: string | null;
  disabled?: boolean;
  /** Edição: marca "ALTERADO · ERA …" e borda de destaque. */
  changedNote?: string | null;
  onValueChange?: (value: string) => void;
};

/** Valor com prefixo semântico (+ R$ / − R$) e máscara de centavos. Envia o texto formatado; o servidor converte. */
export function MoneyField({
  id,
  name,
  type,
  label = copy.tx.amount,
  defaultValue = "",
  error,
  disabled,
  changedNote,
  onValueChange,
}: MoneyFieldProps) {
  const [value, setValue] = useState(() => maskBRLInput(defaultValue));

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const next = maskBRLInput(event.target.value);
    setValue(next);
    onValueChange?.(next);
  }

  return (
    <FieldShell id={id} label={label} error={error} labelAside={changedNote ? <ChangedNote>{changedNote}</ChangedNote> : null}>
      <div
        className={cn(
          "flex h-[60px] rounded-sm border bg-surface md:h-14",
          "focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent",
          error ? "border-expense" : changedNote ? "border-accent" : "border-border",
          disabled && "opacity-60",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "flex items-center border-r border-border px-4 text-lg font-semibold whitespace-nowrap",
            type === "income" ? "bg-income-bg text-income" : "bg-expense-bg text-expense",
          )}
        >
          {type === "income" ? "+ R$" : `${MINUS} R$`}
        </span>
        <input
          id={id}
          name={name}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder={copy.tx.amountPlaceholder}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, undefined, error)}
          className="tabular w-full min-w-0 flex-1 bg-transparent px-4 text-[26px] font-semibold text-text outline-none placeholder:text-text-secondary md:text-2xl"
        />
      </div>
    </FieldShell>
  );
}
