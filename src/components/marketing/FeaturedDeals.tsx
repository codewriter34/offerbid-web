"use client";

import { useQuery } from "@tanstack/react-query";
import { Store } from "lucide-react";
import { ListingTile } from "@/components/listings/ListingTile";
import {
  EmptyState,
  ErrorView,
  ListingSkeleton,
} from "@/components/ui/EmptyState";
import { ApiWakeBanner } from "@/components/ui/ApiWakeBanner";
import { Button } from "@/components/ui/Button";
import { fetchListings } from "@/features/api/services";

export function FeaturedDeals() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["featured-listings", "Buea"],
    queryFn: () =>
      fetchListings({ limit: 4, status: "ACTIVE", city: "Buea" }),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <ListingSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <>
        <ApiWakeBanner onRetry={() => refetch()} />
        <ErrorView
          message="Couldn’t load live deals yet."
          onRetry={() => refetch()}
        />
      </>
    );
  }

  const listings = data?.listings ?? [];

  if (!listings.length) {
    return (
      <EmptyState
        icon={Store}
        title="Be the first listing in your hub"
        description="No live deals yet in this hub. List something nearby."
        action={
          <Button
            onClick={() => (window.location.href = "/auth?next=/sell")}
          >
            Start selling
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:gap-4">
      {listings.slice(0, 4).map((listing) => (
        <ListingTile key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
