"use client";

import { cn } from "@/lib/cn";
import { forwardRef, type ButtonHTMLAttributes } from "react";

interface SwitchProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onCheckedChange, disabled, className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-primary" : "bg-border",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden
        className={cn(
          "inline-block h-5 w-5 translate-x-1 transform rounded-full bg-white shadow-sm transition-transform duration-150",
          checked && "translate-x-6",
        )}
      />
    </button>
  ),
);
Switch.displayName = "Switch";
