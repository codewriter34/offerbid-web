import type { Metadata } from "next";
import { API_BASE_URL } from "@/lib/env";
import { pageMetadata } from "@/lib/seo";
import ListingDetailClient from "./ListingDetailClient";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const fallback = pageMetadata({
    title: "Listing",
    description: "View this pre-owned listing on OfferBid.",
    path: `/listings/${id}`,
  });

  try {
    const res = await fetch(`${API_BASE_URL}/listings/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return fallback;
    const data = await res.json();
    const listing = data?.listing ?? data;
    const title = listing?.title ?? "Listing";
    const description =
      typeof listing?.description === "string"
        ? listing.description.slice(0, 160)
        : "View this pre-owned listing on OfferBid.";
    const image =
      Array.isArray(listing?.images) && typeof listing.images[0] === "string"
        ? listing.images[0]
        : listing?.images?.[0]?.url;

    return {
      ...pageMetadata({
        title,
        description,
        path: `/listings/${id}`,
        image,
        type: "article",
      }),
    };
  } catch {
    return fallback;
  }
}

export default function ListingDetailPage({ params }: Props) {
  return <ListingDetailClient params={params} />;
}
