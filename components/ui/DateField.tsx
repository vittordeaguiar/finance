"use client";

import { useState } from "react";
import { copy } from "@/lib/copy";
import { cn } from "@/lib/cn";
import { todayInSaoPaulo } from "@/lib/dates";
import { ChangedNote, FieldShell, describedBy, fieldBorder, inputClass } from "./Field";

type DateFieldProps = {
  id: string;
  name: string;
  label?: string;
  /** Padrão: hoje em São Paulo. */
  defaultValue?: string;
  error?: string | null;
  disabled?: boolean;
  /** Edição: marca "ALTERADO · ERA …" e borda de destaque. */
  changedNote?: string | null;
  onValueChange?: (value: string) => void;
  /** Edição: sem o texto de ajuda nem a marca HOJE (print 46). */
  plain?: boolean;
};

export function DateField({
  id,
  name,
  label = copy.tx.date,
  defaultValue,
  error,
  disabled,
  changedNote,
  onValueChange,
  plain,
}: DateFieldProps) {
  const [today] = useState(() => todayInSaoPaulo());
  const [value, setValue] = useState(defaultValue ?? today);
  const help = plain ? undefined : copy.tx.dateHelp;

  return (
    <FieldShell
      id={id}
      label={label}
      hint={help}
      error={error}
      labelAside={
        changedNote ? (
          <ChangedNote>{changedNote}</ChangedNote>
        ) : !plain && value === today ? (
          <span className="font-mono text-[11px] tracking-label text-accent md:text-xs">{copy.tx.dateToday}</span>
        ) : null
      }
    >
      <input
        id={id}
        name={name}
        type="date"
        required
        max={today}
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          onValueChange?.(event.target.value);
        }}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, help, error)}
        className={cn(inputClass, "tabular", fieldBorder(error), !error && changedNote && "border-accent")}
      />
    </FieldShell>
  );
}
