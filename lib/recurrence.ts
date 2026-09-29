import { cache } from "react";
import { nextDueAfter } from "./dates";

// Cálculo das datas em `dates.ts` (puro, usado também no cliente); aqui ficam a geração e a chamada da RPC.
export { nextDueAfter, recurrenceDate } from "./dates";

/** Datas que a geração lança a partir do cursor `from` até `today` (inclusive), como faz a RPC. */
export function dueDates(from: string, day: number, today: string): string[] {
  const dates: string[] = [];
  for (let date = from; date <= today; date = nextDueAfter(date, day)) dates.push(date);
  return dates;
}

/** Cookie com `usuário:data` da última geração bem-sucedida. O proxy só chama a RPC quando ele não vale para hoje. */
export const RECURRENCES_COOKIE = "saldo_recurrences";
export const RECURRENCES_MAX_AGE_SECONDS = 60 * 60 * 24;

export function recurrencesMarker(userId: string, today: string): string {
  return `${userId}:${today}`;
}

/** Ocorrências só vencem por data: gerado hoje para este usuário, nada novo a lançar até amanhã. */
export function recurrencesUpToDate(value: string | undefined, userId: string, today: string): boolean {
  return value === recurrencesMarker(userId, today);
}

/**
 * Lança as ocorrências vencidas do usuário (RPC idempotente). No máximo uma chamada por requisição.
 * Nas leituras comuns quem chama é o proxy (uma vez por dia); aqui fica só para quem precisa forçar.
 * Falha não impede a leitura: o app segue com os dados que tem e tenta de novo na próxima abertura.
 */
export const ensureRecurrences = cache(async (): Promise<void> => {
  // Import dinâmico: o cliente do servidor é `server-only` e este módulo também é usado nos testes.
  const { createClient } = await import("./supabase/server");
  const supabase = await createClient();
  const { error } = await supabase.rpc("materialize_recurrences");
  if (error) console.error("Erro ao lançar recorrências", error);
});
