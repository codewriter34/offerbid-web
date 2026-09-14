import type { MetadataRoute } from "next";
import { APP_URL } from "@/lib/env";
import { CAMEROON_HUBS } from "@/lib/seo";
import { loadPublicListings } from "@/lib/publicListings";

const PUBLIC_PATHS = [
  "/",
  "/explore",
  "/second-hand",
  "/sell",
  "/safety",
  "/terms",
  "/privacy",
];

async function listingUrls(): Promise<MetadataRoute.Sitemap> {
  const urls: MetadataRoute.Sitemap = [];
  try {
    for (let page = 1; page <= 5; page += 1) {
      const data = await loadPublicListings({ page, limit: 100 });
      for (const listing of data.listings) {
        if (!listing.id) continue;
        urls.push({
          url: `${APP_URL.replace(/\/$/, "")}/listings/${listing.id}`,
          lastModified: listing.createdAt
            ? new Date(listing.createdAt)
            : new Date(),
          changeFrequency: "daily",
          priority: 0.8,
        });
      }
      if (data.listings.length < data.limit || urls.length >= data.total) {
        break;
      }
    }
  } catch {
    return urls;
  }
  return urls;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const origin = APP_URL.replace(/\/$/, "");
  const pages: MetadataRoute.Sitemap = PUBLIC_PATHS.map((path) => ({
    url: `${origin}${path === "/" ? "" : path}`,
    lastModified: now,
    changeFrequency: path === "/" || path === "/explore" ? "daily" : "weekly",
    priority:
      path === "/" ? 1 : path === "/explore" || path === "/second-hand" ? 0.9 : 0.5,
  }));
  const cities: MetadataRoute.Sitemap = CAMEROON_HUBS.map((hub) => ({
    url: `${origin}/second-hand/${hub.slug}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.85,
  }));
  return [...pages, ...cities, ...(await listingUrls())];
}
