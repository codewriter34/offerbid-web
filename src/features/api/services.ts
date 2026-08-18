import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import {
  mapHubs,
  mapIdentity,
  mapListings,
  mapListingsPage,
  mapListing,
  mapBids,
  mapBid,
  mapNotifications,
  unreadCountFrom,
} from "@/api/mappers";
import { extractWhatsAppUrl } from "@/api/normalize";
import { uploadFile as putUpload, type UploadPurpose } from "@/lib/uploads";
import type {
  CreateBidPayload,
  CreateListingPayload,
  CounterRespondPayload,
  RespondBidPayload,
  SubmitIdentityPayload,
} from "@/types";

export async function fetchHubs() {
  const { data } = await apiClient.get(ENDPOINTS.HUBS.LIST);
  return mapHubs(data);
}

export async function fetchListings(params: {
  page?: number;
  limit?: number;
  category?: string | null;
  city?: string | null;
  location?: string | null;
  q?: string | null;
  status?: string;
}) {
  const query: Record<string, string | number> = {
    page: params.page ?? 1,
    limit: params.limit ?? 24,
    status: params.status ?? "ACTIVE",
  };
  if (params.category) query.category = params.category;
  if (params.city) query.city = params.city;
  if (params.location) query.location = params.location;

  const q = params.q?.trim();
  if (q && q.length >= 2) {
    const { data } = await apiClient.get(ENDPOINTS.SEARCH, {
      params: { q, ...query },
    });
    return mapListingsPage(data);
  }

  const { data } = await apiClient.get(ENDPOINTS.LISTINGS.LIST, { params: query });
  return mapListingsPage(data);
}

export async function fetchListing(id: string) {
  const { data } = await apiClient.get(ENDPOINTS.LISTINGS.DETAIL(id));
  return mapListing(data?.listing ?? data);
}

export async function fetchMyListings() {
  const { data } = await apiClient.get(ENDPOINTS.LISTINGS.MY_LISTINGS);
  return mapListings(data);
}

export async function createListing(payload: CreateListingPayload) {
  const { data } = await apiClient.post(ENDPOINTS.LISTINGS.CREATE, payload);
  return mapListing(data?.listing ?? data);
}

export async function updateListingStatus(
  id: string,
  status: "ACTIVE" | "SOLD" | "CLOSED",
) {
  const { data } = await apiClient.patch(ENDPOINTS.LISTINGS.STATUS(id), {
    status,
  });
  return mapListing(data?.listing ?? data);
}

export async function contactSeller(id: string) {
  const { data } = await apiClient.post(ENDPOINTS.LISTINGS.CONTACT(id));
  return extractWhatsAppUrl(data);
}

export async function reportListing(listingId: string, reason: string) {
  await apiClient.post(ENDPOINTS.REPORTS, { listingId, reason });
}

export async function createBid(payload: CreateBidPayload) {
  const { data } = await apiClient.post(ENDPOINTS.BIDS.CREATE, payload);
  return mapBid(data?.bid ?? data);
}

export async function fetchMyBids() {
  const { data } = await apiClient.get(ENDPOINTS.BIDS.MY_BIDS);
  return mapBids(data);
}

export async function fetchListingBids(listingId: string) {
  const { data } = await apiClient.get(ENDPOINTS.BIDS.LISTING_BIDS(listingId));
  return mapBids(data);
}

export async function respondToBid(bidId: string, payload: RespondBidPayload) {
  const { data } = await apiClient.patch(ENDPOINTS.BIDS.RESPOND(bidId), payload);
  return mapBid(data?.bid ?? data);
}

export async function counterRespond(
  bidId: string,
  payload: CounterRespondPayload,
) {
  const { data } = await apiClient.patch(
    ENDPOINTS.BIDS.COUNTER_RESPOND(bidId),
    payload,
  );
  return mapBid(data?.bid ?? data);
}

export async function fetchNotifications() {
  const { data } = await apiClient.get(ENDPOINTS.NOTIFICATIONS.LIST);
  const notifications = mapNotifications(data);
  return {
    notifications,
    unreadCount: unreadCountFrom(data, notifications),
  };
}

export async function markNotificationRead(id: string) {
  await apiClient.patch(ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
}

export async function markAllNotificationsRead() {
  await apiClient.patch(ENDPOINTS.NOTIFICATIONS.READ_ALL);
}

export async function fetchIdentity() {
  const { data } = await apiClient.get(ENDPOINTS.IDENTITY.ME);
  return mapIdentity(data?.identity ?? data);
}

export async function submitIdentity(payload: SubmitIdentityPayload) {
  const { data } = await apiClient.post(ENDPOINTS.IDENTITY.SUBMIT, payload);
  return mapIdentity(data?.identity ?? data);
}

export async function uploadFile(file: File, purpose: UploadPurpose) {
  return putUpload(file, purpose);
}
