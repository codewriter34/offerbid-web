import { ImageResponse } from "next/og";
import { API_BASE_URL } from "@/lib/env";

export const alt = "OfferBid listing";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ id: string }> };

async function loadListing(id: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/listings/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.listing ?? data;
  } catch {
    return null;
  }
}

export default async function ListingOpenGraphImage({ params }: Props) {
  const { id } = await params;
  const listing = await loadListing(id);
  const title = listing?.title ?? "Pre-owned listing";
  const price = listing?.askingPrice
    ? `${listing.currency ?? "XAF"} ${Number(listing.askingPrice).toLocaleString()}`
    : "Make an offer";
  const place = listing?.location ?? listing?.city ?? "Cameroon";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(135deg, #165094 0%, #2070C8 55%, #1888a0 100%)",
          color: "white",
          fontFamily: "sans-serif",
          padding: 72,
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div style={{ fontSize: 28, fontWeight: 700 }}>OfferBid</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 58,
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: -1,
            }}
          >
            {String(title).slice(0, 80)}
          </div>
          <div style={{ fontSize: 32, opacity: 0.92 }}>{price}</div>
        </div>
        <div style={{ fontSize: 24, opacity: 0.85 }}>{place} · Buy & sell pre-owned</div>
      </div>
    ),
    size,
  );
}
