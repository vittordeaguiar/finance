import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AuthShell } from "@/components/auth/AuthShell";
import { ExpiredLink, NewPasswordForm } from "@/components/auth/PasswordReset";
import { RECOVERY_COOKIE } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Nova senha · Saldo." };

export default async function NewPasswordPage({ searchParams }: PageProps<"/nova-senha">) {
  const { erro } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const hasRecoverySession = Boolean(user) && (await cookies()).has(RECOVERY_COOKIE);
  const expired = erro === "expirado" || !hasRecoverySession;

  return <AuthShell variant="recovery">{expired ? <ExpiredLink /> : <NewPasswordForm />}</AuthShell>;
}
