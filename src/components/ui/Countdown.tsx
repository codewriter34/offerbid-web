"use client";

import { formatCountdown } from "@/lib/formatters";
import { cn } from "@/lib/cn";
import { useEffect, useState } from "react";

export function Countdown({ expiresAt }: { expiresAt: string | null }) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, []);
  const { label, urgent, expired } = formatCountdown(expiresAt);
  if (!label) return null;
  return (
    <span
      className={cn(
        "text-xs font-semibold",
        expired || urgent ? "text-warning" : "text-ink-muted",
        urgent && !expired && "animate-pulse-urgent",
      )}
    >
      {label}
    </span>
  );
}
