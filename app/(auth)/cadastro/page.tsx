import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = { title: "Criar conta · Saldo." };

export default function SignupPage() {
  return (
    <AuthShell variant="signup">
      <SignupForm />
    </AuthShell>
  );
}
