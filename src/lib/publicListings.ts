import { API_BASE_URL } from "@/lib/env";
import { mapListing, mapListingsPage } from "@/api/mappers";
import type { Listing, ListingsPage } from "@/types";

export async function loadPublicListing(id: string): Promise<Listing | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/listings/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const listing = mapListing(data?.listing ?? data);
    return listing.id ? listing : null;
  } catch {
    return null;
  }
}

export async function loadPublicListings(params?: {
  city?: string;
  category?: string;
  q?: string;
  page?: number;
  limit?: number;
}): Promise<ListingsPage> {
  const query = new URLSearchParams({
    status: "ACTIVE",
    page: String(params?.page ?? 1),
    limit: String(params?.limit ?? 24),
  });
  if (params?.city) query.set("city", params.city);
  if (params?.category) query.set("category", params.category);
  if (params?.q) query.set("q", params.q);

  const empty: ListingsPage = { listings: [], page: 1, limit: 24, total: 0 };
  try {
    const res = await fetch(`${API_BASE_URL}/listings?${query.toString()}`, {
      next: { revalidate: 180 },
    });
    if (!res.ok) return empty;
    return mapListingsPage(await res.json());
  } catch {
    return empty;
  }
}
