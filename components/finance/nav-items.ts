import { copy } from "@/lib/copy";
import { REPORTS_PATH, SETTINGS_PATH, TRANSACTIONS_PATH, monthHref, monthParamForNav, type AppPath } from "@/lib/period";

/** `index`: o mesmo índice do eyebrow da aba; é o que aparece com a barra lateral recolhida. */
/** `short`: rótulo da barra inferior do mobile, quando o nome não cabe. */
export type NavItem = { path: AppPath; label: string; index: string; short?: string };

/** Abas da navegação principal, na ordem da doc 11. */
export const NAV_ITEMS: NavItem[] = [
  { path: "/", label: copy.nav.home, index: "01" },
  { path: TRANSACTIONS_PATH, label: copy.nav.transactions, index: "02", short: copy.nav.transactionsShort },
  { path: REPORTS_PATH, label: copy.nav.reports, index: "03" },
  { path: SETTINGS_PATH, label: copy.nav.settings, index: "04", short: copy.nav.settingsShort },
];

/**
 * Link da aba preservando só o `?mes=` (nenhum outro parâmetro atravessa abas). Configurações não usa o mês,
 * mas o leva adiante para as próximas abas.
 */
export function navItemHref(path: AppPath, mes: string | null, currentMonth: string): string {
  return monthHref(monthParamForNav(mes, currentMonth), currentMonth, path);
}

export function isActive(path: AppPath, pathname: string): boolean {
  return path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(`${path}/`);
}
