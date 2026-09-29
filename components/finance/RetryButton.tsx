"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { copy } from "@/lib/copy";
import { cn } from "@/lib/cn";

/** "Tentar novamente": refaz a busca do Server Component (e reseta o error boundary, se houver). */
export function RetryButton({ reset, className }: { reset?: () => void; className?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      aria-busy={pending || undefined}
      onClick={() =>
        startTransition(() => {
          router.refresh();
          reset?.();
        })
      }
      className={cn(
        "h-11 cursor-pointer rounded-sm border border-expense bg-transparent px-5 text-[15px] font-semibold whitespace-nowrap text-text transition-colors duration-[120ms] hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
    >
      <span aria-hidden="true" className="mr-2 inline-block">
        ↻
      </span>
      {copy.common.retry}
    </button>
  );
}
