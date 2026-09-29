"use client";

import { motion } from "motion/react";
import { useCallback, useId, useRef, useState, type KeyboardEvent } from "react";
import { updateTransaction, type UpdateTransactionState } from "@/app/(app)/actions";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { DateField } from "@/components/ui/DateField";
import { DialogBody, DialogFooter, DialogHeader } from "@/components/ui/Dialog";
import { ChangedNote, labelClass } from "@/components/ui/Field";
import { MoneyField } from "@/components/ui/MoneyField";
import { TextField } from "@/components/ui/TextField";
import { TypeTag } from "@/components/ui/TypeTag";
import { cn } from "@/lib/cn";
import { copy } from "@/lib/copy";
import { formatDateLong } from "@/lib/dates";
import { formatBRL, formatBalance, parseBRLToCents, type TransactionType } from "@/lib/money";
import { balanceAfterEdit, type Transaction } from "@/lib/transactions";
import { useFormAction } from "@/lib/use-form-action";
import { CategoryField } from "./CategoryField";
import { RecurrenceNote } from "./RecurrenceNote";

type EditTransactionFormProps = {
  transaction: Transaction;
  /** Saldo atual (acumulado), para o aviso de impacto. */
  balanceCents: number | null;
  titleId: string;
  onClose: () => void;
  onPendingChange?: (pending: boolean) => void;
  /** `balanceAfter` é calculado com o saldo de antes do envio (a revalidação já traz o novo resumo). */
  onSaved: (tx: Transaction, balanceAfter: number | null) => void;
};

const idle: UpdateTransactionState = { status: "idle" };
const TYPES: TransactionType[] = ["income", "expense"];

/** Conteúdo do modal (desktop) / sheet (mobile) de edição. Renderizado dentro de um <Dialog>. */
export function EditTransactionForm({
  transaction: tx,
  balanceCents,
  titleId,
  onClose,
  onPendingChange,
  onSaved,
}: EditTransactionFormProps) {
  const [type, setType] = useState<TransactionType>(tx.type);
  const [description, setDescription] = useState(tx.description);
  const [amount, setAmount] = useState(formatBRL(tx.amountCents));
  const [occurredAt, setOccurredAt] = useState(tx.occurredAt);
  const [categoryId, setCategoryId] = useState(tx.categoryId ?? "");
  const [newCategory, setNewCategory] = useState("");

  // Categoria é do tipo: trocar o tipo volta para "Sem categoria".
  const changeType = (next: TransactionType) => {
    if (next === type) return;
    setType(next);
    setCategoryId("");
    setNewCategory("");
  };

  const action = useCallback(
    async (prev: UpdateTransactionState, formData: FormData) => {
      onPendingChange?.(true);
      const balanceBefore = balanceCents;
      const result = await updateTransaction(tx.id, prev, formData);
      onPendingChange?.(false);
      if (result.status === "success") {
        const saved = result.transaction;
        onSaved(saved, balanceBefore === null ? null : balanceAfterEdit(balanceBefore, tx, saved));
      }
      return result;
    },
    [tx, balanceCents, onPendingChange, onSaved],
  );
  const { state, pending, formProps } = useFormAction(action, idle);
  const t = copy.edit;
  const fieldErrors = state.status === "invalid" ? state.fieldErrors : {};

  const amountCents = parseBRLToCents(amount);
  const changed = {
    type: type !== tx.type,
    description: description.trim() !== tx.description,
    amount: amountCents !== tx.amountCents,
    occurredAt: occurredAt !== tx.occurredAt,
    category: categoryId !== (tx.categoryId ?? ""),
  };
  const dirty = Object.values(changed).some(Boolean);
  const showImpact = balanceCents !== null && amountCents > 0 && (changed.type || changed.amount);
  const after = showImpact ? balanceAfterEdit(balanceCents, tx, { type, amountCents }) : null;

  return (
    <form {...formProps} aria-busy={pending || undefined}>
      <DialogHeader
        eyebrow={t.eyebrow}
        title={t.title[type]}
        titleId={titleId}
        onClose={onClose}
        closeDisabled={pending}
        titleClassName="text-[26px] md:text-[30px]"
      >
        {/* Ocorrência de recorrência não muda de tipo: fica só a etiqueta, como na criação. */}
        {tx.recurrenceId && <TypeTag type={tx.type} size="md" className="self-start" />}
      </DialogHeader>

      <DialogBody>
        {state.status === "invalid" && <Alert tone="error">{copy.tx.errorSummary}</Alert>}
        {state.status === "error" && <Alert tone="error">{copy.tx.errorServer}</Alert>}
        {tx.recurrenceId ? (
          <>
            <input type="hidden" name="type" value={tx.type} />
            <RecurrenceNote />
          </>
        ) : (
          <TypeSegmented value={type} onChange={changeType} disabled={pending} />
        )}
        <TextField
          id="edit-description"
          name="description"
          label={copy.tx.description}
          autoComplete="off"
          maxLength={80}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          labelAside={changed.description ? <ChangedNote>{t.changed(tx.description)}</ChangedNote> : null}
          className={cn(changed.description && !fieldErrors.description && "border-accent")}
          error={fieldErrors.description}
          disabled={pending}
          data-autofocus
        />
        <CategoryField
          id="edit-category"
          type={type}
          value={categoryId}
          onChange={setCategoryId}
          newName={newCategory}
          onNewNameChange={setNewCategory}
          error={fieldErrors.newCategory}
          changedNote={
            changed.category ? (
              <ChangedNote>{t.changed(tx.categoryName?.toUpperCase() ?? t.changedNone)}</ChangedNote>
            ) : null
          }
          disabled={pending}
        />
        <MoneyField
          id="edit-amount"
          name="amount"
          type={type}
          defaultValue={amount}
          onValueChange={setAmount}
          changedNote={changed.amount ? t.changed(`R$ ${formatBRL(tx.amountCents)}`) : null}
          error={fieldErrors.amount}
          disabled={pending}
        />
        <DateField
          id="edit-date"
          name="occurredAt"
          defaultValue={occurredAt}
          onValueChange={setOccurredAt}
          plain
          changedNote={changed.occurredAt ? t.changed(formatDateLong(tx.occurredAt)) : null}
          error={fieldErrors.occurredAt}
          disabled={pending}
        />
        {showImpact && after !== null && (
          <Alert tone="info" role="status">
            {t.impact.before} <strong className="tabular font-semibold">{formatBalance(balanceCents)}</strong>{" "}
            {t.impact.middle} <strong className="tabular font-semibold">{formatBalance(after)}</strong>
            {t.impact.after}
          </Alert>
        )}
      </DialogBody>

      <DialogFooter>
        <Button
          type="submit"
          size="xl"
          className="md:h-12 md:px-6 md:text-[15px]"
          disabled={!dirty}
          pending={pending}
          pendingLabel={copy.tx.submitting}
        >
          {t.submit}
        </Button>
        <Button
          variant="ghost"
          size="xl"
          className="h-[52px] md:h-12 md:text-[15px]"
          onClick={onClose}
          disabled={pending}
        >
          {copy.common.cancel}
        </Button>
      </DialogFooter>
    </form>
  );
}

