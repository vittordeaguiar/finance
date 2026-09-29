"use client";

import { useCallback, useState } from "react";
import { createTransaction, type CreateTransactionState } from "@/app/(app)/actions";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { DateField } from "@/components/ui/DateField";
import { Dialog, DialogBody, DialogFooter, DialogHeader } from "@/components/ui/Dialog";
import { MoneyField } from "@/components/ui/MoneyField";
import { TextField } from "@/components/ui/TextField";
import { TypeTag } from "@/components/ui/TypeTag";
import { copy } from "@/lib/copy";
import { isValidIsoDate, todayInSaoPaulo } from "@/lib/dates";
import type { TransactionType } from "@/lib/money";
import type { Transaction } from "@/lib/transactions";
import { useFormAction } from "@/lib/use-form-action";
import { CategoryField } from "./CategoryField";
import { RepeatField } from "./RepeatField";

type TransactionDialogProps = {
  type: TransactionType;
  open: boolean;
  onClose: () => void;
  /** `recurrence` vem quando "Repetir todo mês" estava marcada. */
  onSaved: (tx: Transaction, recurrence?: { day: number; inserted: number }) => void;
};

const idle: CreateTransactionState = { status: "idle" };

/** Modal (desktop) / bottom sheet (mobile) de criação. O tipo é fixo, definido pelo botão que abriu. */
export function TransactionDialog({ type, open, onClose, onSaved }: TransactionDialogProps) {
  const action = useCallback(
    async (prev: CreateTransactionState, formData: FormData) => {
      const result = await createTransaction(type, prev, formData);
      if (result.status === "success") onSaved(result.transaction, result.recurrence);
      return result;
    },
    [type, onSaved],
  );
  const { state, pending, formProps } = useFormAction(action, idle);
  const t = copy.tx;
  const fieldErrors = state.status === "invalid" ? state.fieldErrors : {};
  const titleId = `tx-title-${type}`;
  const [categoryId, setCategoryId] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [occurredAt, setOccurredAt] = useState(() => todayInSaoPaulo());
  const [repeat, setRepeat] = useState(false);

  return (
    <Dialog open={open} onClose={onClose} labelledBy={titleId} dismissible={!pending}>
      <form {...formProps} aria-busy={pending || undefined}>
        <DialogHeader
          eyebrow={t.eyebrow}
          title={t.title[type]}
          titleId={titleId}
          onClose={onClose}
          closeDisabled={pending}
        >
          <div className="flex flex-wrap items-center gap-2.5 md:gap-3">
            <TypeTag type={type} size="md" />
            <span className="text-sm text-text-secondary">
              <span className="md:hidden">{t.hintMobile[type]}</span>
              <span className="hidden md:inline">{t.hint[type]}</span>
            </span>
          </div>
        </DialogHeader>

        <DialogBody>
          {state.status === "invalid" && <Alert tone="error">{t.errorSummary}</Alert>}
          {state.status === "error" && <Alert tone="error">{t.errorServer}</Alert>}
          <TextField
            id="tx-description"
            name="description"
            label={t.description}
            placeholder={t.descriptionPlaceholder[type]}
            autoComplete="off"
            maxLength={80}
            error={fieldErrors.description}
            disabled={pending}
            data-autofocus
          />
          <CategoryField
            id="tx-category"
            type={type}
            value={categoryId}
            onChange={setCategoryId}
            newName={newCategory}
            onNewNameChange={setNewCategory}
            error={fieldErrors.newCategory}
            disabled={pending}
          />
          <MoneyField id="tx-amount" name="amount" type={type} error={fieldErrors.amount} disabled={pending} />
          <DateField
            id="tx-date"
            name="occurredAt"
            onValueChange={setOccurredAt}
            error={fieldErrors.occurredAt}
            disabled={pending}
          />
          <RepeatField
            id="tx-repeat"
            checked={repeat}
            onChange={setRepeat}
            day={isValidIsoDate(occurredAt) ? Number(occurredAt.slice(8, 10)) : null}
            disabled={pending}
          />
        </DialogBody>

        <DialogFooter>
          <Button
            type="submit"
            size="xl"
            className="md:h-12 md:px-6 md:text-[15px]"
            pending={pending}
            pendingLabel={t.submitting}
          >
            {t.submit[type]}
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
    </Dialog>
  );
}
