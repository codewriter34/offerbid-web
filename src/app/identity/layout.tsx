import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Identity",
  description: "Verify your OfferBid identity.",
  path: "/identity",
  index: false,
});

export default function IdentityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
