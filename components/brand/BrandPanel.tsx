import { copy } from "@/lib/copy";
import { Logo } from "./Logo";

type BrandPanelProps = {
  display: string;
  displayAccent: string;
  body: string;
};

/** Painel de marca (slab) à esquerda das telas de autenticação no desktop. */
export function BrandPanel({ display, displayAccent, body }: BrandPanelProps) {
  return (
    <aside className="flex w-full flex-col justify-between gap-12 bg-slab p-10 text-slab-text lg:p-16">
      <Logo tone="slab" size="lg" />
      <div className="flex flex-col gap-6">
        <span className="font-mono text-xs tracking-label text-slab-accent">{copy.brandPanel.eyebrow}</span>
        <p className="text-[56px] leading-[1.02] font-semibold tracking-display lg:text-[72px]">
          {display} <span className="text-slab-accent">{displayAccent}</span>
        </p>
        <p className="max-w-[46ch] text-lg leading-[1.65] text-slab-text-muted">{body}</p>
      </div>
      <div className="flex flex-wrap gap-6 border-t border-slab-border pt-6 font-mono text-xs tracking-label text-slab-text-muted">
        {copy.brandPanel.footer.map((item, i) => (
          <span key={item} className="flex gap-6">
            {i > 0 && <span aria-hidden="true">·</span>}
            {item}
          </span>
        ))}
      </div>
    </aside>
  );
}
