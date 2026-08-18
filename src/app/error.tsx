"use client";

import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="ob-atmosphere flex min-h-dvh items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="type-page text-ink">Something went wrong</h1>
        <p className="mt-2 text-sm text-ink-muted">
          {error.message || "An unexpected error occurred."}
        </p>
        <Button className="mt-6" onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  );
}
