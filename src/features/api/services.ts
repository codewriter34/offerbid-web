import axios from "axios";
import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import { getAccessToken } from "@/lib/tokenStorage";
import {
  mapHubs,
  mapIdentity,
  mapListings,
  mapListingsPage,
  mapListing,
  mapBids,
  mapBid,
  mapNotifications,
  mapConversation,
  mapConversationsPage,
  mapMessagesPage,
  unreadCountFrom,
} from "@/api/mappers";
import { extractWhatsAppUrl } from "@/api/normalize";
import { uploadFile as putUpload, type UploadPurpose } from "@/lib/uploads";
import type {
  CreateBidPayload,
  CreateListingPayload,
  CounterRespondPayload,
  MessageEnvelope,
  OwnKeysResponse,
  PeerKeysResponse,
  RespondBidPayload,
  SendMessageResult,
  SubmitIdentityPayload,
  UploadKeysPayload,
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
  const post = (skipAuthHeader: boolean) =>
    apiClient.post(ENDPOINTS.LISTINGS.CONTACT(id), undefined, {
      skipAuthRefresh: true,
      skipAuthHeader,
    });

  const hasToken = Boolean(getAccessToken());
  try {
    const { data } = await post(!hasToken);
    return extractWhatsAppUrl(data);
  } catch (error) {
    if (hasToken && axios.isAxiosError(error) && error.response?.status === 401) {
      const { data } = await post(true);
      return extractWhatsAppUrl(data);
    }
    throw error;
  }
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

// ---- Chat ----

export async function fetchConversations(
  params: { page?: number; limit?: number } = {},
) {
  const { data } = await apiClient.get(ENDPOINTS.CHATS.LIST, {
    params: { page: params.page ?? 1, limit: params.limit ?? 20 },
  });
  return mapConversationsPage(data);
}

export async function fetchConversation(id: string) {
  const { data } = await apiClient.get(ENDPOINTS.CHATS.DETAIL(id));
  return mapConversation(data);
}

export async function createConversation(listingId: string) {
  const { data } = await apiClient.post(ENDPOINTS.CHATS.CREATE, { listingId });
  return mapConversation(data);
}

export async function fetchMessages(
  chatId: string,
  params: { before?: string; limit?: number } = {},
) {
  const { data } = await apiClient.get(ENDPOINTS.CHATS.MESSAGES(chatId), {
    params: { limit: params.limit ?? 30, before: params.before },
  });
  return mapMessagesPage(data);
}

export async function sendChatMessage(
  chatId: string,
  payload: { senderDeviceId: string; envelopes: MessageEnvelope[] },
): Promise<SendMessageResult> {
  const { data } = await apiClient.post(ENDPOINTS.CHATS.MESSAGES(chatId), payload);
  return data as SendMessageResult;
}

export async function markChatRead(chatId: string, lastMessageId?: string) {
  const { data } = await apiClient.patch(
    ENDPOINTS.CHATS.READ(chatId),
    lastMessageId ? { lastMessageId } : {},
  );
  return data as { conversationId: string; unreadCount: number };
}

export async function uploadChatKeys(payload: UploadKeysPayload) {
  const { data } = await apiClient.post(ENDPOINTS.CHATS.KEYS_UPLOAD, payload);
  return data as {
    deviceId: string;
    registrationId: number;
    identityKey: string;
    signedPreKeyId: number;
    oneTimePreKeyCount: number;
  };
}

export async function fetchMyChatDevices(): Promise<OwnKeysResponse> {
  const { data } = await apiClient.get(ENDPOINTS.CHATS.KEYS_ME);
  return data as OwnKeysResponse;
}

export async function fetchPeerChatKeys(
  peerUserId: string,
): Promise<PeerKeysResponse> {
  const { data } = await apiClient.get(ENDPOINTS.CHATS.KEYS_PEER(peerUserId));
  return data as PeerKeysResponse;
}
