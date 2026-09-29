import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/**
 * Link de texto sublinhado na cor de acento. No mobile a área de toque cresce para 44px
 * (padding + margem negativa), sem mudar o visual.
 */
export function TextLink({ className, ...rest }: ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(
        "inline-block py-3 -my-3 text-accent underline underline-offset-2 hover:text-accent-hover md:py-0 md:my-0",
        className,
      )}
      {...rest}
    />
  );
}
