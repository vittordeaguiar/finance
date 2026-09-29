"use client";

// Rede de segurança para erros inesperados. Falhas de leitura do Supabase já são tratadas em page.tsx.

import { DashboardView } from "@/components/finance/DashboardView";
import { LoadError } from "@/components/finance/LoadError";

export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <DashboardView summary={{ kind: "error" }} history={<LoadError reset={reset} />} />;
}
