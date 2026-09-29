"use client";

import { signIn, type LoginState } from "@/app/(auth)/actions";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { TextLink } from "@/components/ui/TextLink";
import { copy } from "@/lib/copy";
import { useFormAction } from "@/lib/use-form-action";
import { AuthFooter, FormHeading } from "./AuthShell";

const initialState: LoginState = { error: false };

export function LoginForm() {
  const { state, pending, formProps } = useFormAction(signIn, initialState);
  const t = copy.login;

  return (
    <form {...formProps} aria-busy={pending || undefined} className="flex flex-1 flex-col gap-[18px] md:flex-none md:gap-8">
      <FormHeading eyebrow={t.eyebrow} title={t.title} body={t.subtitle} bodyDesktopOnly />

      {state.error && (
        <Alert tone="error" title={t.errorTitle}>
          {t.errorBody}
        </Alert>
      )}

      <div className="flex flex-col gap-[18px] md:gap-5">
        <TextField
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          label={t.email}
          placeholder={t.emailPlaceholder}
          error={state.error || null}
          disabled={pending}
          className="disabled:opacity-100"
        />
        <TextField
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          label={t.password}
          error={state.error || null}
          disabled={pending}
          className="disabled:opacity-100"
          labelAside={
            <TextLink href="/recuperar-senha" className="text-sm font-medium">
              {t.forgot}
            </TextLink>
          }
        />
      </div>

      <div className="mt-auto flex flex-col gap-3.5 md:mt-0 md:gap-8">
        <Button type="submit" size="xl" className="md:h-[52px]" trailing="→" fullWidth pending={pending} pendingLabel={t.submitting}>
          {t.submit}
        </Button>
        <AuthFooter>
          {t.signupPrompt} <TextLink href="/cadastro">{t.signupLink}</TextLink>
        </AuthFooter>
      </div>
    </form>
  );
}
