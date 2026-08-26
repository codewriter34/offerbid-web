"use client";

import { use, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Gavel, MapPin, Share2, ShieldCheck, X } from "lucide-react";
import { AppShell } from "@/components/layout/Shells";
import { SafetyBanner } from "@/components/brand/Brand";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Price } from "@/components/ui/Price";
import { Countdown } from "@/components/ui/Countdown";
import { EmptyState, ErrorView, OfferRowSkeleton, Skeleton } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Dialog } from "@/components/ui/Dialog";
import { SuccessSheet } from "@/components/ui/SuccessSheet";
import { OfferActions } from "@/components/listings/OfferActions";
import { ActionNotice } from "@/components/ui/ActionNotice";
import { ApiWakeBanner } from "@/components/ui/ApiWakeBanner";
import {
  contactSeller,
  createBid,
  counterRespond,
  fetchListing,
  fetchListingBids,
  reportListing,
  respondToBid,
  updateListingStatus,
} from "@/features/api/services";
import {
  formatMemberSince,
  formatPrice,
  getErrorMessage,
  openWhatsApp,
} from "@/lib/formatters";
import { popConfetti } from "@/lib/confetti";
import { useAuthStore } from "@/stores/authStore";
import {
  connectSocket,
  subscribeToListing,
  unsubscribeFromListing,
} from "@/lib/socket";
import { effectiveWhatsAppPhone } from "@/lib/whatsappPhone";

