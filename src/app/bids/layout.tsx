import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "My bids",
  description: "Track your OfferBid offers.",
  path: "/bids",
  index: false,
});

export default function BidsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
