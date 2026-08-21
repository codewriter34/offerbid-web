import { Suspense } from "react";
import ExploreClient from "./ExploreClient";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Explore pre-owned deals",
  description:
    "Browse pre-owned phones, furniture, fashion, and everyday finds across Cameroon. Make a fair offer and close on WhatsApp.",
  path: "/explore",
});

export default function ExplorePage() {
  return (
    <Suspense>
      <ExploreClient />
    </Suspense>
  );
}
