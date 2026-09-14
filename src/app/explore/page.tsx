import { Suspense } from "react";
import ExploreClient from "./ExploreClient";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Second-hand items for sale in Cameroon",
  description:
    "Browse used phones, laptops, furniture, fashion and everyday finds across Buea, Douala, Yaoundé and Limbe. Search any item and make a fair offer on OfferBid.",
  path: "/explore",
  keywords: [
    "second hand items for sale Cameroon",
    "used laptop Cameroon",
    "used phones Cameroon",
    "furniture for sale Cameroon",
    "OfferBid explore",
  ],
});

export default function ExplorePage() {
  return (
    <Suspense>
      <ExploreClient />
    </Suspense>
  );
}
