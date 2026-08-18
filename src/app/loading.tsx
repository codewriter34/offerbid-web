export default function Loading() {
  return (
    <div className="ob-atmosphere flex min-h-dvh items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        <p className="text-sm font-medium text-ink-muted">Loading OfferBid…</p>
      </div>
    </div>
  );
}
