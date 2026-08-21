import confetti from "canvas-confetti";

/** Light celebration for successful deal / listing moments. */
export function celebrateSuccess() {
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
