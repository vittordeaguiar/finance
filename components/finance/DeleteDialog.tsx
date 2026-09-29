"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogBody, DialogFooter, DialogHeader } from "@/components/ui/Dialog";
import { copy } from "@/lib/copy";
import type { Transaction } from "@/lib/transactions";
import { EditTransactionForm } from "./EditTransactionForm";
import { RecurrenceNote } from "./RecurrenceNote";
import { TransactionCard } from "./TransactionCard";

export type DeleteStep = "detail" | "edit";

type DeleteDialogProps = {
  transaction: Transaction | null;
  /** detail: sheet de detalhe (mobile) · edit: formulário de edição (desktop abre direto nele). V8: excluir não confirma. */
  step: DeleteStep;
  balanceBefore: number | null;
  onStepChange: (step: DeleteStep) => void;
  onClose: () => void;
  onDelete: (tx: Transaction) => void;
  onEdited: (tx: Transaction, balanceAfter: number | null) => void;
};

export function DeleteDialog({
  transaction,
  step,
  balanceBefore,
  onStepChange,
  onClose,
  onDelete,
  onEdited,
}: DeleteDialogProps) {
  const [saving, setSaving] = useState(false);
  const t = copy.del;
  const editing = step === "edit";
  const titleId = editing ? "edit-title" : "del-detail-title";

  return (
    <Dialog
      open={transaction !== null}
      onClose={onClose}
      labelledBy={titleId}
      role="dialog"
      width={editing ? "md" : "sm"}
      dismissible={!saving}
    >
      {transaction && editing && (
        <EditTransactionForm
          transaction={transaction}
          balanceCents={balanceBefore}
          titleId={titleId}
          onClose={onClose}
          onPendingChange={setSaving}
          onSaved={onEdited}
        />
      )}
      {transaction && !editing && (
        <>
          <DialogHeader
            eyebrow={t.detailEyebrow}
            eyebrowTone="accent"
            title={t.detailTitle}
            titleId={titleId}
            onClose={onClose}
            titleClassName="text-[26px] md:text-[30px]"
          />
          <DialogBody className="gap-4 py-5 md:gap-4 md:py-5">
            <TransactionCard tx={transaction} />
            {transaction.recurrenceId && <RecurrenceNote />}
          </DialogBody>
          <DialogFooter>
            {/* Print 48: com a edição, o sheet de detalhe tem só as duas ações; fechar fica no × e no Esc. */}
            <Button size="xl" onClick={() => onStepChange("edit")} data-autofocus>
              {copy.edit.detailAction}
            </Button>
            <Button variant="danger-outline" size="xl" onClick={() => onDelete(transaction)}>
              {t.detailAction}
            </Button>
          </DialogFooter>
        </>
      )}
    </Dialog>
  );
}
