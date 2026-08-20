"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Gavel, MapPin } from "lucide-react";
import { AppShell } from "@/components/layout/Shells";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Button } from "@/components/ui/Button";
import { Countdown } from "@/components/ui/Countdown";
import {
  EmptyState,
  ErrorView,
  OfferRowSkeleton,
} from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Price } from "@/components/ui/Price";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SuccessSheet } from "@/components/ui/SuccessSheet";
import { OfferActions } from "@/components/listings/OfferActions";
import { useToast } from "@/components/ui/Toast";
import { counterRespond, fetchMyBids } from "@/features/api/services";
import { useAuthStore } from "@/stores/authStore";
import { formatPrice, getErrorMessage, openWhatsApp } from "@/lib/formatters";
import { statusLabel } from "@/lib/status";
import { connectSocket, subscribeToListing, unsubscribeFromListing } from "@/lib/socket";

const BID_FILTERS = ["ALL", "PENDING", "COUNTERED", "ACCEPTED"] as const;

export default function MyBidsPage() {
  const router = useRouter();
  const toast = useToast();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [filter, setFilter] = useState<(typeof BID_FILTERS)[number]>("ALL");
  const [successUrl, setSuccessUrl] = useState<string | null | undefined>(
    undefined,
  );

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["my-bids"],
    queryFn: fetchMyBids,
    enabled: Boolean(user),
  });

  useEffect(() => {
    if (!user) return;
    const socket = connectSocket();
    const refresh = () => {
      void qc.invalidateQueries({ queryKey: ["my-bids"] });
    };
    socket?.on("bid:countered", refresh);
    socket?.on("bid:responded", refresh);
    socket?.on("notification:new", refresh);
    return () => {
      socket?.off("bid:countered", refresh);
      socket?.off("bid:responded", refresh);
      socket?.off("notification:new", refresh);
    };
  }, [qc, user]);

  useEffect(() => {
    if (!data?.length) return;
    const listingIds = [...new Set(data.map((bid) => bid.listingId))];
    listingIds.forEach((id) => subscribeToListing(id));
    return () => {
      listingIds.forEach((id) => unsubscribeFromListing(id));
    };
  }, [data]);

  const counterMutation = useMutation({
    mutationFn: (payload: { bidId: string; action: "ACCEPT" | "REJECT" }) =>
      counterRespond(payload.bidId, { action: payload.action }),
    onSuccess: (bid) => {
      if (bid.status === "ACCEPTED") {
        setSuccessUrl(bid.whatsappUrl);
      } else {
        toast.push("Updated", "success");
      }
      void qc.invalidateQueries({ queryKey: ["my-bids"] });
    },
    onError: (e) => toast.push(getErrorMessage(e), "error"),
  });

  const activeCount =
    data?.filter(
      (bid) => bid.status === "PENDING" || bid.status === "COUNTERED",
    ).length ?? 0;

  const filteredBids =
    data?.filter((bid) => filter === "ALL" || bid.status === filter) ?? [];

  return (
    <AppShell>
      <RequireAuth next="/bids">
        <PageHeader
          title="My bids"
          description={
            activeCount
              ? `${activeCount} offer${activeCount === 1 ? "" : "s"} waiting on a reply.`
              : "Offers you’ve made and counters to respond to."
          }
          action={
            <Button variant="secondary" onClick={() => router.push("/explore")}>
              Browse deals
            </Button>
          }
        />

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

        {isLoading ? (
          <div className="space-y-3">
            <OfferRowSkeleton />
            <OfferRowSkeleton />
            <OfferRowSkeleton />
          </div>
        ) : isError ? (
          <ErrorView message="Couldn’t load bids" onRetry={() => refetch()} />
        ) : !data?.length ? (
          <EmptyState
            icon={Gavel}
            title="No bids yet."
            description="Find something nearby and make an offer."
            action={
              <Button onClick={() => router.push("/explore")}>
                Browse deals
              </Button>
            }
          />
        ) : !filteredBids.length ? (
          <EmptyState
            icon={Gavel}
            title="Nothing in this filter."
            description="Try another tab or browse more deals near you."
            action={
              <Button variant="secondary" onClick={() => setFilter("ALL")}>
                Show all
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {filteredBids.map((bid) => (
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
                      {bid.askingPrice != null ? (
                        <Price
                          amount={bid.askingPrice}
                          currency={bid.currency ?? "XAF"}
                          size="sm"
                          className="mt-1 block"
                        />
                      ) : null}
                      {bid.listingPlace ? (
                        <p className="mt-1 inline-flex items-center gap-1 type-meta">
                          <MapPin className="h-3 w-3 shrink-0" />
                          {bid.listingPlace}
                        </p>
                      ) : null}
                      <div className="mt-2 space-y-1">
                        <p className="type-meta">
                          Your offer{" "}
                          <span className="font-semibold text-ink">
                            {formatPrice(bid.amount, bid.currency ?? "XAF")}
                          </span>
                        </p>
                        {bid.counterAmount ? (
                          <p className="type-meta">
                            Seller counter{" "}
                            <span className="font-semibold text-primary">
                              {formatPrice(
                                bid.counterAmount,
                                bid.currency ?? "XAF",
                              )}
                            </span>
                          </p>
                        ) : null}
                      </div>
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
                {bid.status === "COUNTERED" ? (
                  <OfferActions
                    counterValue=""
                    onCounterChange={() => undefined}
                    onAccept={() =>
                      counterMutation.mutate({
                        bidId: bid.id,
                        action: "ACCEPT",
                      })
                    }
                    onReject={() =>
                      counterMutation.mutate({
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
