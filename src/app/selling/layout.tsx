import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Selling",
  description: "Manage your OfferBid listings.",
  path: "/selling",
  index: false,
});

export default function SellingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
