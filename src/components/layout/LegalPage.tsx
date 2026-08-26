import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/Shells";

export function LegalPage({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <AppShell>
      <article className="mx-auto max-w-2xl">
        <h1 className="type-page text-ink">{title}</h1>
        <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink-secondary [&_h2]:mt-8 [&_h2]:mb-2 [&_strong]:text-ink">
          {children}
        </div>
      </article>
    </AppShell>
  );
}
