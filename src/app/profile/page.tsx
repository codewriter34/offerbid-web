"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  Camera,
  ChevronRight,
  Gavel,
  MapPin,
  Shield,
  Store,
  Tag,
  Trash2,
} from "lucide-react";
import { AppShell } from "@/components/layout/Shells";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PageHeader } from "@/components/ui/PageHeader";
import { ListingTile } from "@/components/listings/ListingTile";
import { ListingSkeleton, ProfileSkeleton } from "@/components/ui/EmptyState";
import { ActionNotice } from "@/components/ui/ActionNotice";
import { logout, updateAvatar, updateProfile, deleteAccount } from "@/features/auth/authService";
import {
  fetchIdentity,
  fetchMyBids,
  fetchMyListings,
  fetchNotifications,
  uploadFile,
} from "@/features/api/services";
import { useAuthStore } from "@/stores/authStore";
import { useHubStore } from "@/stores/hubStore";
import { friendlyUploadError, getErrorMessage } from "@/lib/formatters";
import { popConfetti } from "@/lib/confetti";
import { disconnectSocket } from "@/lib/socket";
import { effectiveWhatsAppPhone } from "@/lib/whatsappPhone";
import { isValidLocalPhone, phoneTypingHint } from "@/lib/validators";
import { COUNTRY_OPTIONS } from "@/lib/env";
import { statusLabel } from "@/lib/status";
import { cn } from "@/lib/cn";
import type { Country } from "@/types";

function Stat({
  icon: Icon,
  value,
  label,
  tone = "neutral",
}: {
  icon: typeof Tag;
  value: number;
  label: string;
  tone?: "neutral" | "success" | "warning";
}) {
  const tones = {
    neutral: "bg-elevated text-ink-muted",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
  };
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center px-2 text-center">
      <span
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-md",
          tones[tone],
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <p className="mt-2 text-lg font-bold text-ink">{value}</p>
      <p className="type-meta">{label}</p>
    </div>
  );
}

function ActivityTile({
  href,
  icon: Icon,
  label,
  value,
}: {
  href: string;
  icon: typeof Store;
  label: string;
  value?: number;
}) {
  return (
    <Link
      href={href}
      className="flex min-w-0 flex-1 flex-col rounded-lg border border-border bg-surface p-3 shadow-rest transition hover:shadow-hover"
    >
      <Icon className="h-4 w-4 text-primary" />
      <p className="mt-2 truncate text-sm font-semibold text-ink">{label}</p>
      {value != null ? (
        <p className="mt-0.5 type-meta">{value}</p>
      ) : null}
    </Link>
  );
}

