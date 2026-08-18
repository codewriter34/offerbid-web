"use client";

import { cn } from "@/lib/cn";
import type { StatusTone } from "@/lib/status";

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: StatusTone;
  className?: string;
}) {
  const tones: Record<StatusTone, string> = {
    neutral: "bg-elevated text-ink-secondary",
    primary: "bg-primary/10 text-primary",
    success: "bg-accepted/10 text-accepted",
    warning: "bg-pending/10 text-pending",
    danger: "bg-rejected/10 text-rejected",
    pending: "bg-pending/10 text-pending",
    countered: "bg-countered/10 text-countered",
    accepted: "bg-accepted/10 text-accepted",
    rejected: "bg-rejected/10 text-rejected",
    expired: "bg-elevated text-expired",
    sold: "bg-sold/10 text-sold",
    verified: "bg-verified/10 text-verified",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-semibold",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
