"use client";

import { DashboardView } from "@/components/finance/DashboardView";
import { LoadError } from "@/components/finance/LoadError";
import { copy } from "@/lib/copy";

export default function TransactionsError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <DashboardView heading={copy.transactions} history={<LoadError reset={reset} />} historyIndex="01" />;
}
