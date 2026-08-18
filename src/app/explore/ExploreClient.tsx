"use client";

import { useEffect, useMemo, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { MapPin, Search, SlidersHorizontal } from "lucide-react";
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
  const selectedCity = useHubStore((s) => s.selectedCity);
  const selectedLocation = useHubStore((s) => s.selectedLocation);
  const setSelection = useHubStore((s) => s.setSelection);
  const user = useAuthStore((s) => s.user);
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";

  const [search, setSearch] = useState(initialQ);
  const [q, setQ] = useState(initialQ);
  const [category, setCategory] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(
    selectedCity ?? user?.city ?? "Buea",
  );
  const [location, setLocation] = useState<string | null>(
    selectedLocation ?? user?.location ?? null,
  );
  const [sort, setSort] = useState("newest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const next = searchParams.get("q") ?? "";
    setSearch(next);
    setQ(next);
  }, [searchParams]);

  useEffect(() => {
    if (selectedCity) {
      setCity(selectedCity);
      setLocation(selectedLocation ?? null);
    }
  }, [selectedCity, selectedLocation]);

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
        city,
        location,
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
  const runSearch = () => setQ(search.trim());
  const placeLabel = location && city ? `${location}, ${city}` : city ?? "nearby";
  const filterCount = [location, minPrice, maxPrice, sort !== "newest"].filter(
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
      onSearchSubmit={runSearch}
    >
      <PageHeader
        title={city ? `Deals in ${city}` : "Nearby deals"}
        description={
          location
            ? `Pickup around ${location}. Make an offer, close on WhatsApp.`
            : "Phones, laptops, and hostel gear you can pick up."
        }
      />

      <form
        className="mb-4 md:hidden"
        onSubmit={(e) => {
          e.preventDefault();
          runSearch();
        }}
      >
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search phones, laptops, desks…"
            className="field-control pl-10"
          />
        </div>
      </form>

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
          title={`Nothing listed around ${placeLabel} yet.`}
          description="Try expanding your location, or be the first to list something nearby."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="outline" onClick={() => setFiltersOpen(true)}>
                Change location
              </Button>
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
            {total ? ` of ${total}` : ""} around {placeLabel}
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
