import { Suspense } from "react";
import type { Metadata } from "next";
import ExploreClient from "./ExploreClient";

export const metadata: Metadata = {
  title: "Explore",
  description:
    "Browse hyper-local second-hand deals near your campus hub on OfferBid.",
};

export default function ExplorePage() {
  return (
    <Suspense>
      <ExploreClient />
    </Suspense>
  );
}
