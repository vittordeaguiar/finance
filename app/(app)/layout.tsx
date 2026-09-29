import { AppHeader } from "@/components/finance/AppHeader";
import { BottomNav } from "@/components/finance/BottomNav";
import { CreateTransaction } from "@/components/finance/CreateTransaction";
import { AppProvider } from "@/components/finance/DashboardProvider";
import { SideNavShell } from "@/components/finance/SideNav";
import { cookies } from "next/headers";
import { SIDEBAR_COOKIE, isSidebarOpen } from "@/lib/sidebar";
import { getCategories } from "@/lib/dashboard";
import { todayInSaoPaulo } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";

/** Layout das abas: navegação (sidebar no desktop, barra inferior no mobile) e o "+" global. */
export default async function AppLayout({ children }: LayoutProps<"/">) {
  const supabase = await createClient();
  const [{ data: auth }, categories, cookieStore] = await Promise.all([
    supabase.auth.getClaims(),
    getCategories(),
    cookies(),
  ]);
  const sidebarOpen = isSidebarOpen(cookieStore.get(SIDEBAR_COOKIE)?.value);

  return (
    <AppProvider today={todayInSaoPaulo()} categories={categories}>
      <CreateTransaction>
        <SideNavShell email={auth?.claims.email ?? null} initialOpen={sidebarOpen}>
          <AppHeader />
          {children}
        </SideNavShell>
        <BottomNav />
      </CreateTransaction>
    </AppProvider>
  );
}
