import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Choose your hub",
  description: "Pick the city you sell from on OfferBid.",
  path: "/onboarding/hub",
  index: false,
});

export default function HubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
