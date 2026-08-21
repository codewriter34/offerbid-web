import type { MetadataRoute } from "next";
import { APP_URL } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/bids",
          "/selling",
          "/profile",
          "/notifications",
          "/identity",
          "/onboarding/",
        ],
      },
    ],
    sitemap: `${APP_URL.replace(/\/$/, "")}/sitemap.xml`,
  };
}
