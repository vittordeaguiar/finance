// Datas de movimentação são `date` puras (YYYY-MM-DD). Nunca passar por `new Date(iso)`,
// que interpreta em UTC e mostraria o dia anterior em São Paulo.

export const TIME_ZONE = "America/Sao_Paulo";

const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"] as const;

const isoFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Hoje no fuso de São Paulo, como "YYYY-MM-DD". */
export function todayInSaoPaulo(now: Date = new Date()): string {
  return isoFormat.format(now);
}

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isValidIsoDate(value: string): boolean {
  const m = ISO_DATE.exec(value);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (mo < 1 || mo > 12 || d < 1) return false;
  const daysInMonth = new Date(Date.UTC(y, mo, 0)).getUTCDate();
  return d <= daysInMonth;
}

function parts(iso: string): { day: string; month: string; year: string } {
  const m = ISO_DATE.exec(iso);
  if (!m) throw new RangeError(`data inválida: ${iso}`);
  return { day: m[3], month: MONTHS[Number(m[2]) - 1], year: m[1] };
}

/** Desktop: "22 set 2026". */
export function formatDateDesktop(iso: string): string {
  const { day, month, year } = parts(iso);
  return `${day} ${month} ${year}`;
}

/** Lista mobile: "22 SET". */
export function formatDateMobile(iso: string): string {
  const { day, month } = parts(iso);
  return `${day} ${month.toUpperCase()}`;
}

/** Detalhe e confirmação: "22 SET 2026". */
export function formatDateLong(iso: string): string {
  return formatDateDesktop(iso).toUpperCase();
}

// ---------- Mês (filtro do dashboard, V2) ----------

/** "YYYY-MM" */
export type Month = string;

const MONTH_NAMES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
] as const;

const MONTH_RE = /^(\d{4})-(\d{2})$/;

/** Mês de uma data ISO ("2026-09-22" → "2026-09"). */
export function monthOf(iso: string): Month {
  return iso.slice(0, 7);
}

/** `?mes=` válido e não futuro, ou null (a página redireciona para o mês atual). */
export function parseMonthParam(raw: string | string[] | undefined, current: Month): Month | null {
  const value = (Array.isArray(raw) ? raw[0] : raw) ?? "";
  const m = MONTH_RE.exec(value);
  if (!m || Number(m[2]) < 1 || Number(m[2]) > 12 || Number(m[1]) < 1900) return null;
  return value <= current ? value : null;
}

export function shiftMonth(month: Month, delta: number): Month {
  const [y, m] = month.split("-").map(Number);
  const total = y * 12 + (m - 1) + delta;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, "0")}`;
}

/** Intervalo semiaberto [início, início do mês seguinte) para filtrar `occurred_at`. */
export function monthRange(month: Month): { start: string; end: string } {
  return { start: `${month}-01`, end: `${shiftMonth(month, 1)}-01` };
}

/** "2026-08" → { name: "agosto", short: "AGO", year: "2026" } */
export function monthLabel(month: Month): { name: string; short: string; year: string } {
  const [y, m] = month.split("-");
  return { name: MONTH_NAMES[Number(m) - 1], short: MONTHS[Number(m) - 1].toUpperCase(), year: y };
}

// ---------- Recorrência mensal (V6) ----------
// Datas de recorrência mensal. Espelha `public.recurrence_date` (migration 0007): os dois precisam concordar.

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** Dia `day` do mês `month` ("YYYY-MM", ou uma data "YYYY-MM-DD"), limitado ao último dia desse mês. */
export function recurrenceDate(month: Month, day: number): string {
  const [y, m] = month.slice(0, 7).split("-").map(Number);
  const d = Math.min(day, daysInMonth(y, m));
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** Próxima data da série depois de `date` (sempre no mês seguinte). */
export function nextDueAfter(date: string, day: number): string {
  return recurrenceDate(shiftMonth(date.slice(0, 7), 1), day);
}
