/**
 * Single source of truth for the current CutShot build.
 *
 * Filled in by hand when a build is published; nothing generates these. Until a
 * download URL is real, `isDownloadReady()` returns false and that button
 * renders as "Coming soon" instead of linking nowhere.
 *
 * macOS needs TWO builds. One executable cannot run on both CPUs, so an Apple
 * Silicon Mac and an Intel Mac take different files, and someone who takes the
 * wrong one gets an app that will not open or that crawls under translation.
 * Windows is a single 64-bit build.
 */
export const release = {
  version: "1.2.0",
  releasedAt: "2026-09-22",
  /* No URLs here on purpose. This file is imported by client components, so
     anything in it ships to the browser; the download links live server-side
     in src/lib/downloads.js and are handed out by /api/download only once the
     access code checks out. `id` is what the page posts to ask for a build. */
  mac: {
    appleSilicon: { id: "mac-arm64", size: "186 MB", arch: "Apple Silicon (M1–M4)", published: true },
    intel: { id: "mac-intel", size: "193 MB", arch: "Intel", published: true },
  },
  win: { id: "win-x64", size: "174 MB", arch: "64-bit", published: true },
  /**
   * CutShot asks for a key the first time it opens. Keys are emailed as text to
   * paste: no account, no sign-up, and the key is checked on the machine
   * itself, so the app never needs a connection.
   */
  trial: {
    days: 90,
    contact: "valentinofariascarrion@gmail.com",
  },
  notes: [
    "Trial keys: the app asks for one the first time it opens.",
    "A separate macOS build for Intel Macs, beside the Apple Silicon one.",
    "Stroke detection is now a trained model: far fewer wrong tags to delete.",
  ],
};

/**
 * True only when `url` is a real, filled-in download link.
 * False for nullish, empty/whitespace, and any leftover `{{PLACEHOLDER}}`.
 *
 * @param {unknown} url
 * @returns {boolean}
 */
export function isDownloadReady(url) {
  if (typeof url !== "string") return false;

  const trimmed = url.trim();
  if (trimmed === "") return false;
  if (trimmed.includes("{{") || trimmed.includes("}}")) return false;

  return true;
}
