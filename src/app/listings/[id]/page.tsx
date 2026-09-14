import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { loadPublicListing } from "@/lib/publicListings";
import {
  breadcrumbJsonLd,
  hubPathForCity,
  listingJsonLd,
  listingSeoDescription,
  listingSeoTitle,
  listingPlace,
  pageMetadata,
} from "@/lib/seo";
import ListingDetailClient from "./ListingDetailClient";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const fallback = pageMetadata({
    title: "Second-hand item for sale in Cameroon",
    description:
      "View this unused or pre-owned listing on OfferBid, Cameroon’s second-hand marketplace.",
    path: `/listings/${id}`,
  });

  const listing = await loadPublicListing(id);
  if (!listing) return fallback;

  const place = listingPlace(listing);
  return pageMetadata({
    title: listingSeoTitle(listing),
    description: listingSeoDescription(listing),
    path: `/listings/${id}`,
    image: listing.images[0]?.url,
    type: "article",
    keywords: [
      listing.title,
      `${listing.title} for sale`,
      listing.category,
      place,
      listing.city ? `second hand ${listing.city}` : "second hand Cameroon",
      listing.city ? `used ${listing.category} ${listing.city}` : "",
      "OfferBid",
      "Cameroon",
    ].filter((value): value is string => Boolean(value)),
  });
}

export default async function ListingDetailPage({ params }: Props) {
  const { id } = await params;
  const listing = await loadPublicListing(id);

  return (
    <>
      {listing ? (
        <>
          <JsonLd
            data={breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Explore", path: "/explore" },
              ...(hubPathForCity(listing.city)
                ? [
                    {
                      name: listing.city as string,
                      path: hubPathForCity(listing.city) as string,
                    },
                  ]
                : []),
              { name: listing.title, path: `/listings/${listing.id}` },
            ])}
          />
          <JsonLd data={listingJsonLd(listing)} />
        </>
      ) : null}
      <ListingDetailClient params={params} />
    </>
  );
}
