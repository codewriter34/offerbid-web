"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import type { Listing } from "@/types";
import { formatRelativeTime } from "@/lib/formatters";
import { cn } from "@/lib/cn";
import { Price } from "@/components/ui/Price";
import { StatusBadge } from "@/components/ui/StatusBadge";

export function ListingTile({ listing }: { listing: Listing }) {
  const image = listing.images[0]?.url;
  const unavailable = listing.status !== "ACTIVE";

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="listing-tile group block cursor-pointer overflow-hidden rounded-lg border border-border bg-surface shadow-rest"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-elevated">
        {image ? (
          <Image
            src={image}
            alt={listing.title}
            fill
            sizes="(max-width:768px) 50vw, 25vw"
            className={cn(
              "listing-tile-image object-cover",
              unavailable && "opacity-70",
            )}
            unoptimized={image.includes("unsplash.com")}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-ink-muted">
            No photo
          </div>
        )}
        {listing.category && !unavailable ? (
          <>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-ink/45 to-transparent" />
            <span className="absolute left-2 top-2 text-[11px] font-semibold text-white">
              {listing.category}
            </span>
          </>
        ) : null}
        {unavailable ? (
          <div className="absolute inset-0 flex items-end bg-ink/35 p-2">
            <StatusBadge status={listing.status} />
          </div>
        ) : null}
      </div>
      <div className="space-y-1 p-3">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-ink">
          {listing.title}
        </h3>
        <Price
          amount={listing.askingPrice}
          currency={listing.currency}
          size="sm"
        />
        <div className="flex items-center justify-between gap-2 type-meta">
          <span className="inline-flex min-w-0 items-center gap-1 truncate">
            <MapPin className="h-3 w-3 shrink-0" />
            {listing.location ?? listing.city ?? "Local"}
          </span>
          <span className="shrink-0">{formatRelativeTime(listing.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}

export function CategoryChips({
  categories,
  value,
  onChange,
}: {
  categories: string[];
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      <button
        type="button"
        onClick={() => onChange(null)}
        className={cn(
          "min-h-11 shrink-0 cursor-pointer rounded-md px-3 text-sm font-semibold transition",
          !value
            ? "bg-primary text-white"
            : "bg-surface text-ink-secondary ring-1 ring-border hover:text-ink",
        )}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          type="button"
          onClick={() => onChange(cat === value ? null : cat)}
          className={cn(
            "min-h-11 shrink-0 cursor-pointer rounded-md px-3 text-sm font-semibold transition",
            value === cat
              ? "bg-primary text-white"
              : "bg-surface text-ink-secondary ring-1 ring-border hover:text-ink",
          )}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
