import type { MetadataRoute } from "next";
import { API_BASE_URL, APP_URL } from "@/lib/env";

const PUBLIC_PATHS = [
  "/",
  "/explore",
  "/sell",
  "/safety",
  "/terms",
  "/privacy",
];

async function listingUrls(): Promise<MetadataRoute.Sitemap> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/listings?limit=100&status=ACTIVE`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return [];
    const data = await res.json();
    const listings: Array<{ id?: string; updatedAt?: string }> = Array.isArray(
      data,
    )
      ? data
      : (data?.listings ?? data?.data ?? []);
    return listings
      .filter((listing) => listing?.id)
      .map((listing) => ({
        url: `${APP_URL.replace(/\/$/, "")}/listings/${listing.id}`,
        lastModified: listing.updatedAt
          ? new Date(listing.updatedAt)
          : new Date(),
        changeFrequency: "daily" as const,
        priority: 0.7,
      }));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const pages: MetadataRoute.Sitemap = PUBLIC_PATHS.map((path) => ({
    url: `${APP_URL.replace(/\/$/, "")}${path === "/" ? "" : path}`,
    lastModified: now,
    changeFrequency: path === "/" || path === "/explore" ? "daily" : "weekly",
    priority: path === "/" ? 1 : path === "/explore" ? 0.9 : 0.5,
  }));
  return [...pages, ...(await listingUrls())];
}