function MenuRow({
  href,
  icon: Icon,
  title,
  subtitle,
  badge,
  onClick,
}: {
  href?: string;
  icon: typeof Bell;
  title: string;
  subtitle: string;
  badge?: number;
  onClick?: () => void;
}) {
  const inner = (
    <>
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-elevated text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="text-sm font-semibold text-ink">{title}</span>
          {badge && badge > 0 ? (
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white">
              {badge}
            </span>
          ) : null}
        </span>
        <span className="mt-0.5 block text-sm text-ink-muted">{subtitle}</span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-ink-muted" />
    </>
  );

  const className =
    "flex w-full cursor-pointer items-center gap-3 border-b border-border px-4 py-3 text-left transition last:border-b-0 hover:bg-elevated/60";

  if (href) {
    return (
      <Link href={href} className={className}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {inner}
    </button>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const clear = useAuthStore((s) => s.clear);
  const selectedCity = useHubStore((s) => s.selectedCity);
  const selectedLocation = useHubStore((s) => s.selectedLocation);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [whatsapp, setWhatsapp] = useState("");
  const [phoneCountry, setPhoneCountry] = useState<Country>("CAMEROON");
  const [savingPhone, setSavingPhone] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;
    setWhatsapp(user.phone?.replace(/\D/g, "") ?? "");
    setPhoneCountry(user.country === "NIGERIA" ? "NIGERIA" : "CAMEROON");
  }, [user]);

  const listingsQuery = useQuery({
    queryKey: ["my-listings"],
    queryFn: fetchMyListings,
    enabled: Boolean(user),
  });

  const bidsQuery = useQuery({
    queryKey: ["my-bids"],
    queryFn: fetchMyBids,
    enabled: Boolean(user),
  });

  const identityQuery = useQuery({
    queryKey: ["identity"],
    queryFn: fetchIdentity,
    enabled: Boolean(user),
  });

  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    enabled: Boolean(user),
  });

  const listings = listingsQuery.data ?? [];
  const activeListings = listings.filter((l) => l.status === "ACTIVE");
  const soldListings = listings.filter((l) => l.status === "SOLD");
  const listingCap = identityQuery.data?.listingCap ?? 3;
  const verified =
    identityQuery.data?.status === "APPROVED" || Boolean(user?.isVerified);
  const hubLabel =
    selectedLocation && selectedCity
      ? `${selectedLocation}, ${selectedCity}`
      : user?.location && user?.city
        ? `${user.location}, ${user.city}`
        : user?.city ?? null;
  const whatsappOnFile = effectiveWhatsAppPhone(user?.phone);
  const countryCode =
    COUNTRY_OPTIONS.find((c) => c.country === phoneCountry)?.countryCode ??
    "+237";
  const phoneError = phoneTypingHint(whatsapp, phoneCountry);

  return (
    <AppShell>
      <RequireAuth next="/profile">
        {!user ? (
          <ProfileSkeleton />
        ) : (
          <div className="mx-auto max-w-2xl space-y-6">
            <PageHeader
              title="Profile"
              description={
                hubLabel
                  ? `Deals near ${hubLabel}. Manage your listings and offers.`
                  : "Manage your account, hub, and listings."
              }
            />

            <ActionNotice message={notice} tone="error" />

            <section className="rounded-lg border border-border bg-surface p-4 shadow-rest">
              <div className="flex items-start gap-4">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-elevated"
                  aria-label="Change avatar"
                >
                  {user.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt={user.fullName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center text-xl font-bold text-ink-muted">
                      {user.fullName.slice(0, 1)}
                    </span>
                  )}
                  <span className="absolute inset-x-0 bottom-0 flex items-center justify-center bg-ink/50 py-1 opacity-0 transition group-hover:opacity-100">
                    <Camera className="h-3.5 w-3.5 text-white" />
                  </span>
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setNotice(null);
                    setUploading(true);
                    try {
                      const url = await uploadFile(file, "AVATAR");
                      const updated = await updateAvatar(url);
                      setUser(updated);
                      popConfetti();
                    } catch (err) {
                      setNotice(friendlyUploadError(err));
                    } finally {
                      setUploading(false);
                    }
                  }}
                />
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-lg font-bold text-ink">
                    {user.fullName}
                  </h2>
                  {user.email ? (
                    <p className="truncate text-sm text-ink-muted">{user.email}</p>
                  ) : null}
                  <p className="mt-1 text-sm text-ink-secondary">
                    {whatsappOnFile ?? "No WhatsApp number on file"}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <StatusBadge
                      status={verified ? "VERIFIED" : "UNVERIFIED"}
                    />
                    {hubLabel ? (
                      <span className="inline-flex items-center gap-1 type-meta">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {hubLabel}
                      </span>
                    ) : null}
                  </div>
                  {uploading ? (
                    <p className="mt-2 text-xs text-ink-muted">Uploading…</p>
                  ) : null}
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-border bg-surface p-4 shadow-rest">
              <h2 className="text-sm font-semibold text-ink">WhatsApp (optional)</h2>
              <p className="mt-1 text-sm text-ink-secondary">
                Not required to use OfferBid. Add it so accepted deals can continue
                on WhatsApp.
              </p>
              <div className="mt-4 space-y-3">
                <Select
                  label="Country"
                  value={phoneCountry}
                  onChange={(e) => {
                    const next = e.target.value as Country;
                    if (next !== phoneCountry) setWhatsapp("");
                    setPhoneCountry(next);
                  }}
                >
                  {COUNTRY_OPTIONS.map((c) => (
                    <option key={c.country} value={c.country}>
                      {c.flag} {c.label}
                    </option>
                  ))}
                </Select>
                <Input
                  label="WhatsApp number"
                  autoComplete="tel"
                  value={whatsapp}
                  leading={countryCode}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder={phoneCountry === "NIGERIA" ? "8012345678" : "6XXXXXXXX"}
                  error={phoneError ?? undefined}
                />
                <Button
                  variant="outline"
                  loading={savingPhone}
                  onClick={async () => {
                    if (!isValidLocalPhone(whatsapp, phoneCountry)) {
                      setNotice(
                        phoneError ??
                          "Enter a valid WhatsApp number without the country code",
                      );
                      return;
                    }
                    setNotice(null);
                    setSavingPhone(true);
                    try {
                      const updated = await updateProfile({
                        phone: whatsapp.replace(/\D/g, ""),
                        countryCode,
                      });
                      setUser(updated);
                      popConfetti();
                    } catch (err) {
                      setNotice(getErrorMessage(err));
                    } finally {
                      setSavingPhone(false);
                    }
                  }}
                >
                  Save WhatsApp
                </Button>
              </div>
            </section>

            <section className="flex rounded-lg border border-border bg-surface py-4 shadow-rest">
              <Stat
                icon={Tag}
                value={activeListings.length}
                label="Active listings"
              />
              <Stat
                icon={Store}
                value={soldListings.length}
                label="Sold"
                tone="success"
              />
              <Stat
                icon={Gavel}
                value={bidsQuery.data?.length ?? 0}
                label="Bids made"
                tone="warning"
              />
            </section>

            <section
              className={cn(
                "rounded-lg border p-4 shadow-rest",
                verified
                  ? "border-success/30 bg-success/5"
                  : "border-border bg-surface",
              )}
            >
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-elevated text-success">
                  <Shield className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink">
                    {verified ? "Identity verified" : "Verify to sell with more trust"}
                  </p>
                  <p className="mt-1 text-sm text-ink-secondary">
                    {verified
                      ? `You can have up to ${listingCap} active listings.`
                      : `Complete ID verification to raise your cap from ${listingCap} to 10.`}
                  </p>
                  <p className="mt-2 type-meta">
                    {activeListings.length}/{listingCap} active listings used ·{" "}
                    <StatusBadge status={identityQuery.data?.status ?? "NONE"} />
                  </p>
                  {!verified ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => router.push("/identity")}
                    >
                      Get verified
                    </Button>
                  ) : (
                    <Link
                      href="/identity"
                      className="mt-3 inline-block text-sm font-semibold text-primary"
                    >
                      Manage verification
                    </Link>
                  )}
                </div>
              </div>
            </section>

            <section>
              <h2 className="type-section mb-3 text-ink">My activity</h2>
              <div className="flex gap-2">
                <ActivityTile
                  href="/selling"
                  icon={Store}
                  label="Selling"
                  value={listings.length}
                />
                <ActivityTile
                  href="/bids"
                  icon={Gavel}
                  label="My bids"
                  value={bidsQuery.data?.length}
                />
                <ActivityTile
                  href="/explore"
                  icon={Tag}
                  label="Browse"
                />
              </div>
            </section>

            <section className="overflow-hidden rounded-lg border border-border bg-surface shadow-rest">
              <MenuRow
                href="/notifications"
                icon={Bell}
                title="Notifications"
                subtitle="Offers, counters, and deal updates"
                badge={notificationsQuery.data?.unreadCount}
              />
              <MenuRow
                href="/onboarding/hub"
                icon={MapPin}
                title="Change hub"
                subtitle="Update your city and neighborhood"
              />
              <MenuRow
                href="/identity"
                icon={Shield}
                title="ID verification"
                subtitle={
                  verified
                    ? statusLabel("APPROVED")
                    : statusLabel(identityQuery.data?.status ?? "NONE")
                }
              />
              <MenuRow
                icon={Store}
                title="Log out"
                subtitle="Sign out of this device"
                onClick={() => setLogoutOpen(true)}
              />
              <MenuRow
                icon={Trash2}
                title="Delete account"
                subtitle="Permanently remove your listings, bids, and profile"
                onClick={() => setDeleteOpen(true)}
              />
            </section>

            <Dialog
              open={logoutOpen}
              onClose={() => {
                if (!loggingOut) setLogoutOpen(false);
              }}
              title="Log out?"
            >
              <p className="text-sm leading-relaxed text-ink-secondary">
                Log out of this device? You can sign back in anytime.
              </p>
              <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  disabled={loggingOut}
                  onClick={() => setLogoutOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="w-full sm:w-auto"
                  loading={loggingOut}
                  onClick={async () => {
                    setLoggingOut(true);
                    try {
                      await logout();
                      clear();
                      disconnectSocket();
                      setLogoutOpen(false);
                      router.replace("/");
                    } finally {
                      setLoggingOut(false);
                    }
                  }}
                >
                  Log out
                </Button>
              </div>
            </Dialog>

            <Dialog
              open={deleteOpen}
              onClose={() => {
                if (!deleting) {
                  setDeleteOpen(false);
                  setDeletePassword("");
                  setConfirmDelete(false);
                }
              }}
              title="Delete account?"
            >
              <p className="text-sm leading-relaxed text-ink-secondary">
                This permanently deletes your account, listings, and bids. You
                cannot undo this.
              </p>
              <div className="mt-4 space-y-3">
                <Input
                  label="Password"
                  type="password"
                  autoComplete="current-password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  helper="Required if you signed up with email. Google-only accounts can leave this blank."
                />
                <label className="flex cursor-pointer items-start gap-2.5 text-sm text-ink-secondary">
                  <input
                    type="checkbox"
                    checked={confirmDelete}
                    onChange={(e) => setConfirmDelete(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span>I understand this cannot be undone.</span>
                </label>
              </div>
              <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  disabled={deleting}
                  onClick={() => setDeleteOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  className="w-full sm:w-auto"
                  loading={deleting}
                  disabled={!confirmDelete}
                  onClick={async () => {
                    setDeleting(true);
                    setNotice(null);
                    try {
                      await deleteAccount(deletePassword.trim() || undefined);
                      clear();
                      disconnectSocket();
                      setDeleteOpen(false);
                      router.replace("/");
                    } catch (err) {
                      setNotice(getErrorMessage(err));
                    } finally {
                      setDeleting(false);
                    }
                  }}
                >
                  Delete account
                </Button>
              </div>
            </Dialog>

            {listingsQuery.isLoading ? (
              <section>
                <h2 className="type-section mb-3 text-ink">Your listings</h2>
                <div className="grid grid-cols-2 gap-3">
                  <ListingSkeleton />
                  <ListingSkeleton />
                </div>
              </section>
            ) : listings.length ? (
              <section>
                <PageHeader
                  title="Your listings"
                  className="mb-3"
                  action={
                    <Button variant="outline" onClick={() => router.push("/selling")}>
                      See all
                    </Button>
                  }
                />
                <div className="grid grid-cols-2 gap-3">
                  {listings.slice(0, 4).map((listing) => (
                    <ListingTile key={listing.id} listing={listing} />
                  ))}
                </div>
              </section>
            ) : (
              <section className="rounded-lg border border-dashed border-border bg-surface p-6 text-center shadow-rest">
                <p className="font-semibold text-ink">No listings yet</p>
                <p className="mt-1 text-sm text-ink-muted">
                  Turn something you’re no longer using into cash.
                </p>
                <Button className="mt-4" onClick={() => router.push("/sell")}>
                  Sell an item
                </Button>
              </section>
            )}
          </div>
        )}
      </RequireAuth>
    </AppShell>
  );
}
