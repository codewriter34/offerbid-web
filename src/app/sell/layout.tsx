import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Sell an item",
  description:
    "List a pre-owned item on OfferBid. Photos, a fair price, and a public meetup spot.",
  path: "/sell",
});

export default function SellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
