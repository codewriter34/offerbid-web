"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Store } from "lucide-react";
import { CategoryChips, ListingTile } from "@/components/listings/ListingTile";
import {
  EmptyState,
  ErrorView,
  ListingSkeleton,
} from "@/components/ui/EmptyState";
import { ApiWakeBanner } from "@/components/ui/ApiWakeBanner";
import { Button } from "@/components/ui/Button";
import { fetchListings } from "@/features/api/services";
import { useHubStore } from "@/stores/hubStore";

const LANDING_LISTING_COUNT = 20;

export function FeaturedDeals() {
  const categories = useHubStore((s) => s.categories);
  const [category, setCategory] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["featured-listings", "cameroon", category],
    queryFn: () =>
      fetchListings({
        limit: LANDING_LISTING_COUNT,
        status: "ACTIVE",
        category,
      }),
  });

  const listings = data?.listings.slice(0, LANDING_LISTING_COUNT) ?? [];
  const exploreHref = category
    ? `/explore?category=${encodeURIComponent(category)}`
    : "/explore";

  return (
    <div>
      <div className="mb-5">
        <CategoryChips
          categories={
            categories.length
              ? categories
              : ["Tech", "Phones", "Furniture", "Fashion", "Books"]
          }
          value={category}
          onChange={setCategory}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ListingSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <>
          <ApiWakeBanner onRetry={() => refetch()} />
          <ErrorView
            message="Couldn’t load live deals yet."
            onRetry={() => refetch()}
          />
        </>
      ) : !listings.length ? (
        <EmptyState
          icon={Store}
          title={
            category
              ? `No ${category.toLowerCase()} listings yet`
              : "Be the first listing in your hub"
          }
          description={
            category
              ? "Try another category, or list something in this one."
              : "No live deals yet in this hub. List something nearby."
          }
          action={
            <Button
              onClick={() => (window.location.href = "/auth?next=/sell")}
            >
              Start selling
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:gap-4">
            {listings.map((listing) => (
              <ListingTile key={listing.id} listing={listing} />
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <Link
              href={exploreHref}
              className="inline-flex h-12 min-w-44 items-center justify-center rounded-md bg-primary px-6 text-sm font-bold text-white transition hover:bg-primary-hover"
            >
              Browse more
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
