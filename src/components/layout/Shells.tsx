"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Compass,
  Gavel,
  Plus,
  Search,
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
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [internalQuery, setInternalQuery] = useState("");
  const query = searchValue ?? internalQuery;
  const setQuery = onSearchChange ?? setInternalQuery;

  const submitSearch = () => {
    if (onSearchSubmit) {
      onSearchSubmit();
      return;
    }
    const next = query.trim();
    router.push(next ? `/explore?q=${encodeURIComponent(next)}` : "/explore");
  };

  return (
    <div className="ob-atmosphere min-h-screen min-h-dvh">
      <SiteNavbar showHub />

      <div className="border-b border-border/70 bg-surface/90">
        <form
          className="mx-auto max-w-7xl px-4 py-2.5 lg:px-6"
          onSubmit={(e) => {
            e.preventDefault();
            submitSearch();
          }}
        >
          <label className="relative block max-w-2xl">
            <span className="sr-only">Search listings</span>
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-primary"
              aria-hidden
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for an item"
              className="field-control h-11 w-full rounded-full border-primary/20 bg-canvas pl-11 pr-[5.5rem] text-sm shadow-rest placeholder:text-ink-muted focus:border-primary sm:h-12 sm:pr-28"
              aria-label="Search listings"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 inline-flex h-8 -translate-y-1/2 items-center rounded-full bg-primary px-3 text-xs font-semibold text-white hover:bg-primary-hover sm:h-9 sm:px-4 sm:text-sm"
            >
              Search
            </button>
          </label>
        </form>
      </div>

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
