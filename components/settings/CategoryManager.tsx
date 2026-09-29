"use client";

import { useCallback, useState, useTransition, type KeyboardEvent } from "react";
import { createCategory, deleteCategory, renameCategory, type FieldState } from "@/app/(app)/configuracoes/actions";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogBody, DialogFooter, DialogHeader } from "@/components/ui/Dialog";
import { TextField } from "@/components/ui/TextField";
import { useToast } from "@/components/ui/Toast";
import { copy } from "@/lib/copy";
import type { TransactionType } from "@/lib/money";
import type { Category } from "@/lib/transactions";
import { useFormAction } from "@/lib/use-form-action";

const idle: FieldState = { status: "idle" };
const TYPES: TransactionType[] = ["expense", "income"];
const t = copy.settings.categories;

type CategoryManagerProps = {
  categories: Category[];
  /** Movimentações por categoria (id → quantidade). */
  usage: Record<string, number>;
};

/** Categorias de despesa e de receita, lado a lado no desktop: criar, renomear e excluir. */
export function CategoryManager({ categories, usage }: CategoryManagerProps) {
  const [removing, setRemoving] = useState<Category | null>(null);
  const [session, setSession] = useState(0);
  const toast = useToast();

  const askDelete = useCallback((category: Category) => {
    setSession((n) => n + 1);
    setRemoving(category);
  }, []);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
        {TYPES.map((type) => (
          <CategoryList
            key={type}
            type={type}
            categories={categories.filter((c) => c.type === type)}
            usage={usage}
            onDelete={askDelete}
          />
        ))}
      </div>
      <DeleteCategoryDialog
        key={session}
        category={removing}
        count={removing ? (usage[removing.id] ?? 0) : 0}
        onClose={() => setRemoving(null)}
        onDeleted={(category) => {
          setRemoving(null);
          toast({ title: t.toastDeleted, body: category.name });
        }}
      />
    </>
  );
}

function CategoryList({
  type,
  categories,
  usage,
  onDelete,
}: {
  type: TransactionType;
  categories: Category[];
  usage: Record<string, number>;
  onDelete: (category: Category) => void;
}) {
  const [renaming, setRenaming] = useState<string | null>(null);
  const label = type === "expense" ? t.expense : t.income;
  const headingId = `categorias-${type}`;

  return (
    <section aria-labelledby={headingId} className="flex min-w-0 flex-col border border-border bg-surface">
      <h3
        id={headingId}
        className={`border-b border-border-subtle px-4 py-3 font-mono text-[11px] tracking-label md:px-6 md:text-xs ${type === "expense" ? "text-expense" : "text-income"}`}
      >
        {copy.type[type].split(" ")[0]} {label}
      </h3>
      <ul className="flex flex-col">
        {categories.map((category) => (
          <li key={category.id} className="border-b border-border-subtle">
            {renaming === category.id ? (
              <RenameForm category={category} onDone={() => setRenaming(null)} />
            ) : (
              <div className="flex min-h-14 items-center justify-between gap-3 px-4 py-2 md:px-6">
                <span className="flex min-w-0 flex-col gap-0.5 md:flex-row md:items-baseline md:gap-3">
                  <span className="truncate text-base font-medium">{category.name}</span>
                  <span className="shrink-0 text-[13px] whitespace-nowrap text-text-secondary">
                    {t.count(usage[category.id] ?? 0)}
                  </span>
                </span>
                <span className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    aria-label={t.renameLabel(category.name)}
                    onClick={() => setRenaming(category.id)}
                    className="h-11 cursor-pointer rounded-sm border border-transparent px-2.5 text-[13px] font-medium text-accent transition-colors duration-[120ms] hover:border-border md:h-9"
                  >
                    {t.rename}
                  </button>
                  <button
                    type="button"
                    aria-label={t.deleteLabel(category.name)}
                    onClick={() => onDelete(category)}
                    className="h-11 cursor-pointer rounded-sm border border-transparent px-2.5 text-[13px] font-medium text-text-secondary transition-colors duration-[120ms] hover:border-border hover:text-text md:h-9"
                  >
                    {t.delete}
                  </button>
                </span>
              </div>
            )}
          </li>
        ))}
      </ul>
      <AddForm type={type} />
    </section>
  );
}

