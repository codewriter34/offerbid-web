"use client";

import { cn } from "@/lib/cn";

export function ActionNotice({
  message,
  tone = "error",
  className,
}: {
  message: string | null | undefined;
  tone?: "error" | "info" | "success";
  className?: string;
}) {
  if (!message) return null;

  return (
    <div
      role="status"
      className={cn(
        "rounded-md border px-3 py-2.5 text-sm",
        tone === "error" && "border-danger/25 bg-danger/5 text-danger",
        tone === "info" && "border-border bg-canvas text-ink-secondary",
        tone === "success" && "border-success/25 bg-success/5 text-success",
        className,
      )}
    >
      {message}
    </div>
  );
}
