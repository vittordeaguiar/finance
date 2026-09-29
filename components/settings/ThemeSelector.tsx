"use client";

import { useState, useTransition } from "react";
import { setTheme } from "@/app/(app)/configuracoes/actions";
import { Segmented } from "@/components/ui/Segmented";
import { copy } from "@/lib/copy";
import { THEMES, themeAttribute, type Theme } from "@/lib/theme";

const t = copy.settings.appearance;

/** Claro, escuro ou sistema. Aplica na hora (atributo no <html>) e grava o cookie para os próximos acessos. */
export function ThemeSelector({ initial }: { initial: Theme }) {
  const [theme, setLocal] = useState<Theme>(initial);
  const [, startTransition] = useTransition();

  function change(next: Theme) {
    setLocal(next);
    const attribute = themeAttribute(next);
    if (attribute) document.documentElement.dataset.theme = attribute;
    else delete document.documentElement.dataset.theme;
    startTransition(() => setTheme(next));
  }

  return (
    <div className="border border-border bg-surface px-4 py-5 md:px-6 md:py-6">
      <Segmented
        label={t.label}
        value={theme}
        options={THEMES.map((value) => ({ value, label: t.options[value] }))}
        onChange={change}
      />
    </div>
  );
}
