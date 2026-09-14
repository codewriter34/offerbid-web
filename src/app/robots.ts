import type { MetadataRoute } from "next";
import { APP_URL } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const sitemap = `${APP_URL.replace(/\/$/, "")}/sitemap.xml`;
  const aiAgents = [
    "GPTBot",
    "ChatGPT-User",
    "Google-Extended",
    "PerplexityBot",
    "ClaudeBot",
    "Applebot",
    "Bingbot",
  ];

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
          "/auth",
        ],
      },
      ...aiAgents.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: [
          "/bids",
          "/selling",
          "/profile",
          "/notifications",
          "/identity",
          "/onboarding/",
          "/auth",
        ],
      })),
    ],
    sitemap,
    host: APP_URL.replace(/\/$/, ""),
  };
}
