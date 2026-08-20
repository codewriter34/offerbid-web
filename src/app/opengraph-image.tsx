import { ImageResponse } from "next/og";

export const alt = "OfferBid — Buy and sell pre-owned in Cameroon";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #165094 0%, #2070C8 48%, #1888a0 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              background: "white",
              color: "#2070C8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              fontWeight: 800,
            }}
          >
            O
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: -0.5 }}>
            OfferBid
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -1.5,
            }}
          >
            Buy & sell pre-owned
          </div>
          <div style={{ fontSize: 28, opacity: 0.92, maxWidth: 860, lineHeight: 1.35 }}>
            Find great second-hand products or give your unused items a new home.
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 22, opacity: 0.88 }}>
          Cameroon · Douala · Yaoundé · Buea · Limbe
        </div>
      </div>
    ),
    size,
  );
}
