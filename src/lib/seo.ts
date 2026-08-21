import type { Metadata } from "next";
import { APP_URL } from "@/lib/env";

export const SITE_NAME = "OfferBid";
export const SITE_TAGLINE = "Buy & sell pre-owned";
export const SITE_DESCRIPTION =
  "Buy and sell pre-owned in Cameroon. Find great second-hand products or give your unused items a new home. Make a fair offer and close on WhatsApp.";
export const SITE_KEYWORDS = [
  "OfferBid",
  "pre-owned Cameroon",
  "second-hand Cameroon",
  "buy used Cameroon",
  "sell used Cameroon",
  "Douala marketplace",
  "Yaoundé marketplace",
  "Buea marketplace",
  "Limbe marketplace",
  "WhatsApp deals",
];

export function absoluteUrl(path = "/") {
  const base = APP_URL.replace(/\/$/, "");
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function pageMetadata({
  title,
  description,
  path,
  image,
  index = true,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  index?: boolean;
  type?: "website" | "article";
}): Metadata {
  const url = absoluteUrl(path);
  const ogImage = image ? [{ url: image }] : undefined;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: index
      ? { index: true, follow: true }
      : { index: false, follow: false, nocache: true },
    openGraph: {
      type,
      url,
      siteName: SITE_NAME,
      title: `${title} · ${SITE_NAME}`,
      description,
      locale: "en_CM",
      images: ogImage,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · ${SITE_NAME}`,
      description,
      images: image ? [image] : undefined,
    },
  };
}
