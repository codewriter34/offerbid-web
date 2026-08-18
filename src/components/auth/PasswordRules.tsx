"use client";

import { getPasswordChecks } from "@/lib/validators";
import { cn } from "@/lib/cn";

const RULE_ICONS: Record<string, string> = {
  length: "8+",
  number: "1",
  lower: "a",
  upper: "A",
  symbol: "#",
};

export function PasswordRules({ password }: { password: string }) {
  const checks = getPasswordChecks(password);

  return (
    <div className="mt-2.5">
      <div className="mb-2 flex gap-1.5">
        {checks.map((check) => (
          <div
            key={check.id}
            className={cn(
              "h-1.5 flex-1 rounded-full",
              check.met ? "bg-success" : "bg-border",
            )}
          />
        ))}
      </div>
      <div className="flex justify-between gap-1">
        {checks.map((check) => (
          <div
            key={check.id}
            title={check.label}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold",
              check.met
                ? "bg-success text-white"
                : "bg-elevated text-ink-muted",
            )}
          >
            {RULE_ICONS[check.id]}
          </div>
        ))}
      </div>
    </div>
  );
}
