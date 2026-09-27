import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

const ANON_KEY = "offerbid_anonymous_id";

let pingStarted = false;

export function getAnonymousId(): string | null {
  if (typeof window === "undefined") return null;
  let anonymousId = localStorage.getItem(ANON_KEY);
  if (!anonymousId) {
    anonymousId = crypto.randomUUID();
    localStorage.setItem(ANON_KEY, anonymousId);
  }
  return anonymousId;
}

/** Fire-and-forget web visit. Must not block rendering. */
export function recordAnalyticsSession() {
  if (typeof window === "undefined" || pingStarted) return;
  pingStarted = true;

  const anonymousId = getAnonymousId();
  if (!anonymousId) return;

  void apiClient
    .post(
      ENDPOINTS.ANALYTICS.SESSION,
      { platform: "WEB", anonymousId },
      {
        skipAuthRefresh: true,
        headers: { "X-Client-Platform": "WEB" },
      },
    )
    .catch(() => {
      // Guests and expired tokens must not break the page.
    });
}