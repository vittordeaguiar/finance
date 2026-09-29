"use client";

import { useEffect, useState } from "react";
import { requestPasswordReset, updatePassword, type NewPasswordState, type ResetRequestState } from "@/app/(auth)/actions";
import { Alert } from "@/components/ui/Alert";
import { Button, ButtonLink } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { TextLink } from "@/components/ui/TextLink";
import { copy } from "@/lib/copy";
import { useFormAction } from "@/lib/use-form-action";
import { FormHeading } from "./AuthShell";

const RESEND_COOLDOWN_MS = 60_000;

function BackToLogin() {
  return (
    <TextLink href="/login" className="my-0 py-3 text-center text-[15px] font-medium md:py-3 md:text-left">
      {copy.common.backToLogin}
    </TextLink>
  );
}

const initialRequest: ResetRequestState = { status: "idle", email: "", fieldError: null, formError: false, sentAt: 0 };

/** Etapas `solicitar` e `enviado` (telas 26/30 e 27). */
export function ResetRequestFlow() {
  const { state, pending, formProps } = useFormAction(requestPasswordReset, initialRequest);
  const t = copy.reset;

  if (state.status === "sent") {
    return (
      <form {...formProps} aria-busy={pending || undefined} className="flex flex-1 flex-col gap-6 md:flex-none">
        <input type="hidden" name="email" value={state.email} />
        <FormHeading
          eyebrow={t.sent.eyebrow}
          title={t.sent.title}
          body={
            <>
              {t.sent.bodyBefore} <strong className="font-semibold text-text">{state.email}</strong>
              {t.sent.bodyAfter}
            </>
          }
        />
        <Alert tone="info" title={t.sent.helpTitle}>
          {t.sent.helpBody}
        </Alert>
        {state.formError && <Alert tone="error">{t.errorServer}</Alert>}
        <div className="mt-auto flex flex-col gap-2.5 md:mt-0">
          <ResendButton key={state.sentAt} pending={pending} />
          <BackToLogin />
        </div>
      </form>
    );
  }

  return (
    <form {...formProps} aria-busy={pending || undefined} className="flex flex-1 flex-col gap-6 md:flex-none">
      <FormHeading eyebrow={t.request.eyebrow} title={t.request.title} body={t.request.body} />
      {state.formError && <Alert tone="error">{t.errorServer}</Alert>}
      <TextField
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        label={copy.login.email}
        placeholder={copy.login.emailPlaceholder}
        defaultValue={state.email}
        error={state.fieldError}
        disabled={pending}
        className="disabled:opacity-100"
      />
      <div className="mt-auto flex flex-col gap-2.5 md:mt-0">
        <Button type="submit" size="xl" className="md:h-[52px]" trailing="→" fullWidth pending={pending} pendingLabel={t.request.submitting}>
          {t.request.submit}
        </Button>
        <BackToLogin />
      </div>
    </form>
  );
}

/** "Reenviar email" fica desabilitado por 60s após cada envio (o Supabase limita a taxa). */
function ResendButton({ pending }: { pending: boolean }) {
  const [coolingDown, setCoolingDown] = useState(true);
  useEffect(() => {
    const timer = window.setTimeout(() => setCoolingDown(false), RESEND_COOLDOWN_MS);
    return () => window.clearTimeout(timer);
  }, []);
  return (
    <Button
      type="submit"
      variant="secondary"
      size="xl"
      className="bg-transparent md:h-[52px]"
      fullWidth
      disabled={coolingDown}
      pending={pending}
      pendingLabel={copy.reset.request.submitting}
    >
      {copy.reset.sent.resend}
    </Button>
  );
}

const initialNewPassword: NewPasswordState = { fieldErrors: {}, formError: false };

/** Etapa `nova` (telas 28/31). */
export function NewPasswordForm() {
  const { state, pending, formProps } = useFormAction(updatePassword, initialNewPassword);
  const t = copy.reset.new;
  return (
    <form {...formProps} aria-busy={pending || undefined} className="flex flex-1 flex-col gap-6 md:flex-none">
      <FormHeading eyebrow={t.eyebrow} title={t.title} body={t.body} />
      {state.formError && <Alert tone="error">{t.errorServer}</Alert>}
      <div className="flex flex-col gap-5">
        <TextField
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          label={t.password}
          hint={copy.signup.passwordHint}
          hintStyle="mono"
          error={state.fieldErrors.password}
          disabled={pending}
          className="disabled:opacity-100"
        />
        <TextField
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          label={t.confirm}
          error={state.fieldErrors.confirm}
          disabled={pending}
          className="disabled:opacity-100"
        />
      </div>
      <div className="mt-auto md:mt-0">
        <Button type="submit" size="xl" className="md:h-[52px]" trailing="→" fullWidth pending={pending} pendingLabel={t.submitting}>
          {t.submit}
        </Button>
      </div>
    </form>
  );
}

/** Etapa `expirado` (tela 29). */
export function ExpiredLink() {
  const t = copy.reset.expired;
  return (
    <div className="flex flex-1 flex-col gap-6 md:flex-none">
      <FormHeading eyebrow={t.eyebrow} eyebrowTone="error" title={t.title} body={t.body} />
      <div className="mt-auto flex flex-col gap-2.5 md:mt-0">
        <ButtonLink href="/recuperar-senha" size="xl" className="md:h-[52px]" trailing="→" fullWidth>
          {t.submit}
        </ButtonLink>
        <BackToLogin />
      </div>
    </div>
  );
}
