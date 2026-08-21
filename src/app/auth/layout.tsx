import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Log in or sign up",
  description:
    "Create an OfferBid account to buy and sell pre-owned items in Cameroon.",
  path: "/auth",
  index: false,
});

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
