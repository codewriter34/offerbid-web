"use client";

import { cn } from "@/lib/cn";
import { SelectHTMLAttributes, forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helper?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helper, children, disabled, ...props }, ref) => (
    <label className="flex w-full flex-col gap-1.5 text-sm">
      {label ? <span className="type-label">{label}</span> : null}
      <select
        ref={ref}
        disabled={disabled}
        className={cn(
          "field-control",
          error && "field-control-error",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error ? (
        <span className="text-xs text-danger">{error}</span>
      ) : helper ? (
        <span className="text-xs text-ink-muted">{helper}</span>
      ) : null}
    </label>
  ),
);
Select.displayName = "Select";
