"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchMessages } from "@/features/api/services";
import { decryptMessage } from "./decrypt";
import { useMyDeviceId } from "./useMyDeviceId";
import type { ChatMessage, MessagesPage } from "@/types";

export function messagesQueryKey(chatId: string) {
  return ["chat", "messages", chatId] as const;
}

/**
 * Cursor pagination per the API: the first page (no `before`) is the most
 * recent `limit` messages, ascending by createdAt *within* that page.
 * "Next page" here means "older messages" -- `getNextPageParam` walks
 * backward using the oldest message id of the last page fetched.
 */
export function useMessages(chatId: string) {
  const { data: myDeviceId } = useMyDeviceId();

  return useInfiniteQuery({
    queryKey: messagesQueryKey(chatId),
    enabled: Boolean(chatId && myDeviceId),
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }): Promise<MessagesPage> => {
      const page = await fetchMessages(chatId, { before: pageParam });
      const decrypted = await Promise.all(
        page.messages.map((m) => decryptMessage(m, myDeviceId as string)),
      );
      return { ...page, messages: decrypted };
    },
    getNextPageParam: (lastPage) =>
      lastPage.messages.length > 0 ? lastPage.messages[0].id : undefined,
  });
}

/** Flattens infinite-query pages (newest page first) into one chronological list. */
export function flattenMessagePages(
  pages: MessagesPage[] | undefined,
): ChatMessage[] {
  if (!pages) return [];
  return [...pages].reverse().flatMap((page) => page.messages);
}
