"use client";

import { useEffect, useMemo, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { MapPin, SlidersHorizontal } from "lucide-react";
import { AppShell } from "@/components/layout/Shells";
import {
  CategoryChips,
  ListingTile,
} from "@/components/listings/ListingTile";
import {
  EmptyState,
  ErrorView,
  ListingSkeleton,
} from "@/components/ui/EmptyState";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { PageHeader } from "@/components/ui/PageHeader";
import { ApiWakeBanner } from "@/components/ui/ApiWakeBanner";
import { fetchListings } from "@/features/api/services";
import { useHubStore } from "@/stores/hubStore";
import { useAuthStore } from "@/stores/authStore";
import { allCities, neighborhoodsForCity, countryForCity } from "@/lib/hubs";
import type { Listing } from "@/types";

function applyClientFilters(
  listings: Listing[],
  sort: string,
  minPrice: string,
  maxPrice: string,
) {
  const min = minPrice ? Number(minPrice) : null;
  const max = maxPrice ? Number(maxPrice) : null;
  let next = listings.filter((listing) => {
    if (min != null && Number.isFinite(min) && listing.askingPrice < min) {
      return false;
    }
    if (max != null && Number.isFinite(max) && listing.askingPrice > max) {
      return false;
    }
    return true;
  });
  if (sort === "price_asc") {
    next = [...next].sort((a, b) => a.askingPrice - b.askingPrice);
  } else if (sort === "price_desc") {
    next = [...next].sort((a, b) => b.askingPrice - a.askingPrice);
  } else {
    next = [...next].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  return next;
}

export default function ExploreClient() {
  const categories = useHubStore((s) => s.categories);
  const countries = useHubStore((s) => s.countries);
  const setSelection = useHubStore((s) => s.setSelection);
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";
  const initialCity = searchParams.get("city");

  const [search, setSearch] = useState(initialQ);
  const [q, setQ] = useState(initialQ);
  const [category, setCategory] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(initialCity);
  const [location, setLocation] = useState<string | null>(null);
  const [sort, setSort] = useState("newest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const next = searchParams.get("q") ?? "";
    setSearch(next);
    setQ(next);
    const nextCity = searchParams.get("city");
    if (nextCity) setCity(nextCity);
  }, [searchParams]);

  // Live search-as-you-type (debounced) — no Search button required.
  useEffect(() => {
    const handle = window.setTimeout(() => {
      const next = search.trim();
      setQ(next);
      const current = searchParams.get("q") ?? "";
      if (next === current) return;
      const params = new URLSearchParams(searchParams.toString());
      if (next) params.set("q", next);
      else params.delete("q");
      const qs = params.toString();
      router.replace(qs ? `/explore?${qs}` : "/explore", { scroll: false });
    }, 320);
    return () => window.clearTimeout(handle);
  }, [search, router, searchParams]);

  const cities = useMemo(() => allCities(countries), [countries]);
  const neighborhoods = useMemo(() => {
    if (!city) return [];
    const country =
      countryForCity(countries, city) || countries[0]?.country || "";
    return neighborhoodsForCity(countries, country, city, false, "Other");
  }, [city, countries]);

  const query = useInfiniteQuery({
    queryKey: ["listings", q, category, city, location],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      fetchListings({
        q: q || null,
        category,
        city: city || null,
        location: location || null,
        page: pageParam,
        limit: 24,
      }),
    getNextPageParam: (last) => {
      const loaded = last.page * last.limit;
      return loaded < last.total ? last.page + 1 : undefined;
    },
  });

  const rawListings = query.data?.pages.flatMap((page) => page.listings) ?? [];
  const total = query.data?.pages.at(-1)?.total ?? rawListings.length;
  const listings = applyClientFilters(rawListings, sort, minPrice, maxPrice);
  const placeLabel = location && city ? `${location}, ${city}` : city;
  const filterCount = [city, location, minPrice, maxPrice, sort !== "newest"].filter(
    Boolean,
  ).length;

  const filterFields = (
    <div className="space-y-3">
      <Select
        label="City"
        value={city ?? ""}
        onChange={(e) => {
          const value = e.target.value || null;
          setCity(value);
          setLocation(null);
          setSelection(value, null);
        }}
      >
        <option value="">All cities</option>
        {cities.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </Select>
      <Select
        label="Neighborhood"
        value={location ?? ""}
        disabled={!city}
        onChange={(e) => {
          const value = e.target.value || null;
          setLocation(value);
          setSelection(city, value);
        }}
      >
        <option value="">All nearby</option>
        {neighborhoods.map((loc) => (
          <option key={loc} value={loc}>
            {loc}
          </option>
        ))}
      </Select>
      <Select
        label="Sort"
        value={sort}
        onChange={(e) => setSort(e.target.value)}
      >
        <option value="newest">Newest</option>
        <option value="price_asc">Price: low to high</option>
        <option value="price_desc">Price: high to low</option>
      </Select>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Min price"
          type="number"
          min={0}
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          placeholder="0"
        />
        <Input
          label="Max price"
          type="number"
          min={0}
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          placeholder="Any"
        />
      </div>
    </div>
  );

  return (
    <AppShell
      searchValue={search}
      onSearchChange={setSearch}
    >
      <PageHeader
        title={city ? `Second-hand deals in ${city}` : "Second-hand items in Cameroon"}
        description={
          location
            ? `Unused and pre-owned items around ${location}. Make an offer, meet locally.`
            : "Search laptops, phones, furniture and more. Filter by city if you want a smaller list."
        }
      />

      <div className="mb-5 flex items-center gap-2">
        <div className="min-w-0 flex-1 overflow-hidden">
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
        <Button
          variant="outline"
          size="sm"
          className="shrink-0"
          onClick={() => setFiltersOpen(true)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {filterCount ? (
            <span className="text-primary">{filterCount}</span>
          ) : null}
        </Button>
      </div>

      <Sheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filters"
      >
        {filterFields}
        <Button className="mt-5 w-full" onClick={() => setFiltersOpen(false)}>
          Show results
        </Button>
      </Sheet>

      {query.isLoading ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ListingSkeleton key={i} />
          ))}
        </div>
      ) : query.isError ? (
        <>
          <ApiWakeBanner onRetry={() => query.refetch()} />
          <ErrorView
            message="Couldn’t load listings yet."
            onRetry={() => query.refetch()}
          />
        </>
      ) : !listings.length ? (
        <EmptyState
          icon={MapPin}
          title={placeLabel ? `Nothing listed around ${placeLabel} yet.` : "No listings yet."}
          description={
            placeLabel
              ? "Try showing all deals, or be the first to list something nearby."
              : "Be the first to list a pre-owned item."
          }
          action={
            <div className="flex flex-wrap justify-center gap-2">
              {placeLabel ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setCity(null);
                    setLocation(null);
                    setSelection(null, null);
                  }}
                >
                  Show all deals
                </Button>
              ) : (
                <Button variant="outline" onClick={() => setFiltersOpen(true)}>
                  Change location
                </Button>
              )}
              <Button
                onClick={() => {
                  window.location.href = user ? "/sell" : "/auth?next=/sell";
                }}
              >
                Sell an item
              </Button>
            </div>
          }
        />
      ) : (
        <>
          <p className="mb-3 type-meta">
            {listings.length}
            {total ? ` of ${total}` : ""}
            {placeLabel ? ` in ${placeLabel}` : " across Cameroon"}
            {query.isFetching ? " · updating" : ""}
          </p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {listings.map((listing) => (
              <ListingTile key={listing.id} listing={listing} />
            ))}
          </div>
          {query.hasNextPage ? (
            <div className="mt-8 flex justify-center">
              <Button
                variant="outline"
                loading={query.isFetchingNextPage}
                onClick={() => query.fetchNextPage()}
              >
                Load more
              </Button>
            </div>
          ) : null}
        </>
      )}
    </AppShell>
  );
}
