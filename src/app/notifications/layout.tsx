import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Notifications",
  description: "Your OfferBid inbox.",
  path: "/notifications",
  index: false,
});

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
