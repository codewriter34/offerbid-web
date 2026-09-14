import { notFound } from "next/navigation";
import Link from "next/link";
import { MarketingShell } from "@/components/layout/Shells";
import { ListingTile } from "@/components/listings/ListingTile";
import { JsonLd } from "@/components/seo/JsonLd";
import { SeoFaq } from "@/components/seo/SeoFaq";
import { loadPublicListings } from "@/lib/publicListings";
import {
  CAMEROON_HUBS,
  breadcrumbJsonLd,
  hubBySlug,
  itemListJsonLd,
  pageMetadata,
} from "@/lib/seo";

type Props = { params: Promise<{ city: string }> };

export function generateStaticParams() {
  return CAMEROON_HUBS.map((hub) => ({ city: hub.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { city: slug } = await params;
  const hub = hubBySlug(slug);
  if (!hub) {
    return pageMetadata({
      title: "Second-hand items in Cameroon",
      description:
        "Buy and sell unused and second-hand items on OfferBid, Cameroon’s local marketplace.",
      path: "/second-hand",
      index: false,
    });
  }
  return pageMetadata({
    title: `Second-hand items for sale in ${hub.name}, Cameroon`,
    description: `Buy used and unused items in ${hub.name} on OfferBid. Phones, laptops, furniture, fashion and more around ${hub.places}. Make an offer and meet locally.`,
    path: `/second-hand/${hub.slug}`,
    keywords: [
      `second hand ${hub.name}`,
      `used items ${hub.name}`,
      `unused items ${hub.name} Cameroon`,
      `${hub.name} marketplace`,
      `laptop for sale ${hub.name}`,
      `phones for sale ${hub.name}`,
      "OfferBid",
    ],
  });
}

export default async function SecondHandCityPage({ params }: Props) {
  const { city: slug } = await params;
  const hub = hubBySlug(slug);
  if (!hub) notFound();

  const { listings } = await loadPublicListings({
    city: hub.name,
    limit: 24,
  });

  return (
    <MarketingShell>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Second-hand Cameroon", path: "/second-hand" },
          { name: hub.name, path: `/second-hand/${hub.slug}` },
        ])}
      />
      <JsonLd
        data={itemListJsonLd(
          `Second-hand items in ${hub.name}`,
          listings,
          `/second-hand/${hub.slug}`,
        )}
      />
      <article className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
        <p className="text-sm font-semibold text-primary">
          Second-hand · {hub.name}, Cameroon
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-ink md:text-5xl">
          Second-hand items for sale in {hub.name}
        </h1>
        <p className="mt-4 max-w-2xl text-ink-secondary">
          OfferBid is the local marketplace for unused and pre-owned products in{" "}
          {hub.name} — including {hub.places}. Search laptops, phones, furniture,
          and campus finds, send a fair offer, then meet in public.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/explore?city=${encodeURIComponent(hub.name)}`}
            className="inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-bold text-white hover:bg-primary-hover"
          >
            Browse {hub.name} deals
          </Link>
          <Link
            href="/auth?next=/sell"
            className="inline-flex h-11 items-center rounded-md border border-border bg-surface px-5 text-sm font-bold text-ink hover:border-primary/40"
          >
            Sell in {hub.name}
          </Link>
        </div>

        {listings.length ? (
          <div className="mt-12">
            <h2 className="font-display text-2xl font-bold text-ink">
              Live second-hand listings in {hub.name}
            </h2>
            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {listings.map((listing) => (
                <ListingTile key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        ) : (
          <p className="mt-12 text-sm text-ink-secondary">
            No live listings in {hub.name} right now.{" "}
            <Link href="/explore" className="font-semibold text-primary">
              See all Cameroon deals
            </Link>{" "}
            or be the first to sell nearby.
          </p>
        )}
      </article>
      <SeoFaq title={`Buying used items in ${hub.name}`} />
    </MarketingShell>
  );
}
