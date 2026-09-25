"use client";

import { useEffect } from "react";
import type { InfiniteData } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import {
  connectSocket,
  subscribeToConversation,
  unsubscribeFromConversation,
} from "@/lib/socket";
import { decryptMessage } from "./decrypt";
import { messagesQueryKey } from "./useMessages";
import type { ChatMessage, MessagesPage } from "@/types";

/**
 * Subscribes to live `chat:message` events for one conversation while
 * mounted (i.e. while the thread is open), decrypts each inbound envelope
 * addressed to this device, and appends it to the messages cache -- deduped
 * by id, since a message can also arrive here even if it was already loaded
 * via the initial GET (e.g. a race on mount).
 */
export function useChatThreadRealtime(
  chatId: string,
  myDeviceId: string | undefined,
) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!chatId || !myDeviceId) return;
    const socket = connectSocket();
    if (!socket) return;

    subscribeToConversation(chatId);

    const onMessage = async (raw: ChatMessage) => {
      if (raw.conversationId !== chatId) return;
      const decrypted = await decryptMessage(raw, myDeviceId);

      qc.setQueryData<InfiniteData<MessagesPage, string | undefined>>(
        messagesQueryKey(chatId),
        (data) => {
          if (!data) {
            return { pages: [{ messages: [decrypted], limit: 30 }], pageParams: [undefined] };
          }
          const pages = [...data.pages];
          const newest = pages[0];
          if (newest.messages.some((m) => m.id === decrypted.id)) {
            return data;
          }
          pages[0] = { ...newest, messages: [...newest.messages, decrypted] };
          return { ...data, pages };
        },
      );

      void qc.invalidateQueries({ queryKey: ["chat", "conversations"] });
    };

    socket.on("chat:message", onMessage);
    return () => {
      unsubscribeFromConversation(chatId);
      socket.off("chat:message", onMessage);
    };
  }, [chatId, myDeviceId, qc]);
}
