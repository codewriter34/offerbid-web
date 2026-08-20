"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Compass,
  Gavel,
  MapPin,
  Menu,
  Plus,
  Search,
  Store,
  User as UserIcon,
  X,
} from "lucide-react";
import { Wordmark } from "@/components/brand/Brand";
import { Button } from "@/components/ui/Button";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { useAuthStore } from "@/stores/authStore";
import { useHubStore } from "@/stores/hubStore";
import { cn } from "@/lib/cn";
import { useQuery } from "@tanstack/react-query";
import { fetchNotifications } from "@/features/api/services";

const nav = [
  { href: "/explore", label: "Explore" },
  { href: "/bids", label: "My bids", auth: true },
  { href: "/selling", label: "Selling", auth: true },
];

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
  const selectedCity = useHubStore((s) => s.selectedCity);
  const selectedLocation = useHubStore((s) => s.selectedLocation);

  const { data: notif } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    enabled: Boolean(user),
    refetchInterval: 60000,
  });

  const hubLabel =
    selectedLocation && selectedCity
      ? `${selectedLocation}, ${selectedCity}`
      : user?.location && user?.city
        ? `${user.location}, ${user.city}`
        : selectedCity ?? user?.city ?? "Pick a hub";

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
      <header className="sticky top-0 z-50 border-b border-border/80 bg-surface/85 backdrop-blur-xl [-webkit-backdrop-filter:blur(24px)]">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 lg:px-6">
          <Wordmark href="/" />

          <button
            type="button"
            onClick={() =>
              router.push(user ? "/onboarding/hub" : "/auth?next=/onboarding/hub")
            }
            className="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-border bg-canvas px-3 text-xs font-semibold text-ink-secondary transition hover:border-primary/30 hover:text-primary"
          >
            <MapPin className="h-3.5 w-3.5" />
            <span className="max-w-[9rem] truncate sm:max-w-none">{hubLabel}</span>
          </button>

          <div className="hidden flex-1 md:block" />

          <nav className="ml-auto flex items-center gap-1">
            {nav.map((item) => {
              if (item.auth && !user) return null;
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "hidden min-h-11 items-center rounded-md px-3 text-sm font-semibold transition lg:inline-flex",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-ink-secondary hover:bg-canvas hover:text-ink",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}

            {user ? (
              <>
                <Link
                  href="/notifications"
                  className="relative inline-flex h-11 w-11 items-center justify-center rounded-md text-ink-secondary hover:bg-canvas hover:text-ink"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {(notif?.unreadCount ?? 0) > 0 ? (
                    <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-danger" />
                  ) : null}
                </Link>
                <Link
                  href="/profile"
                  className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-md border border-border bg-canvas"
                  aria-label="Profile"
                >
                  {user.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt={user.fullName}
                      width={36}
                      height={36}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserIcon className="h-4 w-4 text-ink-muted" />
                  )}
                </Link>
                <Button
                  className="hidden sm:inline-flex"
                  onClick={() => router.push("/sell")}
                >
                  <Plus className="h-4 w-4" />
                  Sell
                </Button>
              </>
            ) : (
              <Link
                href="/auth"
                className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
              >
                Log in
              </Link>
            )}
          </nav>
        </div>
        <div className="border-t border-border/70 bg-canvas/90">
          <form
            className="mx-auto max-w-7xl px-4 py-2.5 lg:px-6"
            onSubmit={(e) => {
              e.preventDefault();
              submitSearch();
            }}
          >
            <label className="relative block">
              <span className="sr-only">Search listings</span>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for an item"
                className="field-control h-12 rounded-full border-primary/20 bg-surface pl-11 pr-24 shadow-rest placeholder:text-ink-muted focus:border-primary"
                aria-label="Search listings"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 inline-flex h-9 -translate-y-1/2 items-center rounded-full bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
              >
                Search
              </button>
            </label>
          </form>
        </div>
      </header>

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
            pathname.startsWith("/explore")
              ? "text-primary"
              : "text-ink-muted",
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
            pathname.startsWith("/sell") && "ring-2 ring-primary/30 ring-offset-2",
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
  const user = useAuthStore((s) => s.user);
  const [menuOpen, setMenuOpen] = useState(false);

  const sectionLink =
    "inline-flex min-h-11 items-center rounded-md px-3 text-sm font-semibold text-white/85 hover:bg-white/10 hover:text-white";

  return (
    <div className="relative isolate min-h-screen min-h-dvh bg-ink text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/80 backdrop-blur-xl [-webkit-backdrop-filter:blur(24px)]">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 lg:px-6">
          <Wordmark light href="/" className="relative z-10 shrink-0" />

          <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
            <Link href="/#how" className={sectionLink}>
              How it works
            </Link>
            <Link href="/#feed" className={sectionLink}>
              Live deals
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            {user ? (
              <Link
                href="/profile"
                className="hidden h-11 w-11 overflow-hidden rounded-md border border-white/20 bg-white/10 md:flex md:items-center md:justify-center"
                aria-label="Profile"
              >
                {user.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt={user.fullName}
                    width={44}
                    height={44}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserIcon className="h-4 w-4 text-white/80" />
                )}
              </Link>
            ) : (
              <Link href="/auth" className={`hidden md:inline-flex ${sectionLink}`}>
                Log in
              </Link>
            )}
            <Link
              href="/explore"
              className="inline-flex min-h-11 items-center rounded-md bg-white px-4 text-sm font-semibold text-ink hover:bg-white/90"
            >
              Browse deals
            </Link>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-md text-white md:hidden"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {menuOpen ? (
          <nav className="border-t border-white/10 px-4 py-3 md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col">
              <Link
                href="/#how"
                className={sectionLink}
                onClick={() => setMenuOpen(false)}
              >
                How it works
              </Link>
              <Link
                href="/#feed"
                className={sectionLink}
                onClick={() => setMenuOpen(false)}
              >
                Live deals
              </Link>
              {user ? (
                <Link
                  href="/profile"
                  className={sectionLink}
                  onClick={() => setMenuOpen(false)}
                >
                  Profile
                </Link>
              ) : (
                <Link
                  href="/auth"
                  className={sectionLink}
                  onClick={() => setMenuOpen(false)}
                >
                  Log in
                </Link>
              )}
              <Link
                href={user ? "/sell" : "/auth?next=/sell"}
                className={sectionLink}
                onClick={() => setMenuOpen(false)}
              >
                Start selling
              </Link>
            </div>
          </nav>
        ) : null}
      </header>
      {children}
      <SiteFooter />
    </div>
  );
}
