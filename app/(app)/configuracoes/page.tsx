import type { Metadata } from "next";
import { signOut } from "@/app/(app)/actions";
import { Eyebrow } from "@/components/brand/Eyebrow";
import { SectionIndex } from "@/components/brand/SectionIndex";
import { PasswordForm, ProfileForm } from "@/components/settings/AccountForms";
import { CategoryManager } from "@/components/settings/CategoryManager";
import { RecurrenceManager } from "@/components/settings/RecurrenceManager";
import { ThemeSelector } from "@/components/settings/ThemeSelector";
import { cookies } from "next/headers";
import { THEME_COOKIE, parseTheme } from "@/lib/theme";
import { LoadError } from "@/components/finance/LoadError";
import { Button } from "@/components/ui/Button";
import { copy } from "@/lib/copy";
import { getCategories, getCategoryUsage, getProfile, getRecurrences } from "@/lib/dashboard";

export const metadata: Metadata = { title: "Configurações · Saldo." };

const sectionClass = "flex flex-col gap-3 px-5 pt-6 md:gap-4 md:p-0";

export default async function SettingsPage() {
  const [categories, usage, recurrences, profile, cookieStore] = await Promise.all([
    getCategories(),
    getCategoryUsage(),
    getRecurrences(),
    getProfile(),
    cookies(),
  ]);
  const theme = parseTheme(cookieStore.get(THEME_COOKIE)?.value);
  const t = copy.settings;

  return (
    <main className="flex flex-1 flex-col pb-[calc(120px+env(safe-area-inset-bottom))] md:gap-10 md:px-16 md:py-12">
      <div className="flex flex-col gap-2.5 max-md:sr-only">
        <Eyebrow>{t.eyebrow}</Eyebrow>
        <h1 className="text-[44px] leading-[1.05] font-semibold tracking-tight">{t.title}</h1>
      </div>

      <section aria-labelledby="config-categorias" className={sectionClass}>
        <SectionIndex id="config-categorias" index="01" title={t.categories.title} />
        <CategoryManager categories={categories} usage={usage} />
      </section>

      <section aria-labelledby="config-recorrencias" className={sectionClass}>
        <SectionIndex id="config-recorrencias" index="02" title={copy.recurrence.title} />
        {recurrences ? <RecurrenceManager recurrences={recurrences} /> : <LoadError />}
      </section>

      <section aria-labelledby="config-perfil" className={sectionClass}>
        <SectionIndex id="config-perfil" index="03" title={t.profile.title} />
        {profile ? <ProfileForm name={profile.name} email={profile.email} /> : <LoadError />}
      </section>

      <section aria-labelledby="config-senha" className={sectionClass}>
        <SectionIndex id="config-senha" index="04" title={t.password.title} />
        <PasswordForm />
      </section>

      <section aria-labelledby="config-aparencia" className={sectionClass}>
        <SectionIndex id="config-aparencia" index="05" title={t.appearance.title} />
        <ThemeSelector initial={theme} />
      </section>

      <form action={signOut} className="px-5 pt-8 md:p-0">
        <Button type="submit" variant="secondary">
          {t.logout}
        </Button>
      </form>
    </main>
  );
}
