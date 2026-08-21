import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Account",
  description: "Your OfferBid account.",
  path: "/profile",
  index: false,
});

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
