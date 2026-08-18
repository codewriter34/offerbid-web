"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Ban, Check, Gavel, MessageCircle, Timer } from "lucide-react";
import { AppShell } from "@/components/layout/Shells";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Button } from "@/components/ui/Button";
import {
  EmptyState,
  ErrorView,
  NotifRowSkeleton,
} from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { useToast } from "@/components/ui/Toast";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/features/api/services";
import { useAuthStore } from "@/stores/authStore";
import { formatRelativeTime, getErrorMessage } from "@/lib/formatters";
import { connectSocket } from "@/lib/socket";
import { cn } from "@/lib/cn";
import { notificationCopy } from "@/lib/status";
import type { NotificationType } from "@/types";

function typeIcon(type: NotificationType) {
  if (type === "bid_accepted" || type === "listing_contact") return Check;
  if (type === "bid_rejected") return Ban;
  if (type === "bid_countered") return Gavel;
  if (type === "bid_expiring") return Timer;
  if (type === "new_bid") return Bell;
  return MessageCircle;
}

export default function NotificationsPage() {
  const router = useRouter();
  const toast = useToast();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    enabled: Boolean(user),
  });

  useEffect(() => {
    if (!user) return;
    const socket = connectSocket();
    const refresh = () => void qc.invalidateQueries({ queryKey: ["notifications"] });
    socket?.on("notification:new", refresh);
    return () => {
      socket?.off("notification:new", refresh);
    };
  }, [qc, user]);

  const markAll = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["notifications"] });
      toast.push("All marked read", "success");
    },
    onError: (e) => toast.push(getErrorMessage(e), "error"),
  });

  const unreadCount = data?.unreadCount ?? 0;

  return (
    <AppShell>
      <RequireAuth next="/notifications">
        <PageHeader
          title="Notifications"
          description={
            unreadCount
              ? `${unreadCount} unread — offers, counters, and deal updates.`
              : "Offers, counters, and deal updates."
          }
          action={
            unreadCount ? (
              <Button
                variant="outline"
                loading={markAll.isPending}
                onClick={() => markAll.mutate()}
              >
                Mark all read
              </Button>
            ) : null
          }
        />

        {isLoading ? (
          <div className="space-y-3">
            <NotifRowSkeleton />
            <NotifRowSkeleton />
            <NotifRowSkeleton />
          </div>
        ) : isError ? (
          <ErrorView message="Couldn’t load notifications" onRetry={() => refetch()} />
        ) : !data?.notifications.length ? (
          <EmptyState
            icon={Bell}
            title="You’re all caught up"
            description="New offers and counters will land here."
            action={
              <Button onClick={() => router.push("/explore")}>Browse deals</Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {data.notifications.map((n) => {
              const Icon = typeIcon(n.type);
              const { title } = notificationCopy(n.type);
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={async () => {
                    if (!n.read) {
                      await markNotificationRead(n.id);
                      void qc.invalidateQueries({ queryKey: ["notifications"] });
                    }
                    const listingId = n.payload.listingId ?? n.payload.listing_id;
                    if (typeof listingId === "string") {
                      router.push(`/listings/${listingId}`);
                    } else if (n.type === "new_bid" || n.type === "bid_countered") {
                      router.push("/selling");
                    } else if (
                      n.type === "bid_accepted" ||
                      n.type === "bid_rejected" ||
                      n.type === "bid_expiring"
                    ) {
                      router.push("/bids");
                    }
                  }}
                  className={cn(
                    "flex w-full gap-3 rounded-lg border px-4 py-3 text-left shadow-rest transition hover:shadow-hover",
                    n.read
                      ? "border-border bg-surface"
                      : "border-primary/20 bg-primary/5",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
                      n.read ? "bg-elevated text-ink-muted" : "bg-primary/10 text-primary",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">{title}</p>
                    {n.message ? (
                      <p className="mt-1 text-sm text-ink-secondary">{n.message}</p>
                    ) : null}
                    <p className="mt-2 type-meta">
                      {formatRelativeTime(n.createdAt)}
                      {!n.read ? (
                        <span className="ml-2 font-semibold text-primary">New</span>
                      ) : null}
                    </p>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </RequireAuth>
    </AppShell>
  );
}
