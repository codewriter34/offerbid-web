import confetti from "canvas-confetti";

/**
 * Universal celebration used across the app (sell, deals, auth, profile, etc.).
 * Safe to call from any client success path. Respects reduced-motion.
 */
export function popConfetti() {
  if (typeof window === "undefined") return;

  const prefersReduced =
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;

  void confetti({
    particleCount: 90,
    spread: 70,
    startVelocity: 35,
    origin: { y: 0.65 },
    colors: ["#2070C8", "#3B8BE0", "#F5C84C", "#FFFFFF"],
  });
}

/** @deprecated Prefer popConfetti — kept as an alias for older call sites. */
export const celebrateSuccess = popConfetti;
