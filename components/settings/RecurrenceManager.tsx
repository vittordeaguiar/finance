"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState, useTransition } from "react";
import {
  endRecurrence,
  updateRecurrence,
  type RecurrenceState,
} from "@/app/(app)/configuracoes/actions";
import { CategoryField } from "@/components/finance/CategoryField";
import { ROW_MOTION } from "@/components/finance/row-motion";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { CategoryTag } from "@/components/ui/CategoryTag";
import { Dialog, DialogBody, DialogFooter, DialogHeader } from "@/components/ui/Dialog";
import { MoneyField } from "@/components/ui/MoneyField";
import { TextField } from "@/components/ui/TextField";
import { TypeTag } from "@/components/ui/TypeTag";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";
import { copy } from "@/lib/copy";
import { formatBRL, formatSigned } from "@/lib/money";
import type { Recurrence } from "@/lib/transactions";
import { useFormAction } from "@/lib/use-form-action";

const idle: RecurrenceState = { status: "idle" };
const t = copy.recurrence;

type Target = { recurrence: Recurrence; action: "edit" | "end" };

/** Séries ativas (já ordenadas: despesas, depois receitas, cada grupo pelo dia): editar e encerrar. */
export function RecurrenceManager({ recurrences }: { recurrences: Recurrence[] }) {
  const [target, setTarget] = useState<Target | null>(null);
  // Remonta o diálogo a cada abertura sem desmontá-lo ao fechar (o <dialog> devolve o foco ao botão).
  const [session, setSession] = useState(0);
  const toast = useToast();

  const open = useCallback((next: Target) => {
    setSession((n) => n + 1);
    setTarget(next);
  }, []);
  const close = useCallback(() => setTarget(null), []);

  return (
    <>
      {recurrences.length === 0 ? (
        <p className="border border-border bg-surface px-4 py-5 text-[15px] leading-[1.6] text-text-secondary md:px-6">
          {t.empty}
        </p>
      ) : (
        <ul className="flex flex-col border border-border bg-surface">
          <AnimatePresence initial={false}>
            {recurrences.map((recurrence) => (
              <motion.li
                key={recurrence.id}
                {...ROW_MOTION}
                className="overflow-hidden border-b border-border-subtle last:border-b-0"
              >
                <RecurrenceRow recurrence={recurrence} onAction={(action) => open({ recurrence, action })} />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
      <EditRecurrenceDialog
        key={`edit-${session}`}
        recurrence={target?.action === "edit" ? target.recurrence : null}
        onClose={close}
        onSaved={(description) => {
          setTarget(null);
          toast({ title: t.toastUpdated, body: description });
        }}
      />
      <EndRecurrenceDialog
        key={`end-${session}`}
        recurrence={target?.action === "end" ? target.recurrence : null}
        onClose={close}
        onEnded={(recurrence) => {
          setTarget(null);
          toast({ title: t.toastEnded, body: recurrence.description });
        }}
      />
    </>
  );
}

function RecurrenceRow({
  recurrence: r,
  onAction,
}: {
  recurrence: Recurrence;
  onAction: (action: Target["action"]) => void;
}) {
  return (
    <div className="flex flex-col gap-2 px-4 py-3 md:flex-row md:items-center md:justify-between md:gap-4 md:px-6">
      <span className="flex min-w-0 flex-col gap-1.5">
        <span className="flex min-w-0 items-baseline justify-between gap-3">
          <span className="truncate text-base font-medium">{r.description}</span>
          <span
            className={cn(
              "tabular text-[17px] font-semibold whitespace-nowrap md:hidden",
              r.type === "income" ? "text-income" : "text-expense",
            )}
          >
            {formatSigned(r.type, r.amountCents)}
          </span>
        </span>
        <span className="flex min-w-0 flex-wrap items-center gap-2">
          <TypeTag type={r.type} size="xs" />
          {r.categoryName ? (
            <CategoryTag name={r.categoryName} size="xs" />
          ) : (
            <span className="text-[13px] text-text-secondary">{copy.category.none}</span>
          )}
          <span className="font-mono text-[11px] tracking-[0.06em] text-text-secondary md:text-xs">
            {t.dayLabel(r.dayOfMonth)}
          </span>
        </span>
      </span>
      <span className="flex shrink-0 items-center justify-end gap-3 max-md:-mr-2.5">
        <span
          className={cn(
            "tabular hidden text-[17px] font-semibold whitespace-nowrap md:inline",
            r.type === "income" ? "text-income" : "text-expense",
          )}
        >
          {formatSigned(r.type, r.amountCents)}
        </span>
        <span className="flex gap-1">
          <button
            type="button"
            aria-label={t.editLabel(r.description)}
            onClick={() => onAction("edit")}
            className="h-11 cursor-pointer rounded-sm border border-transparent px-2.5 text-[13px] font-medium text-accent transition-colors duration-[120ms] hover:border-border md:h-9"
          >
            {t.edit}
          </button>
          <button
            type="button"
            aria-label={t.endLabel(r.description)}
            onClick={() => onAction("end")}
            className="h-11 cursor-pointer rounded-sm border border-transparent px-2.5 text-[13px] font-medium text-text-secondary transition-colors duration-[120ms] hover:border-border hover:text-text md:h-9"
          >
            {t.end}
          </button>
        </span>
      </span>
    </div>
  );
}

function EditRecurrenceDialog({
  recurrence,
  onClose,
  onSaved,
}: {
  recurrence: Recurrence | null;
  onClose: () => void;
  onSaved: (description: string) => void;
}) {
  const [pending, setPending] = useState(false);
  const titleId = "recurrence-edit-title";
  return (
    <Dialog open={recurrence !== null} onClose={onClose} labelledBy={titleId} dismissible={!pending}>
      {recurrence && (
        <EditRecurrenceForm
          recurrence={recurrence}
          titleId={titleId}
          onClose={onClose}
          onPendingChange={setPending}
          onSaved={onSaved}
        />
      )}
    </Dialog>
  );
}

function EditRecurrenceForm({
  recurrence: r,
  titleId,
  onClose,
  onPendingChange,
  onSaved,
}: {
  recurrence: Recurrence;
  titleId: string;
  onClose: () => void;
  onPendingChange: (pending: boolean) => void;
  onSaved: (description: string) => void;
}) {
  const [categoryId, setCategoryId] = useState(r.categoryId ?? "");
  const [newCategory, setNewCategory] = useState("");
  const action = useCallback(
    async (prev: RecurrenceState, formData: FormData) => {
      onPendingChange(true);
      const result = await updateRecurrence(r.id, prev, formData);
      onPendingChange(false);
      if (result.status === "success") onSaved(result.description);
      return result;
    },
    [r.id, onPendingChange, onSaved],
  );
  const { state, pending, formProps } = useFormAction(action, idle);
  const fieldErrors = state.status === "invalid" ? state.fieldErrors : {};

  return (
    <form {...formProps} aria-busy={pending || undefined}>
      <DialogHeader
        eyebrow={t.tag}
        title={t.editTitle}
        titleId={titleId}
        onClose={onClose}
        closeDisabled={pending}
        titleClassName="text-[26px] md:text-[30px]"
      >
        <div className="flex flex-wrap items-center gap-2.5 md:gap-3">
          <TypeTag type={r.type} size="md" />
          <span className="font-mono text-[11px] tracking-[0.06em] text-text-secondary md:text-xs">
            {t.dayLabel(r.dayOfMonth)}
          </span>
        </div>
      </DialogHeader>
      <DialogBody>
        {state.status === "invalid" && <Alert tone="error">{copy.tx.errorSummary}</Alert>}
        {state.status === "error" && <Alert tone="error">{copy.tx.errorServer}</Alert>}
        <TextField
          id="recurrence-description"
          name="description"
          label={copy.tx.description}
          autoComplete="off"
          maxLength={80}
          defaultValue={r.description}
          error={fieldErrors.description}
          disabled={pending}
          data-autofocus
        />
        <CategoryField
          id="recurrence-category"
          type={r.type}
          value={categoryId}
          onChange={setCategoryId}
          newName={newCategory}
          onNewNameChange={setNewCategory}
          error={fieldErrors.newCategory}
          disabled={pending}
        />
        <MoneyField
          id="recurrence-amount"
          name="amount"
          type={r.type}
          defaultValue={formatBRL(r.amountCents)}
          error={fieldErrors.amount}
          disabled={pending}
        />
        <Alert tone="info" role="status">
          {t.editNote}
        </Alert>
      </DialogBody>
      <DialogFooter>
        <Button
          type="submit"
          size="xl"
          className="md:h-12 md:px-6 md:text-[15px]"
          pending={pending}
          pendingLabel={copy.tx.submitting}
        >
          {t.save}
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

function EndRecurrenceDialog({
  recurrence,
  onClose,
  onEnded,
}: {
  recurrence: Recurrence | null;
  onClose: () => void;
  onEnded: (recurrence: Recurrence) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);
  const titleId = "recurrence-end-title";

  function confirm(target: Recurrence) {
    setFailed(false);
    startTransition(async () => {
      const result = await endRecurrence(target.id);
      if (!result.ok) {
        setFailed(true);
        return;
      }
      onEnded(target);
    });
  }

  return (
    <Dialog
      open={recurrence !== null}
      onClose={onClose}
      labelledBy={titleId}
      role="alertdialog"
      width="sm"
      dismissible={!pending}
    >
      {recurrence && (
        <>
          <DialogHeader
            eyebrow={t.tag}
            eyebrowTone="error"
            title={t.endTitle}
            titleId={titleId}
            onClose={onClose}
            closeDisabled={pending}
            titleClassName="text-[26px] md:text-[30px]"
          />
          <DialogBody className="gap-4 py-5 md:gap-4 md:py-5">
            {failed && <Alert tone="error">{copy.tx.errorServer}</Alert>}
            <p className="text-[15px] leading-[1.6] text-text-secondary">{t.endBody(recurrence.description)}</p>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="danger"
              size="xl"
              className="md:h-12 md:px-[22px]"
              pending={pending}
              pendingLabel={t.ending}
              onClick={() => confirm(recurrence)}
            >
              {t.endConfirm}
            </Button>
            <Button
              variant="ghost"
              size="xl"
              className="h-[52px] md:h-11"
              disabled={pending}
              onClick={onClose}
              data-autofocus
            >
              {copy.common.cancel}
            </Button>
          </DialogFooter>
        </>
      )}
    </Dialog>
  );
}
