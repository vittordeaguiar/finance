// Dinheiro trafega sempre em centavos inteiros. Conversão só na borda (input e exibição).

export const MINUS = "−";
export const MAX_AMOUNT_CENTS = 99_999_999_999;

const integerFormat = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });

/** "1.800,00" → 180000. Tudo que não é dígito é ignorado; vazio → 0. */
export function parseBRLToCents(input: string): number {
  const digits = input.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
  if (digits === "") return 0;
  return Number(digits);
}

/** 440655 → "4.406,55" (sempre valor absoluto; o sinal é montado pela UI). */
export function formatBRL(cents: number): string {
  if (!Number.isSafeInteger(cents)) throw new TypeError(`centavos inválidos: ${cents}`);
  const abs = Math.abs(cents);
  const reais = Math.trunc(abs / 100);
  const centavos = abs % 100;
  return `${integerFormat.format(reais)},${String(centavos).padStart(2, "0")}`;
}

/** Máscara do campo de valor: o usuário digita só números e o campo formata da direita para a esquerda. */
export function maskBRLInput(raw: string): string {
  const cents = parseBRLToCents(raw.replace(/\D/g, "").slice(0, 13));
  return cents === 0 ? "" : formatBRL(cents);
}

/** "+ R$ 1.800,00" */
export function formatIncome(cents: number): string {
  return `+ R$ ${formatBRL(cents)}`;
}

/** "− R$ 412,80" */
export function formatExpense(cents: number): string {
  return `${MINUS} R$ ${formatBRL(cents)}`;
}

/** Saldo: "R$ 4.406,55" ou "− R$ 312,40". */
export function formatBalance(cents: number): string {
  return cents < 0 ? formatExpense(cents) : `R$ ${formatBRL(cents)}`;
}

export type TransactionType = "income" | "expense";

export function formatSigned(type: TransactionType, cents: number): string {
  return type === "income" ? formatIncome(cents) : formatExpense(cents);
}