export default function ListingDetailClient({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const [offer, setOffer] = useState("");
  const [counterByBid, setCounterByBid] = useState<Record<string, string>>({});
  const [activeImage, setActiveImage] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [bidOpen, setBidOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("Suspicious listing");
  const [notice, setNotice] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    kind: "offer" | "accepted";
    whatsappUrl?: string | null;
  } | null>(null);
  const swipeX = useRef<number | null>(null);

  const listingQuery = useQuery({
    queryKey: ["listing", id],
    queryFn: () => fetchListing(id),
  });

  const bidsQuery = useQuery({
    queryKey: ["listing-bids", id],
    queryFn: () => fetchListingBids(id),
    enabled: Boolean(user),
  });

  useEffect(() => {
    if (!user) return;
    connectSocket();
    subscribeToListing(id);
    const socket = connectSocket();
    const refresh = () => {
      void qc.invalidateQueries({ queryKey: ["listing", id] });
      void qc.invalidateQueries({ queryKey: ["listing-bids", id] });
    };
    socket?.on("bid:placed", refresh);
    socket?.on("bid:countered", refresh);
    socket?.on("bid:responded", refresh);
    return () => {
      unsubscribeFromListing(id);
      socket?.off("bid:placed", refresh);
      socket?.off("bid:countered", refresh);
      socket?.off("bid:responded", refresh);
    };
  }, [id, qc, user]);

  const listing = listingQuery.data;
  const isOwner = Boolean(user && listing && user.id === listing.sellerId);
  const isActive = listing?.status === "ACTIVE";
  const missingWhatsApp = Boolean(user && !effectiveWhatsAppPhone(user.phone));

  useEffect(() => {
    if (!lightbox || !listing) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") {
        setActiveImage((i) => (i + 1) % listing.images.length);
      }
      if (e.key === "ArrowLeft") {
        setActiveImage(
          (i) => (i - 1 + listing.images.length) % listing.images.length,
        );
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [lightbox, listing]);

  const bidMutation = useMutation({
    mutationFn: () => createBid({ listingId: id, offerAmount: Number(offer) }),
    onSuccess: () => {
      setNotice(null);
      setOffer("");
      setBidOpen(false);
      setSuccess({ kind: "offer" });
      void qc.invalidateQueries({ queryKey: ["listing-bids", id] });
      void qc.invalidateQueries({ queryKey: ["my-bids"] });
    },
    onError: (e) => setNotice(getErrorMessage(e)),
  });

  const respondMutation = useMutation({
    mutationFn: (payload: {
      bidId: string;
      action: "ACCEPT" | "REJECT" | "COUNTER";
      counterAmount?: number;
    }) =>
      respondToBid(payload.bidId, {
        action: payload.action,
        counterAmount: payload.counterAmount,
      }),
    onSuccess: (bid) => {
      setNotice(null);
      if (bid.status === "ACCEPTED") {
        setSuccess({ kind: "accepted", whatsappUrl: bid.whatsappUrl });
      } else {
        popConfetti();
      }
      void qc.invalidateQueries({ queryKey: ["listing-bids", id] });
    },
    onError: (e) => setNotice(getErrorMessage(e)),
  });

  const counterRespondMutation = useMutation({
    mutationFn: (payload: { bidId: string; action: "ACCEPT" | "REJECT" }) =>
      counterRespond(payload.bidId, { action: payload.action }),
    onSuccess: (bid) => {
      setNotice(null);
      if (bid.status === "ACCEPTED") {
        setSuccess({ kind: "accepted", whatsappUrl: bid.whatsappUrl });
      } else {
        popConfetti();
      }
      void qc.invalidateQueries({ queryKey: ["listing-bids", id] });
      void qc.invalidateQueries({ queryKey: ["my-bids"] });
    },
    onError: (e) => setNotice(getErrorMessage(e)),
  });

  async function shareListing() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: listing?.title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setNotice(null);
      popConfetti();
    } catch {
      setNotice("Couldn’t share this listing");
    }
  }

  if (listingQuery.isLoading) {
    return (
      <AppShell>
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <Skeleton className="aspect-[4/3] w-full rounded-lg" />
          <div className="space-y-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-12 w-40" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </AppShell>
    );
  }

  if (listingQuery.isError || !listing) {
    return (
      <AppShell>
        <ApiWakeBanner onRetry={() => listingQuery.refetch()} />
        <ErrorView
          message="Listing not found or failed to load."
          onRetry={() => listingQuery.refetch()}
        />
      </AppShell>
    );
  }

  const image = listing.images[activeImage]?.url ?? listing.images[0]?.url;
  const visibleBids =
    bidsQuery.data?.filter((b) => isOwner || b.buyerId === user?.id) ?? [];
  const bidCount = listing.bidCount ?? visibleBids.length;
  const memberSince = formatMemberSince(listing.seller?.createdAt);
  const place =
    listing.location && listing.city
      ? `${listing.location}, ${listing.city}`
      : listing.location ?? listing.city ?? "Local hub";

  return (
    <AppShell>
      <Link
        href="/explore"
        className="mb-4 inline-flex min-h-11 items-center text-sm font-semibold text-ink-secondary hover:text-ink"
      >
        ← Deals in {listing.city ?? "your hub"}
      </Link>
      <ActionNotice message={notice} tone="error" className="mb-4" />
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <button
            type="button"
            onClick={() => image && setLightbox(true)}
            className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-elevated"
          >
            {image ? (
              <Image
                src={image}
                alt={listing.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width:1024px) 100vw, 60vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-ink-muted">
                No photo
              </div>
            )}
          </button>
          {listing.images.length > 1 ? (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {listing.images.map((img, idx) => (
                <button
                  key={img.id ?? idx}
                  type="button"
                  onClick={() => setActiveImage(idx)}
                  className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-md ring-2 ${
                    activeImage === idx ? "ring-primary" : "ring-transparent"
                  }`}
                >
                  <Image
                    src={img.url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge tone="primary">{listing.category}</Badge>
              {listing.status !== "ACTIVE" ? (
                <StatusBadge status={listing.status} />
              ) : null}
              <span className="type-meta">
                {bidCount} offer{bidCount === 1 ? "" : "s"}
              </span>
              <button
                type="button"
                onClick={() => void shareListing()}
                className="ml-auto inline-flex min-h-11 items-center gap-1 px-2 text-sm font-semibold text-ink-muted hover:text-ink"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
            </div>
            <h1 className="type-page text-ink">{listing.title}</h1>
            <Price
              amount={listing.askingPrice}
              currency={listing.currency}
              size="lg"
              className="mt-3 block"
            />
            <p className="mt-2 flex items-center gap-1 text-sm text-ink-secondary">
              <MapPin className="h-4 w-4 shrink-0" />
              {place}
            </p>
          </div>

          {isOwner ? (
            <div className="space-y-3">
              <p className="type-label">Your listing</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!isActive}
                  onClick={() =>
                    updateListingStatus(id, "SOLD")
                      .then(() => {
                        setNotice(null);
                        popConfetti();
                        void listingQuery.refetch();
                      })
                      .catch((e) => setNotice(getErrorMessage(e)))
                  }
                >
                  Mark sold
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!isActive}
                  onClick={() =>
                    updateListingStatus(id, "CLOSED")
                      .then(() => {
                        setNotice(null);
                        popConfetti();
                        void listingQuery.refetch();
                      })
                      .catch((e) => setNotice(getErrorMessage(e)))
                  }
                >
                  Close listing
                </Button>
              </div>
            </div>
          ) : (
            <div className="hidden space-y-3 lg:block">
              {!isActive ? (
                <p className="text-sm text-ink-secondary">
                  This listing is no longer accepting offers.
                </p>
              ) : !user ? (
                <div className="space-y-3">
                  <p className="text-sm text-ink-secondary">
                    Log in to make an offer.
                  </p>
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => {
                      window.location.href = `/auth?next=/listings/${id}`;
                    }}
                  >
                    Log in to offer
                  </Button>
                </div>
              ) : (
                <>
                  {missingWhatsApp ? (
                    <p className="text-xs text-ink-muted">
                      Add a WhatsApp number in{" "}
                      <Link href="/onboarding/hub" className="font-semibold text-primary">
                        hub settings
                      </Link>{" "}
                      so accepted deals can reach you.
                    </p>
                  ) : null}
                  <Button className="w-full" size="lg" onClick={() => setBidOpen(true)}>
                    Make an offer
                  </Button>
                  <button
                    type="button"
                    className="w-full min-h-11 text-sm font-semibold text-ink-muted hover:text-ink"
                    onClick={async () => {
                      try {
                        const url = await contactSeller(id);
                        if (url) openWhatsApp(url);
                        else setNotice("WhatsApp link unavailable");
                      } catch (e) {
                        setNotice(getErrorMessage(e));
                      }
                    }}
                  >
                    Request WhatsApp
                  </button>
                </>
              )}
            </div>
          )}

          <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-secondary">
            {listing.description}
          </p>

          <div className="flex items-center gap-3 text-sm text-ink-secondary">
            <span className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-md bg-elevated">
              {listing.seller?.avatarUrl ? (
                <Image
                  src={listing.seller.avatarUrl}
                  alt=""
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              ) : (
                (listing.seller?.fullName ?? "S").slice(0, 1)
              )}
            </span>
            <div>
              <p className="font-semibold text-ink">
                {listing.seller?.fullName ?? "Seller"}
              </p>
              <p className="type-meta inline-flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" />
                {memberSince ? `Member since ${memberSince}` : "Campus seller"}
              </p>
            </div>
          </div>

          <SafetyBanner />

          <Dialog
            open={bidOpen}
            onClose={() => setBidOpen(false)}
            title="Make an offer"
          >
            <p className="mb-4 type-meta">
              Asking {formatPrice(listing.askingPrice, listing.currency)}
            </p>
            <Input
              label="Your offer amount"
              type="number"
              value={offer}
              onChange={(e) => setOffer(e.target.value)}
              placeholder={`Min ${formatPrice(listing.minBidPrice, listing.currency)}`}
              helper={`Minimum offer ${formatPrice(listing.minBidPrice, listing.currency)}`}
            />
            <Button
              className="mt-4 w-full"
              loading={bidMutation.isPending}
              disabled={!offer || !isActive}
              onClick={() => bidMutation.mutate()}
            >
              Submit offer
            </Button>
          </Dialog>

          {user ? (
            <button
              type="button"
              className="min-h-11 text-xs font-semibold text-danger"
              onClick={() => setReportOpen(true)}
            >
              Report listing
            </button>
          ) : null}
        </div>
      </div>

      {!isOwner && isActive ? (
        <div className="safe-sticky-cta fixed inset-x-0 z-30 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-7xl items-center gap-3">
            <Price
              amount={listing.askingPrice}
              currency={listing.currency}
              size="sm"
              className="min-w-0 truncate"
            />
            {!user ? (
              <Button
                className="ml-auto"
                onClick={() => {
                  window.location.href = `/auth?next=/listings/${id}`;
                }}
              >
                Log in to offer
              </Button>
            ) : (
              <Button className="ml-auto" onClick={() => setBidOpen(true)}>
                Make offer
              </Button>
            )}
          </div>
        </div>
      ) : null}

      <Dialog
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        title="Report listing"
      >
        <Input
          label="Reason"
          value={reportReason}
          onChange={(e) => setReportReason(e.target.value)}
        />
        <Button
          className="mt-4 w-full"
          variant="danger"
          onClick={async () => {
            try {
              await reportListing(id, reportReason || "Suspicious listing");
              setNotice(null);
              popConfetti();
              setReportOpen(false);
            } catch (e) {
              setNotice(getErrorMessage(e));
            }
          }}
        >
          Submit report
        </Button>
      </Dialog>

      {lightbox && image ? (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/90 p-4"
          onTouchStart={(e) => {
            swipeX.current = e.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(e) => {
            if (swipeX.current == null || listing.images.length < 2) return;
            const dx = (e.changedTouches[0]?.clientX ?? 0) - swipeX.current;
            if (dx > 40) {
              setActiveImage(
                (i) => (i - 1 + listing.images.length) % listing.images.length,
              );
            } else if (dx < -40) {
              setActiveImage((i) => (i + 1) % listing.images.length);
            }
            swipeX.current = null;
          }}
        >
          <button
            type="button"
            aria-label="Close photos"
            className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-md bg-white/10 text-white"
            onClick={() => setLightbox(false)}
          >
            <X className="h-5 w-5" />
          </button>
          {listing.images.length > 1 ? (
            <>
              <button
                type="button"
                aria-label="Previous photo"
                className="absolute left-4 inline-flex h-11 w-11 items-center justify-center rounded-md bg-white/10 text-white"
                onClick={() =>
                  setActiveImage(
                    (i) =>
                      (i - 1 + listing.images.length) % listing.images.length,
                  )
                }
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                aria-label="Next photo"
                className="absolute right-16 inline-flex h-11 w-11 items-center justify-center rounded-md bg-white/10 text-white"
                onClick={() =>
                  setActiveImage((i) => (i + 1) % listing.images.length)
                }
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          ) : null}
          <div className="relative h-[80vh] w-full max-w-4xl">
            <Image
              src={listing.images[activeImage]?.url ?? image}
              alt={listing.title}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
        </div>
      ) : null}

      {user ? (
        <section className="mt-10">
          <h2 className="type-section mb-4 text-ink">
            {isOwner ? "Incoming offers" : "Your activity on this item"}
          </h2>
          {bidsQuery.isLoading ? (
            <div className="space-y-3">
              <OfferRowSkeleton />
              <OfferRowSkeleton />
            </div>
          ) : !visibleBids.length ? (
            <EmptyState
              icon={Gavel}
              title="No offers yet"
              description={
                isOwner
                  ? "When buyers bid on this listing, their offers will appear here."
                  : "Submit an offer above to get started."
              }
            />
          ) : (
            <div className="space-y-3">
              {visibleBids.map((bid) => (
                <div
                  key={bid.id}
                  className="rounded-lg border border-border bg-surface p-4 shadow-rest"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <Price
                        amount={bid.counterAmount ?? bid.amount}
                        currency={listing.currency}
                      />
                      {bid.counterAmount ? (
                        <p className="mt-1 type-meta">
                          Original offer{" "}
                          {formatPrice(bid.amount, listing.currency)}
                        </p>
                      ) : null}
                      <div className="mt-1 flex items-center gap-2">
                        <StatusBadge status={bid.status} />
                        <Countdown expiresAt={bid.expiresAt} />
                      </div>
                    </div>
                    {bid.whatsappUrl ? (
                      <Button onClick={() => openWhatsApp(bid.whatsappUrl!)}>
                        Open WhatsApp
                      </Button>
                    ) : null}
                  </div>

                  {isOwner && isActive && bid.status === "PENDING" ? (
                    <OfferActions
                      counterValue={counterByBid[bid.id] ?? ""}
                      onCounterChange={(value) =>
                        setCounterByBid((prev) => ({
                          ...prev,
                          [bid.id]: value,
                        }))
                      }
                      onAccept={() =>
                        respondMutation.mutate({
                          bidId: bid.id,
                          action: "ACCEPT",
                        })
                      }
                      onReject={() =>
                        respondMutation.mutate({
                          bidId: bid.id,
                          action: "REJECT",
                        })
                      }
                      onCounter={() =>
                        respondMutation.mutate({
                          bidId: bid.id,
                          action: "COUNTER",
                          counterAmount: Number(counterByBid[bid.id]),
                        })
                      }
                      counterPending
                    />
                  ) : null}

                  {isOwner && bid.status === "COUNTERED" ? (
                    <p className="mt-3 rounded-md border border-border bg-canvas px-3 py-2 text-sm text-ink-secondary">
                      Waiting for buyer to accept or decline your counter.
                    </p>
                  ) : null}

                  {!isOwner && bid.status === "COUNTERED" ? (
                    <OfferActions
                      counterValue=""
                      onCounterChange={() => undefined}
                      onAccept={() =>
                        counterRespondMutation.mutate({
                          bidId: bid.id,
                          action: "ACCEPT",
                        })
                      }
                      onReject={() =>
                        counterRespondMutation.mutate({
                          bidId: bid.id,
                          action: "REJECT",
                        })
                      }
                      onCounter={() => undefined}
                      acceptLabel="Accept counter"
                      rejectLabel="Decline"
                    />
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </section>
      ) : null}

      <SuccessSheet
        open={success?.kind === "offer"}
        onClose={() => setSuccess(null)}
        title="Offer sent"
        description="The seller can accept, reject, or counter. You’ll hear back here."
      >
        <Button className="w-full" onClick={() => setSuccess(null)}>
          View activity
        </Button>
      </SuccessSheet>
      <SuccessSheet
        open={success?.kind === "accepted"}
        onClose={() => setSuccess(null)}
        title="Deal accepted"
        description="Meet in public, inspect the item, then pay. WhatsApp is next."
      >
        {success?.whatsappUrl ? (
          <Button
            className="w-full"
            onClick={() => {
              openWhatsApp(success.whatsappUrl!);
              setSuccess(null);
            }}
          >
            Open WhatsApp
          </Button>
        ) : (
          <Button className="w-full" onClick={() => setSuccess(null)}>
            Done
          </Button>
        )}
      </SuccessSheet>
    </AppShell>
  );
}
