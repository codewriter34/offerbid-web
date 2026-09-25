"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import { sendEncryptedMessage } from "./sendMessage";
import { messagesQueryKey } from "./useMessages";
import { useMyDeviceId } from "./useMyDeviceId";
import { useAuthStore } from "@/stores/authStore";
import type { ChatMessage, Conversation, MessagesPage } from "@/types";

/**
 * We deliberately do not wait for a server-echoed, decryptable copy of our
 * own sent message: per this app's scope (see sendMessage.ts docstring), we
 * never send ourselves an envelope, so a message we send will never appear
 * addressed to our own device in GET/realtime message payloads. We already
 * have the plaintext (we just typed it), so we render our own message
 * optimistically from it as soon as the POST succeeds, using the id/
 * timestamp the server assigned.
 */
export function useSendMessage(chatId: string, conversation: Conversation | undefined) {
  const qc = useQueryClient();
  const { data: myDeviceId } = useMyDeviceId();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async (text: string) => {
      if (!conversation || !myDeviceId || !user) {
        throw new Error("Chat is not ready yet");
      }
      const result = await sendEncryptedMessage({
        chatId,
        peerUserId: conversation.peer.id,
        myDeviceId,
        plaintext: text,
      });
      return { result, text };
    },
    onSuccess: ({ result, text }) => {
      const optimistic: ChatMessage = {
        id: result.id,
        conversationId: result.conversationId,
        senderId: result.senderId,
        senderDeviceId: result.senderDeviceId,
        createdAt: result.createdAt,
        envelopes: [],
        plaintext: text,
      };

      qc.setQueryData<InfiniteData<MessagesPage, string | undefined>>(
        messagesQueryKey(chatId),
        (data) => {
          if (!data) {
            return {
              pages: [{ messages: [optimistic], limit: 30 }],
              pageParams: [undefined],
            };
          }
          const pages = [...data.pages];
          // The newest page is always index 0 (see useMessages.ts).
          pages[0] = {
            ...pages[0],
            messages: [...pages[0].messages, optimistic],
          };
          return { ...data, pages };
        },
      );

      // Partial key match: invalidates every conversations-list query
      // regardless of page/limit (the Inbox list, the nav unread badge, ...).
      void qc.invalidateQueries({ queryKey: ["chat", "conversations"] });
    },
  });
}
