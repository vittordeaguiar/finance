"use client";

import { DashboardView } from "@/components/finance/DashboardView";
import { LoadError } from "@/components/finance/LoadError";
import { copy } from "@/lib/copy";

export default function ReportsError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <DashboardView heading={copy.reports} summary={{ kind: "error" }}>
      <div className="px-5 pt-6 md:p-0">
        <LoadError reset={reset} />
      </div>
    </DashboardView>
  );
}
