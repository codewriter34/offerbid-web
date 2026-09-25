"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchConversation } from "@/features/api/services";

export function useConversation(chatId: string) {
  return useQuery({
    queryKey: ["chat", "conversation", chatId],
    queryFn: () => fetchConversation(chatId),
    enabled: Boolean(chatId),
  });
}
