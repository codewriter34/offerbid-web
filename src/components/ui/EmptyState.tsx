"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-border/70", className)}
      aria-hidden
    />
  );
}

export function ListingSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg bg-surface shadow-rest">
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="space-y-2 p-3">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

export function OfferRowSkeleton() {
  return (
    <div className="flex gap-3 rounded-lg bg-surface p-4 shadow-rest">
      <Skeleton className="h-16 w-16 shrink-0 rounded-md" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-4 w-36" />
      </div>
    </div>
  );
}

export function NotifRowSkeleton() {
  return (
    <div className="flex gap-3 rounded-lg bg-surface px-4 py-3 shadow-rest">
      <Skeleton className="h-9 w-9 shrink-0 rounded-md" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex items-center gap-4">
        <Skeleton className="h-20 w-20 rounded-md" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-52" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <ListingSkeleton />
        <ListingSkeleton />
      </div>
    </div>
  );
}

export function ListingThumbSkeleton() {
  return (
    <div className="flex gap-3 rounded-lg bg-surface p-3 shadow-rest">
      <Skeleton className="h-20 w-20 shrink-0 rounded-md" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon: Icon,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: LucideIcon;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      {Icon ? (
        <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-md bg-elevated text-ink-muted">
          <Icon className="h-6 w-6" aria-hidden />
        </span>
      ) : null}
      <h3 className="type-section text-ink">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-md text-sm text-ink-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function ErrorView({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="px-6 py-12 text-center">
      <p className="text-sm text-danger">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 min-h-11 text-sm font-semibold text-primary underline-offset-2 hover:underline"
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}
