"use client";

import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { AppShell } from "@/components/layout/Shells";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState, ErrorView, OfferRowSkeleton } from "@/components/ui/EmptyState";
import { Price } from "@/components/ui/Price";
import { useConversations } from "@/features/chat/useConversations";
import { formatRelativeTime } from "@/lib/formatters";
import { cn } from "@/lib/cn";

export default function InboxClient() {
  const { data, isLoading, isError, refetch } = useConversations({ limit: 50 });
  const conversations = data?.conversations ?? [];

  return (
    <AppShell>
      <RequireAuth next="/inbox">
        <PageHeader
          title="Inbox"
          description="End-to-end encrypted conversations about your deals."
        />

        {isLoading ? (
          <div className="space-y-3">
            <OfferRowSkeleton />
            <OfferRowSkeleton />
            <OfferRowSkeleton />
          </div>
        ) : isError ? (
          <ErrorView message="Couldn’t load your inbox" onRetry={() => refetch()} />
        ) : conversations.length === 0 ? (
          <EmptyState
            icon={MessageCircle}
            title="No conversations yet"
            description="When you message a seller or a buyer messages you, it’ll show up here."
          />
        ) : (
          <div className="space-y-3">
            {conversations.map((conversation) => (
              <Link
                key={conversation.id}
                href={`/inbox/${conversation.id}`}
                className={cn(
                  "flex items-center gap-3 rounded-lg border px-4 py-3 shadow-rest transition hover:shadow-hover",
                  conversation.unreadCount > 0
                    ? "border-primary/20 bg-primary/5"
                    : "border-border bg-surface",
                )}
              >
                <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-elevated">
                  {conversation.listing.image ? (
                    <Image
                      src={conversation.listing.image}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  ) : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-ink">
                      {conversation.peer.fullName}
                    </span>
                    {conversation.lastMessageAt ? (
                      <span className="shrink-0 type-meta">
                        {formatRelativeTime(conversation.lastMessageAt)}
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-0.5 block truncate text-sm text-ink-secondary">
                    {conversation.listing.title}
                  </span>
                  <span className="mt-1 flex items-center gap-2">
                    <Price
                      amount={conversation.listing.askingPrice}
                      currency={conversation.listing.currency}
                      size="sm"
                    />
                    {conversation.unreadCount > 0 ? (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white">
                        {conversation.unreadCount}
                      </span>
                    ) : null}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </RequireAuth>
    </AppShell>
  );
}
