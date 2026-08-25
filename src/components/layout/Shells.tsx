"use client";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteNavbar } from "@/components/layout/SiteNavbar";

export function AppShell({
  children,
  searchValue,
  onSearchChange,
  onSearchSubmit,
}: {
  children: React.ReactNode;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: () => void;
}) {
  return (
    <div className="ob-atmosphere min-h-screen min-h-dvh">
      <SiteNavbar
        showSearch
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        onSearchSubmit={onSearchSubmit}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
        {children}
      </main>

      <SiteFooter />
    </div>
  );
}

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="ob-atmosphere relative isolate min-h-screen min-h-dvh text-ink">
      <SiteNavbar />
      {children}
      <SiteFooter />
    </div>
  );
}
