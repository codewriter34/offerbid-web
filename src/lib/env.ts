export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://offerbid-api.onrender.com/api/v1";

export const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ??
  "wss://offerbid-api.onrender.com/realtime";

export const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const MAX_ACTIVE_LISTINGS_UNVERIFIED = 3;
export const MAX_ACTIVE_LISTINGS_VERIFIED = 10;
export const MAX_ACTIVE_BIDS_PER_ITEM = 3;
export const MAX_LISTING_IMAGES = 4;

export const COUNTRY_OPTIONS = [
  { country: "CAMEROON" as const, label: "Cameroon", countryCode: "+237" },
  { country: "NIGERIA" as const, label: "Nigeria", countryCode: "+234" },
];
