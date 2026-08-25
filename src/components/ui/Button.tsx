"use client";

import { cn } from "@/lib/cn";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-hover active:bg-primary-active",
  secondary: "bg-ink text-white hover:bg-ink/90 active:bg-ink",
  ghost: "bg-transparent text-ink-secondary hover:bg-elevated active:bg-border",
  danger: "bg-danger text-white hover:bg-danger/90 active:bg-danger",
  outline:
    "bg-surface text-ink border border-border hover:border-primary/40 hover:text-primary active:bg-elevated",
};

const sizes: Record<Size, string> = {
  sm: "h-9 min-h-9 px-3 text-sm",
  md: "h-11 min-h-11 px-4 text-sm",
  lg: "h-12 min-h-12 px-6 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading,
      disabled,
      children,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-md font-semibold transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-[0.98] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current"
          aria-hidden
        />
      ) : null}
      {children}
    </button>
  ),
);
Button.displayName = "Button";
