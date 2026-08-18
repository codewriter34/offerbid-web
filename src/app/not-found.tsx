import Link from "next/link";

export default function NotFound() {
  return (
    <div className="ob-atmosphere flex min-h-dvh items-center justify-center px-4">
      <div className="max-w-md text-center">
        <p className="font-display text-6xl font-extrabold text-primary">404</p>
        <h1 className="type-page mt-3 text-ink">Page not found</h1>
        <p className="mt-2 text-sm text-ink-muted">
          That deal or page isn’t here. Head back to Explore.
        </p>
        <Link
          href="/explore"
          className="mt-6 inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-semibold text-white"
        >
          Browse deals
        </Link>
      </div>
    </div>
  );
}
