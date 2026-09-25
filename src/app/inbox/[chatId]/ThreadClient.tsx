"use client";

import { use, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Lock, Send, ShieldAlert } from "lucide-react";
import { AppShell } from "@/components/layout/Shells";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Button } from "@/components/ui/Button";
import { ErrorView, Skeleton } from "@/components/ui/EmptyState";
import { ActionNotice } from "@/components/ui/ActionNotice";
import { Price } from "@/components/ui/Price";
import { useConversation } from "@/features/chat/useConversation";
import { flattenMessagePages, useMessages } from "@/features/chat/useMessages";
import { useSendMessage } from "@/features/chat/useSendMessage";
import { useMarkChatRead } from "@/features/chat/useMarkChatRead";
import { useMyDeviceId } from "@/features/chat/useMyDeviceId";
import { useChatThreadRealtime } from "@/features/chat/useChatThreadRealtime";
import { useAuthStore } from "@/stores/authStore";
import { formatRelativeTime, openWhatsApp } from "@/lib/formatters";
import { cn } from "@/lib/cn";
import type { ChatMessage } from "@/types";

export default function ThreadClient({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const { chatId } = use(params);
  const user = useAuthStore((s) => s.user);
  const [draft, setDraft] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const conversationQuery = useConversation(chatId);
  const conversation = conversationQuery.data;
  const { data: myDeviceId } = useMyDeviceId();
  const messagesQuery = useMessages(chatId);
  const sendMutation = useSendMessage(chatId, conversation);
  const markReadMutation = useMarkChatRead(chatId);

  useChatThreadRealtime(chatId, myDeviceId);

  useEffect(() => {
    if (chatId) markReadMutation.mutate(undefined);
    // Only re-run when the thread changes, not on every mutation identity change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId]);

  const messages = flattenMessagePages(messagesQuery.data?.pages);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  async function handleSend() {
    const text = draft.trim();
    if (!text || sendMutation.isPending) return;
    setSendError(null);
    setDraft("");
    try {
      await sendMutation.mutateAsync(text);
    } catch (err) {
      setDraft(text);
      setSendError(err instanceof Error ? err.message : "Couldn’t send message");
    }
  }

  if (conversationQuery.isLoading) {
    return (
      <AppShell>
        <div className="space-y-3">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AppShell>
    );
  }

  if (conversationQuery.isError || !conversation) {
    return (
      <AppShell>
        <ErrorView
          message="Couldn’t load this conversation."
          onRetry={() => conversationQuery.refetch()}
        />
      </AppShell>
    );
  }

  const peer = conversation.peer;

  return (
    <AppShell>
      <RequireAuth next={`/inbox/${chatId}`}>
        <div className="mx-auto flex h-[calc(100dvh-9rem)] max-w-2xl flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-rest">
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <Link
              href="/inbox"
              aria-label="Back to inbox"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-ink-muted hover:bg-elevated hover:text-ink"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-elevated">
              {peer.avatarUrl ? (
                <Image src={peer.avatarUrl} alt="" fill className="object-cover" />
              ) : (
                <span className="flex h-full items-center justify-center text-sm font-bold text-ink-muted">
                  {peer.fullName.slice(0, 1)}
                </span>
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{peer.fullName}</p>
              <Link
                href={`/listings/${conversation.listing.id}`}
                className="truncate text-xs text-ink-muted hover:text-primary hover:underline"
              >
                {conversation.listing.title} ·{" "}
                <Price
                  amount={conversation.listing.askingPrice}
                  currency={conversation.listing.currency}
                  size="sm"
                  className="text-xs"
                />
              </Link>
            </div>
            {peer.whatsappUrl ? (
              <Button
                variant="whatsapp"
                size="sm"
                onClick={() => openWhatsApp(peer.whatsappUrl!)}
              >
                WhatsApp
              </Button>
            ) : null}
          </div>

          <div className="flex items-center gap-2 border-b border-border/60 bg-canvas px-4 py-1.5 text-xs text-ink-muted">
            <Lock className="h-3 w-3 shrink-0" />
            Messages are end-to-end encrypted.
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            {messagesQuery.hasNextPage ? (
              <div className="mb-4 flex justify-center">
                <button
                  type="button"
                  onClick={() => void messagesQuery.fetchNextPage()}
                  disabled={messagesQuery.isFetchingNextPage}
                  className="min-h-9 rounded-md border border-border px-3 text-xs font-semibold text-ink-secondary hover:bg-elevated disabled:opacity-50"
                >
                  {messagesQuery.isFetchingNextPage ? "Loading…" : "Load older messages"}
                </button>
              </div>
            ) : null}

            {messagesQuery.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-2/3" />
                <Skeleton className="ml-auto h-10 w-2/3" />
                <Skeleton className="h-10 w-1/2" />
              </div>
            ) : messages.length === 0 ? (
              <p className="py-10 text-center text-sm text-ink-muted">
                Say hello — your message will be end-to-end encrypted.
              </p>
            ) : (
              <div className="space-y-2">
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isOwn={message.senderId === user?.id}
                  />
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-border p-3">
            <ActionNotice message={sendError} tone="error" className="mb-2" />
            <div className="flex items-end gap-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void handleSend();
                  }
                }}
                placeholder="Type a message…"
                rows={1}
                className="field-control min-h-11 flex-1 resize-none"
              />
              <Button
                size="md"
                loading={sendMutation.isPending}
                disabled={!draft.trim()}
                onClick={() => void handleSend()}
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </RequireAuth>
    </AppShell>
  );
}

function MessageBubble({
  message,
  isOwn,
}: {
  message: ChatMessage;
  isOwn: boolean;
}) {
  return (
    <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-3 py-2 text-sm shadow-rest",
          isOwn ? "bg-primary text-white" : "bg-elevated text-ink",
        )}
      >
        {message.decryptError ? (
          <span className="flex items-center gap-1.5 italic opacity-80">
            <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
            Couldn’t decrypt this message
          </span>
        ) : (
          <p className="whitespace-pre-wrap break-words">{message.plaintext}</p>
        )}
        <p
          className={cn(
            "mt-1 text-[10px]",
            isOwn ? "text-white/70" : "text-ink-muted",
          )}
        >
          {formatRelativeTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}
