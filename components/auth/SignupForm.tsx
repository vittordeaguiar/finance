"use client";

import { signUp, type SignupState } from "@/app/(auth)/actions";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { TextLink } from "@/components/ui/TextLink";
import { copy } from "@/lib/copy";
import { useFormAction } from "@/lib/use-form-action";
import { AuthFooter, FormHeading } from "./AuthShell";

const initialState: SignupState = { fieldErrors: {}, emailTaken: false, formError: false };

export function SignupForm() {
  const { state, pending, formProps } = useFormAction(signUp, initialState);
  const t = copy.signup;
  const errors = state.fieldErrors;
  const emailError = state.emailTaken ? (
    <>
      {t.errorEmailTaken} <TextLink href="/login">{t.errorEmailTakenLink}</TextLink>
    </>
  ) : (
    errors.email
  );

  return (
    <form {...formProps} aria-busy={pending || undefined} className="flex flex-1 flex-col gap-4 md:flex-none md:gap-7">
      <FormHeading eyebrow={t.eyebrow} title={t.title} desktopOnly />

      {state.formError && <Alert tone="error">{t.errorServer}</Alert>}

      <div className="flex flex-col gap-4 md:gap-[18px]">
        <TextField
          id="name"
          name="name"
          autoComplete="name"
          label={t.name}
          placeholder={t.namePlaceholder}
          error={errors.name}
          disabled={pending}
          className="disabled:opacity-100"
        />
        <TextField
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          label={t.email}
          placeholder={copy.login.emailPlaceholder}
          error={emailError}
          disabled={pending}
          className="disabled:opacity-100"
        />
        <TextField
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          label={t.password}
          hint={t.passwordHint}
          hintStyle="mono"
          error={errors.password}
          disabled={pending}
          className="disabled:opacity-100"
        />
        <TextField
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          label={t.confirm}
          error={errors.confirm}
          disabled={pending}
          className="disabled:opacity-100"
        />
      </div>

      <div className="mt-auto flex flex-col gap-3.5 pt-2 md:mt-0 md:gap-7 md:pt-0">
        <Button type="submit" size="xl" className="md:h-[52px]" trailing="→" fullWidth pending={pending} pendingLabel={t.submitting}>
          {t.submit}
        </Button>
        <AuthFooter>
          {t.loginPrompt} <TextLink href="/login">{t.loginLink}</TextLink>
        </AuthFooter>
      </div>
    </form>
  );
}
