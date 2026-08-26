"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  MapPin,
  Menu,
  Plus,
  Search,
  User as UserIcon,
  X,
} from "lucide-react";
import { Wordmark } from "@/components/brand/Brand";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/stores/authStore";
import { useHubStore } from "@/stores/hubStore";
import { cn } from "@/lib/cn";
import { useQuery } from "@tanstack/react-query";
import { fetchNotifications } from "@/features/api/services";

const navLinks = [
  { href: "/explore", label: "Explore" },
  { href: "/bids", label: "My bids", auth: true },
  { href: "/selling", label: "Selling", auth: true },
];

type SiteNavbarProps = {
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
};

export function SiteNavbar({
  showSearch = false,
  searchValue,
  onSearchChange,
}: SiteNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const selectedCity = useHubStore((s) => s.selectedCity);
  const selectedLocation = useHubStore((s) => s.selectedLocation);
  const [menuOpen, setMenuOpen] = useState(false);
  const [internalQuery, setInternalQuery] = useState("");
  const query = searchValue ?? internalQuery;
  const setQuery = onSearchChange ?? setInternalQuery;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onExplore = pathname.startsWith("/explore");

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

  const linkClass =
    "hidden min-h-11 cursor-pointer items-center rounded-md px-3 text-sm font-semibold transition lg:inline-flex";

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleSearchChange = (value: string) => {
    setQuery(value);
    // Explore is controlled by the page (debounced there). Elsewhere, live-navigate.
    if (onSearchChange || onExplore) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const next = value.trim();
      router.replace(next ? `/explore?q=${encodeURIComponent(next)}` : "/explore");
    }, 320);
  };

  const searchField = (
    <div className="flex w-full min-w-0 items-center">
      <label className="relative min-w-0 flex-1">
        <span className="sr-only">Search listings</span>
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-primary"
          aria-hidden
        />
        <input
          value={query}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search for an item"
          className="field-control field-control-search h-10 w-full rounded-full border-primary/20 bg-canvas text-sm shadow-none placeholder:text-ink-muted focus:border-primary sm:h-11"
          aria-label="Search listings"
          autoComplete="off"
          enterKeyHint="search"
        />
      </label>
    </div>
  );

  const visibleLinks = navLinks.filter((item) => !item.auth || user);

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-surface/85 backdrop-blur-xl [-webkit-backdrop-filter:blur(24px)]">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2.5 sm:gap-3 sm:py-3 lg:px-6">
        <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
          <Wordmark href="/" className="relative z-10 shrink-0" />

          <button
            type="button"
            onClick={() =>
              router.push(
                user ? "/onboarding/hub" : "/auth?next=/onboarding/hub",
              )
            }
            className="inline-flex min-h-10 max-w-[7rem] cursor-pointer items-center gap-1.5 truncate rounded-md border border-border bg-canvas px-2 text-xs font-semibold text-ink-secondary transition hover:border-primary/30 hover:text-primary sm:max-w-[10rem] sm:px-3"
          >
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{hubLabel}</span>
          </button>
        </div>

        {showSearch ? (
          <div className="mx-2 hidden min-w-0 flex-1 md:block lg:mx-4">
            {searchField}
          </div>
        ) : (
          <div className="min-w-0 flex-1" />
        )}

        <nav className="hidden shrink-0 items-center gap-1 md:flex">
          {visibleLinks.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  linkClass,
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
                className="relative inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-md text-ink-secondary hover:bg-canvas hover:text-ink"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {(notif?.unreadCount ?? 0) > 0 ? (
                  <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-danger" />
                ) : null}
              </Link>
              <Button
                className="hidden sm:inline-flex"
                onClick={() => router.push("/sell")}
              >
                <Plus className="h-4 w-4" />
                Sell
              </Button>
              <Link
                href="/profile"
                className="flex h-11 w-11 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-border bg-canvas"
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
                  <UserIcon className="h-4 w-4 text-ink-muted" />
                )}
              </Link>
            </>
          ) : (
            <Link
              href="/auth"
              className="inline-flex min-h-11 cursor-pointer items-center rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              Log in
            </Link>
          )}
        </nav>

        <div className="flex shrink-0 items-center gap-1 md:hidden">
          {user ? (
            <Link
              href="/profile"
              className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-border bg-canvas"
              aria-label="Profile"
            >
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.fullName}
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserIcon className="h-4 w-4 text-ink-muted" />
              )}
            </Link>
          ) : (
            <Link
              href="/auth"
              className="inline-flex min-h-10 cursor-pointer items-center rounded-md bg-primary px-3 text-sm font-semibold text-white"
            >
              Log in
            </Link>
          )}
          <button
            type="button"
            className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-md text-ink"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {showSearch ? (
        <div className="border-t border-border/60 px-4 py-2 md:hidden lg:px-6">
          <div className="mx-auto max-w-7xl">{searchField}</div>
        </div>
      ) : null}

      {menuOpen ? (
        <nav className="border-t border-border bg-surface px-4 py-3 md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col">
            {[
              { href: "/explore", label: "Explore" },
              ...(user
                ? [
                    { href: "/bids", label: "My bids" },
                    { href: "/selling", label: "Selling" },
                    { href: "/sell", label: "Sell an item" },
                    { href: "/notifications", label: "Notifications" },
                  ]
                : [{ href: "/auth", label: "Log in" }]),
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex min-h-11 cursor-pointer items-center rounded-md px-3 text-sm font-semibold text-ink hover:bg-canvas"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
