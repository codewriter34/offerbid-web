import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "OfferBid",
    short_name: "OfferBid",
    description:
      "Buy and sell pre-owned in Cameroon. Fair offers, close on WhatsApp.",
    start_url: "/",
    display: "standalone",
    background_color: "#eef3f8",
    theme_color: "#2070C8",
    lang: "en",
    icons: [
      { src: "/logo-mark.png", sizes: "192x192", type: "image/png" },
      { src: "/logo-mark.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
