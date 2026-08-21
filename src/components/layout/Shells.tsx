"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Gavel,
  Plus,
  Store,
  User as UserIcon,
} from "lucide-react";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteNavbar } from "@/components/layout/SiteNavbar";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/cn";

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
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  return (
    <div className="ob-atmosphere min-h-screen min-h-dvh">
      <SiteNavbar
        showHub
        showSearch
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        onSearchSubmit={onSearchSubmit}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 pb-dock lg:px-6 lg:py-8 lg:pb-8">
        {children}
      </main>

      <div className="pb-24 lg:pb-0">
        <SiteFooter />
      </div>

      <nav className="safe-dock fixed left-1/2 z-40 flex -translate-x-1/2 items-end gap-1 rounded-lg border border-border bg-surface/95 p-1.5 shadow-rest backdrop-blur lg:hidden">
        <Link
          href="/explore"
          className={cn(
            "flex min-h-11 min-w-11 flex-col items-center justify-center gap-0.5 rounded-md px-3 text-[10px] font-semibold",
            pathname.startsWith("/explore") ? "text-primary" : "text-ink-muted",
          )}
        >
          <Compass className="h-5 w-5" />
          Explore
        </Link>
        <Link
          href={user ? "/bids" : "/auth?next=/bids"}
          className={cn(
            "flex min-h-11 min-w-11 flex-col items-center justify-center gap-0.5 rounded-md px-3 text-[10px] font-semibold",
            pathname.startsWith("/bids") ? "text-primary" : "text-ink-muted",
          )}
        >
          <Gavel className="h-5 w-5" />
          Bids
        </Link>
        <Link
          href={user ? "/sell" : "/auth?next=/sell"}
          className={cn(
            "flex h-12 w-12 -translate-y-2 items-center justify-center rounded-md bg-primary text-white shadow-rest",
            pathname.startsWith("/sell") &&
              "ring-2 ring-primary/30 ring-offset-2",
          )}
          aria-label="Sell"
        >
          <Plus className="h-5 w-5" />
        </Link>
        <Link
          href={user ? "/selling" : "/auth?next=/selling"}
          className={cn(
            "flex min-h-11 min-w-11 flex-col items-center justify-center gap-0.5 rounded-md px-3 text-[10px] font-semibold",
            pathname.startsWith("/selling")
              ? "text-primary"
              : "text-ink-muted",
          )}
        >
          <Store className="h-5 w-5" />
          Selling
        </Link>
        <Link
          href={user ? "/profile" : "/auth?next=/profile"}
          className={cn(
            "flex min-h-11 min-w-11 flex-col items-center justify-center gap-0.5 rounded-md px-3 text-[10px] font-semibold",
            pathname.startsWith("/profile")
              ? "text-primary"
              : "text-ink-muted",
          )}
        >
          <UserIcon className="h-5 w-5" />
          Profile
        </Link>
      </nav>
    </div>
  );
}

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="ob-atmosphere relative isolate min-h-screen min-h-dvh text-ink">
      <SiteNavbar home showHub={false} />
      {children}
      <SiteFooter />
    </div>
  );
}
