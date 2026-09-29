import { copy } from "@/lib/copy";
import { cn } from "@/lib/cn";

type LogoProps = {
  /** app: header do dashboard (quadrado verde-700) · slab: sobre fundo preto (quadrado verde-300) */
  tone?: "app" | "slab";
  /** lg: painel de marca do login desktop (28px) */
  size?: "md" | "lg";
  className?: string;
};

export function Logo({ tone = "app", size = "md", className }: LogoProps) {
  return (
    <span className={cn("flex items-center", size === "lg" ? "gap-3" : "gap-2.5 md:gap-3", className)}>
      <span
        aria-hidden="true"
        className={cn(
          "shrink-0",
          tone === "slab" ? "bg-slab-accent" : "bg-accent",
          size === "lg" ? "size-7" : "size-5 md:size-[22px]",
        )}
      />
      <span
        className={cn(
          "font-bold tracking-tight",
          size === "lg" ? "text-[22px]" : "text-[19px] md:text-xl",
        )}
      >
        {copy.brand}
      </span>
    </span>
  );
}