/** Controle segmentado ↗ RECEITA | ↘ DESPESA (role="radiogroup", setas trocam a seleção). */
function TypeSegmented({
  value,
  onChange,
  disabled,
}: {
  value: TransactionType;
  onChange: (type: TransactionType) => void;
  disabled?: boolean;
}) {
  const refs = useRef<Record<TransactionType, HTMLButtonElement | null>>({
    income: null,
    expense: null,
  });

  const indicatorId = useId();

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    const next = value === "income" ? "expense" : "income";
    onChange(next);
    refs.current[next]?.focus();
  }

  return (
    <fieldset className="flex flex-col gap-2" disabled={disabled}>
      <legend className={cn(labelClass, "mb-2")}>{copy.edit.type}</legend>
      <input type="hidden" name="type" value={value} />
      <div
        role="radiogroup"
        aria-label={copy.edit.type}
        onKeyDown={onKeyDown}
        className="grid grid-cols-2 rounded-sm border border-border"
      >
        {TYPES.map((type) => {
          const checked = type === value;
          return (
            <button
              key={type}
              ref={(el) => {
                refs.current[type] = el;
              }}
              type="button"
              role="radio"
              aria-checked={checked}
              tabIndex={checked ? 0 : -1}
              onClick={() => onChange(type)}
              className={cn(
                "relative h-12 cursor-pointer bg-surface font-mono text-xs tracking-label md:h-11",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed",
                type === "income" && "border-r border-border",
                checked
                  ? cn("font-semibold", type === "income" ? "text-income" : "text-expense")
                  : "font-medium text-text-secondary",
              )}
            >
              {/* A seleção desliza entre as opções (mesmo layoutId); a cor troca em 120ms. */}
              {checked && (
                <motion.span
                  aria-hidden="true"
                  layoutId={indicatorId}
                  className={cn(
                    "absolute inset-0 transition-colors duration-[120ms]",
                    type === "income"
                      ? "bg-income-bg shadow-[inset_0_0_0_2px_var(--color-income)]"
                      : "bg-expense-bg shadow-[inset_0_0_0_2px_var(--color-expense)]",
                  )}
                />
              )}
              <span className="relative">{copy.type[type]}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
