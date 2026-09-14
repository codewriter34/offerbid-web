import type { Metadata } from "next";
import type { Listing } from "@/types";
import { ANDROID_APP_URL, APP_URL } from "@/lib/env";
import { formatPrice } from "@/lib/formatters";

export const SITE_NAME = "OfferBid";
export const SITE_TAGLINE = "Cameroon’s second-hand marketplace";
export const SITE_DESCRIPTION =
  "OfferBid is Cameroon’s marketplace for second-hand and unused items. Buy and sell used phones, laptops, furniture, fashion, and campus finds in Buea, Douala, Yaoundé, and Limbe. Make a fair offer, meet in public, pay cash or MoMo.";
export const SITE_KEYWORDS = [
  "OfferBid",
  "second hand Cameroon",
  "second-hand items Cameroon",
  "used items Cameroon",
  "unused items Cameroon",
  "buy second hand Cameroon",
  "sell unused items Cameroon",
  "used laptop for sale Cameroon",
  "used phones Cameroon",
  "second hand Buea",
  "second hand Douala",
  "second hand Yaoundé",
  "second hand Limbe",
  "pre-owned marketplace Cameroon",
  "Jiji Cameroon alternative",
  "WhatsApp marketplace Cameroon",
];

export const CAMEROON_HUBS = [
  {
    slug: "buea",
    name: "Buea",
    places: "Molyko, Mile 17, Clerks Quarter, UB, Sandpit",
  },
  {
    slug: "douala",
    name: "Douala",
    places: "Akwa, Bonanjo, Bonapriso, Makepe",
  },
  {
    slug: "yaounde",
    name: "Yaoundé",
    places: "Bastos, Nlongkak, Melen, Biyem-Assi",
  },
  {
    slug: "limbe",
    name: "Limbe",
    places: "Down Beach, Church Street, Mile 4",
  },
] as const;

export const SITE_FAQS: Array<{ question: string; answer: string }> = [
  {
    question: "Where can I buy second-hand items in Cameroon?",
    answer:
      "OfferBid is Cameroon’s marketplace for second-hand and unused items. Browse live listings in Buea, Douala, Yaoundé, and Limbe, make an offer, then meet the seller in public to inspect and pay cash or MoMo.",
  },
  {
    question: "How do I sell unused items in Cameroon on OfferBid?",
    answer:
      "Create a free account, pick your hub, then list photos, a price, and a pickup neighborhood. Buyers send offers. You accept, reject, or counter. When you agree, you continue on WhatsApp and meet in person.",
  },
  {
    question: "What can I buy on OfferBid?",
    answer:
      "Used phones, laptops, furniture, fashion, campus essentials, vehicles, and everyday household items listed by people nearby. Search an item — for example a laptop for sale in Buea — and open the listing on OfferBid.",
  },
  {
    question: "Is OfferBid available outside Buea?",
    answer:
      "Yes. OfferBid is live across Cameroon, with active hubs in Buea, Douala, Yaoundé, and Limbe, and Nigeria next. Listings are hyper-local so you collect nearby.",
  },
  {
    question: "Does OfferBid charge a fee?",
    answer:
      "Buying, selling, and making offers is free. After a deal is accepted you meet in person. OfferBid does not process payments in the app.",
  },
];

