import { CategoryTag } from "@/components/ui/CategoryTag";
import { TypeTag } from "@/components/ui/TypeTag";
import { copy } from "@/lib/copy";
import { cn } from "@/lib/cn";
import { formatDateLong } from "@/lib/dates";
import { formatSigned } from "@/lib/money";
import type { Transaction } from "@/lib/transactions";

/** Card da movimentação no detalhe e na confirmação de exclusão. */
export function TransactionCard({ tx }: { tx: Transaction }) {
  return (
    <div className="flex flex-col gap-2.5 border border-border-subtle bg-background p-4">
      <div className="flex items-baseline justify-between gap-3">
        <span className="min-w-0 text-[17px] font-medium break-words">{tx.description}</span>
        <span
          className={cn(
            "tabular text-[22px] font-semibold whitespace-nowrap",
            tx.type === "income" ? "text-income" : "text-expense",
          )}
        >
          {formatSigned(tx.type, tx.amountCents)}
        </span>
      </div>
      <div className="flex min-w-0 flex-wrap items-center gap-2.5">
        <TypeTag type={tx.type} size="xs" />
        {tx.categoryName ? (
          <CategoryTag name={tx.categoryName} size="xs" />
        ) : (
          <span className="text-[13px] text-text-secondary">{copy.category.none}</span>
        )}
        <span className="font-mono text-xs text-text-secondary">{formatDateLong(tx.occurredAt)}</span>
      </div>
    </div>
  );
}
