/**
 * Motion plumbing shared by every animated component.
 *
 * Three rules live here so no single effect can forget one:
 *   - prefers-reduced-motion means the final state, drawn once, and no loop;
 *   - devicePixelRatio is capped at 2 (a 3x phone renders 2.25x the pixels for
 *     nothing on hairline artwork);
 *   - ScrollTrigger is registered exactly once, in the browser.
 */

/** @returns {boolean} true when the visitor has asked for less motion. */
export function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** @returns {number} devicePixelRatio, never above 2. */
export function cappedPixelRatio() {
  if (typeof window === "undefined") return 1;
  return Math.min(window.devicePixelRatio || 1, 2);
}

let registered = false;

/**
 * Lazily import gsap + ScrollTrigger, registering the plugin once.
 * Dynamic so neither lands in the first-paint bundle.
 *
 * @returns {Promise<{gsap: object, ScrollTrigger: object}>}
 */
export async function loadScrollTrigger() {
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([
    import("gsap"),
    import("gsap/ScrollTrigger"),
  ]);

  if (!registered) {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }

  return { gsap, ScrollTrigger };
}

/**
 * Run `onVisible(true|false)` whenever the element enters or leaves the
 * viewport. Every WebGL loop on this page is gated on it.
 *
 * @param {Element} element
 * @param {(visible: boolean) => void} onVisible
 * @returns {() => void} teardown
 */
export function observeVisibility(element, onVisible) {
  if (typeof IntersectionObserver === "undefined") {
    onVisible(true);
    return () => {};
  }

  const observer = new IntersectionObserver(
    (entries) => entries.forEach((entry) => onVisible(entry.isIntersecting)),
    { rootMargin: "120px" },
  );

  observer.observe(element);
  return () => observer.disconnect();
}

/** @returns {boolean} true when this browser can actually give us a context. */
export function hasWebGL() {
  if (typeof document === "undefined") return false;

  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl"),
    );
  } catch {
    return false;
  }
}
