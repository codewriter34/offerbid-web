import type { Metadata } from "next";
import { API_BASE_URL } from "@/lib/env";
import ListingDetailClient from "./ListingDetailClient";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`${API_BASE_URL}/listings/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      return { title: "Listing" };
    }
    const data = await res.json();
    const listing = data?.listing ?? data;
    const title = listing?.title ?? "Listing";
    const description =
      typeof listing?.description === "string"
        ? listing.description.slice(0, 140)
        : "View this OfferBid listing";
    const image =
      Array.isArray(listing?.images) && typeof listing.images[0] === "string"
        ? listing.images[0]
        : listing?.images?.[0]?.url;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: image ? [{ url: image }] : undefined,
      },
    };
  } catch {
    return { title: "Listing" };
  }
}

export default function ListingDetailPage({ params }: Props) {
  return <ListingDetailClient params={params} />;
}
