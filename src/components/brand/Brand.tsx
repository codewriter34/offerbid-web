import Link from "next/link";
import { cn } from "@/lib/cn";

export function Logo({
  size = 40,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 overflow-hidden rounded-full bg-primary",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {/* Native img: the mark is a circle on a black square; Next/Image + Safari
          often showed a broken/black box. Clip to the circle. */}
      <img
        src="/logo-mark.png"
        alt="OfferBid"
        width={size}
        height={size}
        className="h-full w-full object-cover"
      />
    </span>
  );
}

export function Wordmark({
  href = "/",
  className,
  light = false,
}: {
  href?: string;
  className?: string;
  light?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative z-10 inline-flex min-h-11 cursor-pointer items-center gap-2.5",
        light ? "text-white" : "text-ink",
        className,
      )}
    >
      <Logo size={36} />
      <span className="font-display text-xl font-bold tracking-tight">
        OfferBid
      </span>
    </Link>
  );
}

export function SafetyBanner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-md bg-elevated px-4 py-3 text-sm text-ink-secondary",
        className,
      )}
    >
      <strong className="font-semibold text-ink">Meet safely.</strong> Meet in a
      public location, inspect the item, and confirm everything before paying.
    </div>
  );
}
