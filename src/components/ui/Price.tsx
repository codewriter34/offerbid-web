import { formatPrice } from "@/lib/formatters";
import { cn } from "@/lib/cn";

export function Price({
  amount,
  currency = "XAF",
  className,
  size = "md",
}: {
  amount: number;
  currency?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-3xl",
  };
  return (
    <span className={cn("type-price text-ink", sizes[size], className)}>
      {formatPrice(amount, currency)}
    </span>
  );
}
