import Link from "next/link";
import { MarketingShell } from "@/components/layout/Shells";
import { JsonLd } from "@/components/seo/JsonLd";
import { SeoFaq } from "@/components/seo/SeoFaq";
import {
  CAMEROON_HUBS,
  breadcrumbJsonLd,
  pageMetadata,
} from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Buy and sell second-hand items in Cameroon",
  description:
    "OfferBid is Cameroon’s #1 marketplace for unused and second-hand items. Find used laptops, phones, furniture and fashion in Buea, Douala, Yaoundé and Limbe. Make an offer and meet locally.",
  path: "/second-hand",
  keywords: [
    "where to buy second hand items in Cameroon",
    "second hand Cameroon",
    "unused items Cameroon",
    "sell unused items Cameroon",
    "used laptop Cameroon",
    "used phones Cameroon",
    "OfferBid",
  ],
});

export default function SecondHandPage() {
  return (
    <MarketingShell>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Second-hand Cameroon", path: "/second-hand" },
        ])}
      />
      <article className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
        <p className="text-sm font-semibold text-primary">
          Cameroon · Second-hand marketplace
        </p>
        <h1 className="mt-2 max-w-4xl font-display text-3xl font-bold text-ink md:text-5xl">
          Where to buy and sell second-hand items in Cameroon
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-ink-secondary">
          OfferBid is the structured alternative to chaotic WhatsApp groups and
          Facebook posts. List unused items, search live deals near you, and
          close in person — cash or MoMo.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/explore"
            className="inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-bold text-white hover:bg-primary-hover"
          >
            Search items for sale
          </Link>
          <Link
            href="/auth?next=/sell"
            className="inline-flex h-11 items-center rounded-md border border-border px-5 text-sm font-bold text-ink"
          >
            Sell an unused item
          </Link>
        </div>

        <h2 className="mt-14 font-display text-2xl font-bold text-ink">
          Second-hand hubs in Cameroon
        </h2>
        <p className="mt-2 max-w-2xl text-ink-secondary">
          Start where you live. Each hub shows unused and pre-owned listings
          you can actually pick up.
        </p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {CAMEROON_HUBS.map((hub) => (
            <li key={hub.slug}>
              <Link
                href={`/second-hand/${hub.slug}`}
                className="block rounded-md border border-border bg-surface p-5 transition hover:border-primary/40"
              >
                <h3 className="font-display text-xl font-bold text-ink">
                  {hub.name}
                </h3>
                <p className="mt-1 text-sm text-ink-secondary">{hub.places}</p>
                <p className="mt-3 text-sm font-semibold text-primary">
                  Second-hand items in {hub.name} →
                </p>
              </Link>
            </li>
          ))}
        </ul>

        <h2 className="mt-14 font-display text-2xl font-bold text-ink">
          Search an item — like a laptop for sale
        </h2>
        <p className="mt-2 max-w-2xl text-ink-secondary">
          Type what you want on Explore. If someone listed a used laptop, phone,
          sofa, or bike on OfferBid, that listing has its own page Google and
          ChatGPT can find — title, price, neighborhood, and photos included.
        </p>
        <p className="mt-4">
          <Link href="/explore?q=laptop" className="font-semibold text-primary">
            Search laptops for sale →
          </Link>
        </p>
      </article>
      <SeoFaq />
    </MarketingShell>
  );
}