export function absoluteUrl(path = "/") {
  const base = APP_URL.replace(/\/$/, "");
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function hubBySlug(slug: string) {
  return CAMEROON_HUBS.find(
    (hub) => hub.slug === slug.trim().toLowerCase(),
  );
}

export function hubPathForCity(city: string | null | undefined) {
  if (!city) return null;
  const needle = city
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
  const hub = CAMEROON_HUBS.find(
    (item) =>
      item.slug === needle ||
      item.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase() === needle,
  );
  return hub ? `/second-hand/${hub.slug}` : null;
}

export function listingPlace(listing: Pick<Listing, "location" | "city">) {
  return [listing.location, listing.city].filter(Boolean).join(", ");
}

export function listingSeoTitle(listing: Listing) {
  const place = listingPlace(listing);
  if (place) return `${listing.title} for sale in ${place}`;
  return `${listing.title} for sale in Cameroon`;
}

export function listingSeoDescription(listing: Listing) {
  const price = formatPrice(listing.askingPrice, listing.currency);
  const place = listingPlace(listing) || "Cameroon";
  const category = listing.category || "item";
  const snippet =
    listing.description?.replace(/\s+/g, " ").trim().slice(0, 110) ||
    `Second-hand ${category.toLowerCase()} listed on OfferBid.`;
  return `${listing.title} — ${price}. ${snippet} Buy this used ${category.toLowerCase()} in ${place}. Make an offer on OfferBid.`;
}

export function listingJsonLd(listing: Listing) {
  const url = absoluteUrl(`/listings/${listing.id}`);
  const images = listing.images.map((image) => image.url).filter(Boolean);
  const place = listingPlace(listing);
  const availability =
    listing.status === "ACTIVE"
      ? "https://schema.org/InStock"
      : "https://schema.org/SoldOut";

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.title,
    description: listingSeoDescription(listing),
    image: images.length ? images : [absoluteUrl("/logo-mark.png")],
    sku: listing.id,
    category: listing.category,
    brand: { "@type": "Brand", name: SITE_NAME },
    itemCondition: "https://schema.org/UsedCondition",
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: listing.currency || "XAF",
      price: listing.askingPrice,
      availability,
      itemCondition: "https://schema.org/UsedCondition",
      areaServed: listing.city
        ? { "@type": "City", name: listing.city, containedInPlace: "Cameroon" }
        : { "@type": "Country", name: "Cameroon" },
    },
    ...(place
      ? {
          additionalProperty: {
            "@type": "PropertyValue",
            name: "Pickup location",
            value: place,
          },
        }
      : {}),
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "OnlineBusiness"],
    name: SITE_NAME,
    url: absoluteUrl(),
    logo: absoluteUrl("/logo-mark.png"),
    image: absoluteUrl("/logo-mark.png"),
    slogan: SITE_TAGLINE,
    description: SITE_DESCRIPTION,
    email: "elishawamba61@gmail.com",
    telephone: "+237681423158",
    foundingLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressCountry: "CM",
        addressLocality: "Buea",
      },
    },
    areaServed: [
      { "@type": "Country", name: "Cameroon" },
      ...CAMEROON_HUBS.map((hub) => ({
        "@type": "City",
        name: hub.name,
      })),
    ],
    knowsAbout: [
      "second-hand marketplace Cameroon",
      "used items Cameroon",
      "unused items for sale",
      "hyper-local classifieds",
    ],
    sameAs: [ANDROID_APP_URL],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+237681423158",
      contactType: "customer support",
      areaServed: "CM",
      availableLanguage: ["en"],
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: absoluteUrl(),
    description: SITE_DESCRIPTION,
    inLanguage: "en-CM",
    publisher: { "@type": "Organization", name: SITE_NAME },
    potentialAction: {
      "@type": "SearchAction",
      target: `${absoluteUrl("/explore")}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function faqJsonLd(faqs = SITE_FAQS) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

export function breadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function itemListJsonLd(
  name: string,
  listings: Listing[],
  path: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    url: absoluteUrl(path),
    numberOfItems: listings.length,
    itemListElement: listings.map((listing, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/listings/${listing.id}`),
      name: listingSeoTitle(listing),
    })),
  };
}

export function pageMetadata({
  title,
  description,
  path,
  image,
  index = true,
  type = "website",
  keywords,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  index?: boolean;
  type?: "website" | "article";
  keywords?: string[];
}): Metadata {
  const url = absoluteUrl(path);
  const ogImage = image ? [{ url: image }] : undefined;
  return {
    title,
    description,
    keywords: keywords ?? SITE_KEYWORDS,
    alternates: { canonical: url },
    robots: index
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        }
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
