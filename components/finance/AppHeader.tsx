import { Logo } from "@/components/brand/Logo";

/** Header do mobile: só o logo (Sair fica em Configurações). No desktop, tudo fica na barra lateral. */
export function AppHeader() {
  return (
    <header className="flex h-14 shrink-0 items-center border-b border-border px-5 md:hidden">
      <Logo />
    </header>
  );
}
