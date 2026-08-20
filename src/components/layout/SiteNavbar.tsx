"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  MapPin,
  Menu,
  Plus,
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

const appLinks = [
  { href: "/explore", label: "Explore" },
  { href: "/bids", label: "My bids", auth: true },
  { href: "/selling", label: "Selling", auth: true },
];

type SiteNavbarProps = {
  variant?: "app" | "marketing";
  showHub?: boolean;
};

export function SiteNavbar({
  variant = "app",
  showHub = variant === "app",
}: SiteNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const selectedCity = useHubStore((s) => s.selectedCity);
  const selectedLocation = useHubStore((s) => s.selectedLocation);
  const [menuOpen, setMenuOpen] = useState(false);
  const marketing = variant === "marketing";

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

  const linkClass = marketing
    ? "inline-flex min-h-11 items-center rounded-md px-3 text-sm font-semibold text-white/85 hover:bg-white/10 hover:text-white"
    : "hidden min-h-11 items-center rounded-md px-3 text-sm font-semibold transition lg:inline-flex";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b backdrop-blur-xl [-webkit-backdrop-filter:blur(24px)]",
        marketing
          ? "border-white/10 bg-ink/80"
          : "border-border/80 bg-surface/85",
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 sm:gap-3 lg:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <Wordmark
            href="/"
            light={marketing}
            className="relative z-10 shrink-0"
          />

          {showHub ? (
            <button
              type="button"
              onClick={() =>
                router.push(
                  user ? "/onboarding/hub" : "/auth?next=/onboarding/hub",
                )
              }
              className={cn(
                "inline-flex min-h-10 max-w-[7.5rem] items-center gap-1.5 truncate rounded-md border px-2 text-xs font-semibold transition sm:max-w-[12rem] sm:px-3",
                marketing
                  ? "border-white/20 bg-white/10 text-white/90 hover:bg-white/15"
                  : "border-border bg-canvas text-ink-secondary hover:border-primary/30 hover:text-primary",
              )}
            >
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{hubLabel}</span>
            </button>
          ) : null}
        </div>

        <nav className="hidden shrink-0 items-center gap-1 md:flex">
          {marketing ? (
            <>
              <Link href="/explore" className={linkClass}>
                Explore
              </Link>
              <Link href="/#feed" className={linkClass}>
                Live deals
              </Link>
              <Link href="/#how" className={linkClass}>
                How it works
              </Link>
            </>
          ) : (
            appLinks.map((item) => {
              if (item.auth && !user) return null;
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
            })
          )}

          {user ? (
            <>
              {!marketing ? (
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
                  <Button
                    className="hidden sm:inline-flex"
                    onClick={() => router.push("/sell")}
                  >
                    <Plus className="h-4 w-4" />
                    Sell
                  </Button>
                </>
              ) : null}
              <Link
                href="/profile"
                className={cn(
                  "flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border",
                  marketing
                    ? "border-white/20 bg-white/10"
                    : "border-border bg-canvas",
                )}
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
                  <UserIcon
                    className={cn(
                      "h-4 w-4",
                      marketing ? "text-white/80" : "text-ink-muted",
                    )}
                  />
                )}
              </Link>
            </>
          ) : (
            <Link
              href="/auth"
              className={cn(
                "inline-flex min-h-11 items-center rounded-md px-4 text-sm font-semibold",
                marketing
                  ? "bg-white text-ink hover:bg-white/90"
                  : "bg-primary text-white hover:bg-primary-hover",
              )}
            >
              Log in
            </Link>
          )}
        </nav>

        <div className="flex shrink-0 items-center gap-1 md:hidden">
          {user ? (
            <Link
              href="/profile"
              className={cn(
                "flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border",
                marketing
                  ? "border-white/20 bg-white/10"
                  : "border-border bg-canvas",
              )}
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
                <UserIcon
                  className={cn(
                    "h-4 w-4",
                    marketing ? "text-white/80" : "text-ink-muted",
                  )}
                />
              )}
            </Link>
          ) : (
            <Link
              href="/auth"
              className={cn(
                "inline-flex min-h-10 items-center rounded-md px-3 text-sm font-semibold",
                marketing
                  ? "bg-white text-ink"
                  : "bg-primary text-white",
              )}
            >
              Log in
            </Link>
          )}
          <button
            type="button"
            className={cn(
              "inline-flex h-11 w-11 items-center justify-center rounded-md",
              marketing ? "text-white" : "text-ink",
            )}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav
          className={cn(
            "border-t px-4 py-3 md:hidden",
            marketing ? "border-white/10" : "border-border bg-surface",
          )}
        >
          <div className="mx-auto flex max-w-7xl flex-col">
            {(marketing
              ? [
                  { href: "/explore", label: "Explore" },
                  { href: "/#feed", label: "Live deals" },
                  { href: "/#how", label: "How it works" },
                  {
                    href: user ? "/sell" : "/auth?next=/sell",
                    label: "Start selling",
                  },
                ]
              : [
                  { href: "/explore", label: "Explore" },
                  ...(user
                    ? [
                        { href: "/bids", label: "My bids" },
                        { href: "/selling", label: "Selling" },
                        { href: "/sell", label: "Sell an item" },
                        { href: "/notifications", label: "Notifications" },
                      ]
                    : [{ href: "/auth", label: "Log in" }]),
                ]
            ).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex min-h-11 items-center rounded-md px-3 text-sm font-semibold",
                  marketing
                    ? "text-white/85 hover:bg-white/10"
                    : "text-ink hover:bg-canvas",
                )}
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
