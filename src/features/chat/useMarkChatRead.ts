"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markChatRead } from "@/features/api/services";

export function useMarkChatRead(chatId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (lastMessageId?: string) => markChatRead(chatId, lastMessageId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["chat", "conversations"] });
      void qc.invalidateQueries({ queryKey: ["chat", "conversation", chatId] });
    },
  });
}
