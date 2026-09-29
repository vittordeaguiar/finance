/** Preferência de tema (V4, Fase 13), em cookie para o servidor já escrever `data-theme` no HTML. */
export const THEME_COOKIE = "tema";

export const THEMES = ["claro", "escuro", "sistema"] as const;
export type Theme = (typeof THEMES)[number];

/** Sistema é o padrão; valores desconhecidos também caem nele. */
export function parseTheme(value: string | undefined): Theme {
  return THEMES.includes(value as Theme) ? (value as Theme) : "sistema";
}

/** Atributo `data-theme` do `<html>`: ausente em "sistema" (vale `prefers-color-scheme`). */
export function themeAttribute(theme: Theme): "light" | "dark" | undefined {
  return theme === "claro" ? "light" : theme === "escuro" ? "dark" : undefined;
}
