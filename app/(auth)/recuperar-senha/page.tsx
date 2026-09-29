import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { ResetRequestFlow } from "@/components/auth/PasswordReset";

export const metadata: Metadata = { title: "Recuperar acesso · Saldo." };

export default function ResetRequestPage() {
  return (
    <AuthShell variant="recovery">
      <ResetRequestFlow />
    </AuthShell>
  );
}
