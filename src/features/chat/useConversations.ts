"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchConversations } from "@/features/api/services";
import { useAuthStore } from "@/stores/authStore";

export const conversationsQueryKey = (page = 1, limit = 20) =>
  ["chat", "conversations", page, limit] as const;

export function useConversations(params?: { page?: number; limit?: number }) {
  const user = useAuthStore((s) => s.user);
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;
  return useQuery({
    queryKey: conversationsQueryKey(page, limit),
    queryFn: () => fetchConversations({ page, limit }),
    enabled: Boolean(user),
  });
}

/** Sum of unread counts across the first page of conversations, for the nav badge. */
export function useUnreadChatCount() {
  const { data } = useConversations({ limit: 50 });
  return data?.conversations.reduce((sum, c) => sum + c.unreadCount, 0) ?? 0;
}
