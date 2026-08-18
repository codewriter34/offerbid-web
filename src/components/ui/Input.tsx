"use client";

import { cn } from "@/lib/cn";
import { InputHTMLAttributes, ReactNode, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  trailing?: ReactNode;
  leading?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helper,
      id,
      disabled,
      trailing,
      leading,
      ...props
    },
    ref,
  ) => (
    <label className="flex w-full flex-col gap-1.5 text-sm">
      {label ? <span className="type-label">{label}</span> : null}
      <div className="flex gap-2">
        {leading ? (
          <span className="inline-flex h-11 shrink-0 items-center rounded-md border border-border bg-elevated px-3 text-sm font-semibold text-ink-secondary">
            {leading}
          </span>
        ) : null}
        <span className="relative min-w-0 flex-1">
          <input
            ref={ref}
            id={id}
            disabled={disabled}
            className={cn(
              "field-control",
              error && "field-control-error",
              trailing ? "pr-11" : null,
              className,
            )}
            {...props}
          />
          {trailing ? (
            <span className="absolute inset-y-0 right-1 flex items-center">
              {trailing}
            </span>
          ) : null}
        </span>
      </div>
      {error ? (
        <span className="text-xs text-danger">{error}</span>
      ) : helper ? (
        <span className="text-xs text-ink-muted">{helper}</span>
      ) : null}
    </label>
  ),
);
Input.displayName = "Input";
