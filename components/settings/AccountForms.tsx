"use client";

import { useCallback, useEffect } from "react";
import {
  updatePassword,
  updateProfileName,
  type FieldState,
  type PasswordState,
} from "@/app/(app)/configuracoes/actions";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useToast } from "@/components/ui/Toast";
import { copy } from "@/lib/copy";
import { useFormAction } from "@/lib/use-form-action";

const t = copy.settings;
const cardClass = "flex flex-col gap-5 border border-border bg-surface px-4 py-5 md:px-6 md:py-6";

/** Nome editável e email só leitura. */
export function ProfileForm({ name, email }: { name: string; email: string | null }) {
  const toast = useToast();
  const action = useCallback(
    async (prev: FieldState, formData: FormData) => {
      const result = await updateProfileName(prev, formData);
      if (result.status === "success")
        toast({ title: t.profile.toast, body: String(formData.get("name") ?? "").trim() });
      return result;
    },
    [toast],
  );
  const { state, pending, formProps } = useFormAction<FieldState>(action, { status: "idle" });

  return (
    <form {...formProps} className={cardClass}>
      {state.status === "error" && <Alert tone="error">{copy.tx.errorServer}</Alert>}
      <TextField
        id="profile-name"
        name="name"
        label={t.profile.name}
        defaultValue={name}
        maxLength={80}
        autoComplete="name"
        error={state.status === "invalid" ? state.error : undefined}
        disabled={pending}
      />
      {email && (
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[11px] tracking-label text-text-secondary md:text-xs">{t.profile.email}</span>
          <span className="font-mono text-[15px] break-all">{email}</span>
        </div>
      )}
      <Button type="submit" className="self-start" pending={pending} pendingLabel={copy.tx.submitting}>
        {t.profile.save}
      </Button>
    </form>
  );
}

/** Nova senha + confirmação, com as regras do cadastro. */
export function PasswordForm() {
  const toast = useToast();
  const action = useCallback(
    async (prev: PasswordState, formData: FormData) => {
      const result = await updatePassword(prev, formData);
      if (result.status === "success") toast({ title: t.password.toast, body: t.password.toastBody });
      return result;
    },
    [toast],
  );
  const { state, pending, formProps, formRef } = useFormAction<PasswordState>(action, { status: "idle" });
  const fieldErrors = state.status === "invalid" ? state.fieldErrors : {};
  // Depois de salvar, limpa os campos (a senha nova não fica na tela).
  const savedSeq = state.status === "success" ? state.seq : null;
  useEffect(() => {
    if (savedSeq !== null) formRef.current?.reset();
  }, [savedSeq, formRef]);

  return (
    <form {...formProps} className={cardClass}>
      {state.status === "error" && <Alert tone="error">{copy.tx.errorServer}</Alert>}
      <TextField
        id="settings-password"
        name="password"
        type="password"
        label={t.password.new}
        hint={copy.signup.passwordHint}
        hintStyle="mono"
        autoComplete="new-password"
        error={fieldErrors.password}
        disabled={pending}
      />
      <TextField
        id="settings-confirm"
        name="confirm"
        type="password"
        label={t.password.confirm}
        autoComplete="new-password"
        error={fieldErrors.confirm}
        disabled={pending}
      />
      <Button type="submit" className="self-start" pending={pending} pendingLabel={copy.tx.submitting}>
        {t.password.save}
      </Button>
    </form>
  );
}
