"use client";

import { useLinkStatus } from "next/link";
import type { ReactNode } from "react";

/** Marca `data-pending` enquanto o <Link> pai navega, para o CSS do pai reagir sem mudar o layout. */
export function LinkPending({ children }: { children: ReactNode }) {
  const { pending } = useLinkStatus();
  return <span data-pending={pending || undefined}>{children}</span>;
}
