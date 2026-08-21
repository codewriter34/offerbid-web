function stripTrailingSlash(url: string) {
  return url.replace(/\/$/, "");
}

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://offerbid-api.onrender.com/api/v1";

export const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ??
  "wss://offerbid-api.onrender.com/realtime";

export const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

/** Canonical public origin. Netlify sets `URL` at build/runtime. */
export const APP_URL = stripTrailingSlash(
  process.env.NEXT_PUBLIC_APP_URL ??
    process.env.URL ??
    "http://localhost:3001",
);

export const MAX_ACTIVE_LISTINGS_UNVERIFIED = 3;
export const MAX_ACTIVE_LISTINGS_VERIFIED = 10;
export const MAX_ACTIVE_BIDS_PER_ITEM = 3;
export const MAX_LISTING_IMAGES = 4;

export const COUNTRY_OPTIONS = [
  { country: "CAMEROON" as const, label: "Cameroon", countryCode: "+237", flag: "🇨🇲" },
  { country: "NIGERIA" as const, label: "Nigeria", countryCode: "+234", flag: "🇳🇬" },
];

export function countryFlag(country: string): string {
  return (
    COUNTRY_OPTIONS.find((option) => option.country === country)?.flag ?? "🌍"
  );
}

export function countryLabel(country: string): string {
  return (
    COUNTRY_OPTIONS.find((option) => option.country === country)?.label ??
    country
  );
}
