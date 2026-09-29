import type { EmailOtpType } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { RECOVERY_COOKIE, RECOVERY_MAX_AGE_SECONDS } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

/**
 * Recebe o link do email. Preferimos `token_hash` (template customizado, funciona em qualquer
 * dispositivo); `code` (PKCE) fica como alternativa para o template padrão do Supabase.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next");
  const next = nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/";
  const isRecovery = type === "recovery" || next === "/nova-senha";

  const supabase = await createClient();
  let ok = false;
  if (tokenHash && type) {
    ok = !(await supabase.auth.verifyOtp({ type, token_hash: tokenHash })).error;
  } else if (code) {
    ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
  }

  if (!ok) {
    return NextResponse.redirect(new URL(isRecovery ? "/nova-senha?erro=expirado" : "/login", origin));
  }

  if (isRecovery) {
    (await cookies()).set(RECOVERY_COOKIE, "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: RECOVERY_MAX_AGE_SECONDS,
      path: "/",
    });
  }
  return NextResponse.redirect(new URL(next, origin));
}
