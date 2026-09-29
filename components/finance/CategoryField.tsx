"use client";

import type { ReactNode } from "react";
import { FieldShell, fieldBorder, inputClass } from "@/components/ui/Field";
import { TextField } from "@/components/ui/TextField";
import { cn } from "@/lib/cn";
import { copy } from "@/lib/copy";
import type { TransactionType } from "@/lib/money";
import { NEW_CATEGORY_VALUE } from "@/lib/validation";
import { useDashboard } from "./DashboardProvider";

type CategoryFieldProps = {
  id: string;
  type: TransactionType;
  /** "" = Sem categoria · id · `NEW_CATEGORY_VALUE` = nova */
  value: string;
  onChange: (value: string) => void;
  newName: string;
  onNewNameChange: (name: string) => void;
  error?: string;
  changedNote?: ReactNode;
  disabled?: boolean;
};

/** Seletor nativo de categoria (só as do tipo) + campo de nome quando "+ Nova categoria…" é escolhida. */
export function CategoryField({
  id,
  type,
  value,
  onChange,
  newName,
  onNewNameChange,
  error,
  changedNote,
  disabled,
}: CategoryFieldProps) {
  const { categories } = useDashboard();
  const options = categories.filter((c) => c.type === type);
  const isNew = value === NEW_CATEGORY_VALUE;
  const t = copy.category;

  return (
    <>
      <FieldShell id={id} label={t.label} labelAside={changedNote}>
        <select
          id={id}
          name="categoryId"
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            if (event.target.value !== NEW_CATEGORY_VALUE) onNewNameChange("");
          }}
          disabled={disabled}
          className={cn(inputClass, fieldBorder(null), "cursor-pointer", changedNote ? "border-accent" : null)}
        >
          <option value="">{t.none}</option>
          {options.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
          <option value={NEW_CATEGORY_VALUE}>{t.newOption}</option>
        </select>
      </FieldShell>
      {isNew && (
        <TextField
          id={`${id}-new`}
          name="newCategory"
          label={t.newLabel}
          placeholder={t.newPlaceholder}
          autoComplete="off"
          maxLength={30}
          value={newName}
          onChange={(event) => onNewNameChange(event.target.value)}
          error={error}
          disabled={disabled}
          autoFocus
        />
      )}
    </>
  );
}
