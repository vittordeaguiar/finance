/** Preferência da barra lateral (desktop), em cookie para o servidor já renderizar na largura certa. */
export const SIDEBAR_COOKIE = "sidebar";
export const SIDEBAR_OPEN = "aberta";

/** Recolhida é o padrão: só abre com o cookie explícito. */
export function isSidebarOpen(value: string | undefined): boolean {
  return value === SIDEBAR_OPEN;
}

/** Um ano; `path=/` para valer em todas as abas. */
export function sidebarCookie(open: boolean): string {
  return `${SIDEBAR_COOKIE}=${open ? SIDEBAR_OPEN : "recolhida"}; path=/; max-age=31536000; samesite=lax`;
}
