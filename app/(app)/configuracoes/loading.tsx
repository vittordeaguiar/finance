import { Eyebrow } from "@/components/brand/Eyebrow";
import { Skeleton } from "@/components/ui/Skeleton";
import { copy } from "@/lib/copy";

export default function SettingsLoading() {
  return (
    <main aria-busy="true" className="flex flex-1 flex-col gap-4 px-5 pt-6 md:gap-10 md:px-16 md:py-12">
      <div className="flex flex-col gap-2.5 max-md:sr-only">
        <Eyebrow>{copy.settings.eyebrow}</Eyebrow>
        <h1 className="text-[44px] leading-[1.05] font-semibold tracking-tight">{copy.settings.title}</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-6">
        {[0, 1].map((i) => (
          <div key={i} className="flex flex-col border border-border bg-surface">
            {[0, 1, 2, 3].map((j) => (
              <div key={j} className="flex h-14 items-center border-b border-border-subtle px-6 last:border-b-0">
                <Skeleton className="h-3 w-32" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </main>
  );
}
