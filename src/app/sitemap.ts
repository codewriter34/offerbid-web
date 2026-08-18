import type { MetadataRoute } from "next";
import { APP_URL } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    "/",
    "/explore",
    "/auth",
    "/sell",
    "/safety",
    "/terms",
    "/privacy",
  ].map((path) => ({
    url: `${APP_URL}${path}`,
    lastModified: now,
  }));
}