function RenameForm({ category, onDone }: { category: Category; onDone: () => void }) {
  const toast = useToast();
  const action = useCallback(
    async (prev: FieldState, formData: FormData) => {
      const result = await renameCategory(category.id, prev, formData);
      if (result.status === "success") {
        toast({ title: t.toastRenamed, body: String(formData.get("name") ?? "").trim() });
        onDone();
      }
      return result;
    },
    [category.id, onDone, toast],
  );
  const { state, pending, formProps } = useFormAction(action, idle);
  const id = `rename-${category.id}`;

  function onKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onDone();
    }
  }

  return (
    <form {...formProps} onKeyDown={onKeyDown} className="flex flex-col gap-3 px-4 py-3 md:px-6">
      {state.status === "error" && <Alert tone="error">{copy.tx.errorServer}</Alert>}
      <TextField
        id={id}
        name="name"
        label={t.rename.toUpperCase()}
        defaultValue={category.name}
        maxLength={30}
        autoComplete="off"
        autoFocus
        error={state.status === "invalid" ? state.error : undefined}
        disabled={pending}
      />
      <div className="flex gap-2.5">
        <Button type="submit" size="sm" pending={pending} pendingLabel={copy.tx.submitting}>
          {t.save}
        </Button>
        <Button variant="ghost" size="sm" onClick={onDone} disabled={pending}>
          {copy.common.cancel}
        </Button>
      </div>
    </form>
  );
}

function AddForm({ type }: { type: TransactionType }) {
  const toast = useToast();
  const [value, setValue] = useState("");
  const action = useCallback(
    async (prev: FieldState, formData: FormData) => {
      const result = await createCategory(type, prev, formData);
      if (result.status === "success") {
        toast({ title: t.toastAdded, body: String(formData.get("name") ?? "").trim() });
        setValue("");
      }
      return result;
    },
    [type, toast],
  );
  const { state, pending, formProps } = useFormAction(action, idle);
  const id = `new-category-${type}`;

  return (
    <form {...formProps} className="flex flex-col gap-3 px-4 py-4 md:px-6">
      {state.status === "error" && <Alert tone="error">{copy.tx.errorServer}</Alert>}
      <div className="flex items-end gap-2.5">
        <TextField
          id={id}
          name="name"
          label={t.newLabel}
          placeholder={copy.category.newPlaceholder}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          maxLength={30}
          autoComplete="off"
          error={state.status === "invalid" ? state.error : undefined}
          disabled={pending}
          fieldClassName="flex-1"
        />
        <Button
          type="submit"
          variant="secondary"
          className="h-[52px] md:h-12"
          pending={pending}
          pendingLabel={copy.tx.submitting}
        >
          {t.add}
        </Button>
      </div>
    </form>
  );
}

function DeleteCategoryDialog({
  category,
  count,
  onClose,
  onDeleted,
}: {
  category: Category | null;
  count: number;
  onClose: () => void;
  onDeleted: (category: Category) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);
  const titleId = "category-delete-title";

  function confirm(target: Category) {
    setFailed(false);
    startTransition(async () => {
      const result = await deleteCategory(target.id);
      if (!result.ok) {
        setFailed(true);
        return;
      }
      onDeleted(target);
    });
  }

  return (
    <Dialog
      open={category !== null}
      onClose={onClose}
      labelledBy={titleId}
      role="alertdialog"
      width="sm"
      dismissible={!pending}
    >
      {category && (
        <>
          <DialogHeader
            eyebrow={t.deleteEyebrow}
            eyebrowTone="error"
            title={t.deleteTitle(category.name)}
            titleId={titleId}
            onClose={onClose}
            closeDisabled={pending}
            titleClassName="text-[26px] md:text-[30px]"
          />
          <DialogBody className="gap-4 py-5 md:gap-4 md:py-5">
            {failed && <Alert tone="error">{copy.tx.errorServer}</Alert>}
            <p className="text-[15px] leading-[1.6] text-text-secondary">{t.deleteBody(count)}</p>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="danger"
              size="xl"
              className="md:h-12 md:px-[22px]"
              pending={pending}
              pendingLabel={copy.del.confirmSubmitting}
              onClick={() => confirm(category)}
            >
              {t.deleteSubmit}
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
