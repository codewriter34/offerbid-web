"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Gavel, MapPin, Store } from "lucide-react";
import { AppShell } from "@/components/layout/Shells";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Button } from "@/components/ui/Button";
import { Countdown } from "@/components/ui/Countdown";
import {
  EmptyState,
  ErrorView,
  ListingThumbSkeleton,
  OfferRowSkeleton,
} from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Price } from "@/components/ui/Price";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SuccessSheet } from "@/components/ui/SuccessSheet";
import { OfferActions } from "@/components/listings/OfferActions";
import { useToast } from "@/components/ui/Toast";
import {
  fetchListingBids,
  fetchMyListings,
  respondToBid,
} from "@/features/api/services";
import { useAuthStore } from "@/stores/authStore";
import { getErrorMessage, openWhatsApp } from "@/lib/formatters";
import { statusLabel } from "@/lib/status";
import { connectSocket } from "@/lib/socket";

const BID_FILTERS = ["ALL", "PENDING", "COUNTERED", "ACCEPTED"] as const;

export default function SellingPage() {
  const router = useRouter();
  const toast = useToast();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [counterByBid, setCounterByBid] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<(typeof BID_FILTERS)[number]>("ALL");
  const [successUrl, setSuccessUrl] = useState<string | null | undefined>(
    undefined,
  );

  const listingsQuery = useQuery({
    queryKey: ["my-listings"],
    queryFn: fetchMyListings,
    enabled: Boolean(user),
  });

  const bidsQuery = useQuery({
    queryKey: ["incoming-bids", listingsQuery.data?.map((l) => l.id)],
    enabled: Boolean(listingsQuery.data?.length),
    queryFn: async () => {
      const listings = listingsQuery.data ?? [];
      const chunks = await Promise.all(
        listings.map(async (listing) => {
          const bids = await fetchListingBids(listing.id);
          return bids.map((bid) => ({
            ...bid,
            listingTitle: listing.title,
            listingImageUrl: listing.images[0]?.url,
            listingPlace:
              listing.location && listing.city
                ? `${listing.location}, ${listing.city}`
                : listing.location ?? listing.city ?? null,
            currency: listing.currency,
          }));
        }),
      );
      return chunks.flat().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
  });

  useEffect(() => {
    if (!user) return;
    const socket = connectSocket();
    const refresh = () => {
      void qc.invalidateQueries({ queryKey: ["incoming-bids"] });
      void qc.invalidateQueries({ queryKey: ["my-listings"] });
    };
    socket?.on("bid:placed", refresh);
    socket?.on("bid:countered", refresh);
    socket?.on("bid:responded", refresh);
    return () => {
      socket?.off("bid:placed", refresh);
      socket?.off("bid:countered", refresh);
      socket?.off("bid:responded", refresh);
    };
  }, [qc, user]);

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
      if (bid.status === "ACCEPTED") {
        setSuccessUrl(bid.whatsappUrl);
      } else {
        toast.push("Updated", "success");
      }
      void qc.invalidateQueries({ queryKey: ["incoming-bids"] });
    },
    onError: (e) => toast.push(getErrorMessage(e), "error"),
  });

  const pendingCount =
    bidsQuery.data?.filter(
      (bid) => bid.status === "PENDING" || bid.status === "COUNTERED",
    ).length ?? 0;

  return (
    <AppShell>
      <RequireAuth next="/selling">
      <PageHeader
        title="Selling"
        description={
          pendingCount
            ? `${pendingCount} offer${pendingCount === 1 ? "" : "s"} need your reply.`
            : "Your listings and incoming offers."
        }
        action={<Button onClick={() => router.push("/sell")}>New listing</Button>}
      />

      <section className="mb-10">
        <h2 className="type-section mb-3 text-ink">Your listings</h2>
        {listingsQuery.isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <ListingThumbSkeleton />
            <ListingThumbSkeleton />
            <ListingThumbSkeleton />
          </div>
        ) : listingsQuery.isError ? (
          <ErrorView
            message="Couldn’t load listings"
            onRetry={() => listingsQuery.refetch()}
          />
        ) : !listingsQuery.data?.length ? (
          <EmptyState
            icon={Store}
            title="You haven’t listed anything yet."
            description="Turn something you’re no longer using into cash."
            action={<Button onClick={() => router.push("/sell")}>Sell an item</Button>}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {listingsQuery.data.map((listing) => (
              <Link
                key={listing.id}
                href={`/listings/${listing.id}`}
                className="flex gap-3 rounded-lg border border-border bg-surface p-3 shadow-rest transition hover:shadow-hover"
              >
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-elevated">
                  {listing.images[0]?.url ? (
                    <Image
                      src={listing.images[0].url}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">
                    {listing.title}
                  </p>
                  <Price
                    amount={listing.askingPrice}
                    currency={listing.currency}
                    size="sm"
                    className="mt-1 block"
                  />
                  <p className="mt-1 inline-flex min-w-0 items-center gap-1 truncate type-meta">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {listing.location && listing.city
                      ? `${listing.location}, ${listing.city}`
                      : listing.location ?? listing.city ?? "Local"}
                  </p>
                  <div className="mt-2">
                    <StatusBadge status={listing.status} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="type-section mb-3 text-ink">Incoming offers</h2>
        <div className="mb-3 flex flex-wrap gap-2">
          {BID_FILTERS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`h-11 rounded-md px-3 text-xs font-semibold ${
                filter === item
                  ? "bg-primary text-white"
                  : "bg-surface text-ink-secondary ring-1 ring-border"
              }`}
            >
              {item === "ALL" ? "All" : statusLabel(item)}
            </button>
          ))}
        </div>
        {bidsQuery.isLoading ? (
          <div className="space-y-3">
            <OfferRowSkeleton />
            <OfferRowSkeleton />
          </div>
        ) : !bidsQuery.data?.length ? (
          <EmptyState
            icon={Gavel}
            title="No offers yet."
            description="When buyers offer on your listings, they show up here with a 24-hour clock."
            action={<Button onClick={() => router.push("/explore")}>Browse as a buyer</Button>}
          />
        ) : (
          <div className="space-y-3">
            {bidsQuery.data
              .filter((bid) => filter === "ALL" || bid.status === filter)
              .map((bid) => (
              <div
                key={bid.id}
                className="rounded-lg border border-border bg-surface p-4 shadow-rest"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 gap-3">
                    {bid.listingImageUrl ? (
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-elevated">
                        <Image
                          src={bid.listingImageUrl}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : null}
                    <div className="min-w-0">
                      <Link
                        href={`/listings/${bid.listingId}`}
                        className="font-semibold text-ink hover:text-primary"
                      >
                        {bid.listingTitle ?? "Listing"}
                      </Link>
                      <Price
                        amount={bid.counterAmount ?? bid.amount}
                        currency={bid.currency ?? "XAF"}
                        size="sm"
                        className="mt-1 block"
                      />
                      {bid.listingPlace ? (
                        <p className="mt-1 inline-flex items-center gap-1 type-meta">
                          <MapPin className="h-3 w-3 shrink-0" />
                          {bid.listingPlace}
                        </p>
                      ) : null}
                      <div className="mt-2 flex items-center gap-2">
                        <StatusBadge status={bid.status} />
                        <Countdown expiresAt={bid.expiresAt} />
                      </div>
                    </div>
                  </div>
                  {bid.whatsappUrl &&
                  bid.status !== "PENDING" &&
                  bid.status !== "COUNTERED" ? (
                    <Button onClick={() => openWhatsApp(bid.whatsappUrl!)}>
                      WhatsApp
                    </Button>
                  ) : null}
                </div>
                {bid.status === "PENDING" || bid.status === "COUNTERED" ? (
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
              </div>
            ))}
          </div>
        )}
      </section>
        <SuccessSheet
          open={successUrl !== undefined}
          onClose={() => setSuccessUrl(undefined)}
          title="Deal accepted"
          description="Meet in public, inspect the item, then pay. WhatsApp is next."
        >
          {successUrl ? (
            <Button
              className="w-full"
              onClick={() => {
                openWhatsApp(successUrl);
                setSuccessUrl(undefined);
              }}
            >
              Open WhatsApp
            </Button>
          ) : (
            <Button className="w-full" onClick={() => setSuccessUrl(undefined)}>
              Done
            </Button>
          )}
        </SuccessSheet>
      </RequireAuth>
    </AppShell>
  );
}
