"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  validateEmail,
  validateNewPassword,
  validateSignup,
  type FieldErrors,
  type SignupField,
} from "@/lib/validation";
import { RECOVERY_COOKIE } from "@/lib/auth";

// ---------- Login ----------

export type LoginState = { error: boolean };

export async function signIn(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: true };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  // Qualquer erro vira a mensagem genérica (não revelar se a conta existe).
  if (error) return { error: true };
  redirect("/");
}

// ---------- Cadastro ----------

export type SignupState = {
  fieldErrors: FieldErrors<SignupField>;
  emailTaken: boolean;
  formError: boolean;
};

export async function signUp(_prev: SignupState, formData: FormData): Promise<SignupState> {
  const parsed = validateSignup(formData);
  if (!parsed.ok) return { fieldErrors: parsed.fieldErrors, emailTaken: false, formError: false };

  const { name, email, password } = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name }, emailRedirectTo: `${await origin()}/auth/callback` },
  });

  if (error?.code === "user_already_exists" || error?.code === "email_exists") {
    return { fieldErrors: {}, emailTaken: true, formError: false };
  }
  if (error) {
    console.error("[signUp] erro do Supabase Auth:", error.code, error.status, error.message);
    return { fieldErrors: {}, emailTaken: false, formError: true };
  }
  if (!data.session) {
    // Sem sessão = "Confirm email" ligado no projeto Supabase. O app exige confirmação desligada (ver README).
    console.error("[signUp] conta criada sem sessão: desligue 'Confirm email' no Supabase (Authentication > Sign In / Providers > Email).");
    return { fieldErrors: {}, emailTaken: false, formError: true };
  }
  redirect("/");
}

// ---------- Recuperação de senha ----------

export type ResetRequestState = { status: "idle" | "sent"; email: string; fieldError: string | null; formError: boolean; sentAt: number };

export async function requestPasswordReset(prev: ResetRequestState, formData: FormData): Promise<ResetRequestState> {
  const parsed = validateEmail(formData.get("email"));
  if ("error" in parsed) return { ...prev, fieldError: parsed.error, formError: false };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.email, {
    redirectTo: `${await origin()}/auth/callback?next=/nova-senha`,
  });
  // O Supabase não revela se o email existe: "enviado" aparece para qualquer email válido.
  if (error) return { ...prev, email: parsed.email, fieldError: null, formError: true };
  return { status: "sent", email: parsed.email, fieldError: null, formError: false, sentAt: Date.now() };
}

export type NewPasswordState = { fieldErrors: FieldErrors<"password" | "confirm">; formError: boolean };

export async function updatePassword(_prev: NewPasswordState, formData: FormData): Promise<NewPasswordState> {
  const parsed = validateNewPassword(formData);
  if (!parsed.ok) return { fieldErrors: parsed.fieldErrors, formError: false };

  const cookieStore = await cookies();
  if (!cookieStore.has(RECOVERY_COOKIE)) redirect("/nova-senha?erro=expirado");

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.password });
  if (error) return { fieldErrors: {}, formError: true };

  cookieStore.delete(RECOVERY_COOKIE);
  redirect("/");
}

// ---------- Utilidades ----------

async function origin(): Promise<string> {
  const h = await headers();
  const fromHeader = h.get("origin");
  if (fromHeader) return fromHeader;
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}
