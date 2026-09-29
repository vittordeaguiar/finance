import { TextLink } from "@/components/ui/TextLink";
import { copy } from "@/lib/copy";

/** V8: busca sem resultado no mês. Mesmo bloco do mês vazio, com o link que limpa a busca. */
export function SearchEmptyState({ term, clearHref }: { term: string; clearHref: string }) {
  const t = copy.search;
  return (
    <div className="flex flex-col gap-3 border border-border bg-surface px-5 py-8 md:items-center md:px-6 md:py-[72px] md:text-center">
      <h3 className="text-[22px] leading-[1.15] font-semibold tracking-tight break-words md:text-[28px]">
        {t.emptyTitle(term)}
      </h3>
      <p className="text-[15px] leading-[1.65] text-text-secondary md:max-w-[46ch] md:text-base">{t.emptyBody}</p>
      <TextLink href={clearHref} scroll={false} className="self-start text-sm font-medium md:self-center md:text-[15px]">
        {t.clear}
      </TextLink>
    </div>
  );
}
