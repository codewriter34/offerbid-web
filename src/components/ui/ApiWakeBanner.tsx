"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ApiWakeBanner({
  onRetry,
  message = "The OfferBid API is waking up or unreachable. This can take up to a minute on free hosting.",
}: {
  onRetry?: () => void;
  message?: string;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 rounded-md bg-elevated px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
        <p className="text-sm text-ink-secondary">{message}</p>
      </div>
      {onRetry ? (
        <Button size="sm" variant="outline" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  );
}
