import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Sell unused items in Cameroon",
  description:
    "List a second-hand or unused item on OfferBid. Photos, a fair price, and a public meetup spot in Buea, Douala, Yaoundé or Limbe.",
  path: "/sell",
});

export default function SellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
