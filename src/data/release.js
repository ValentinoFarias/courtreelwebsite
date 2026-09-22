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
  mac: {
    appleSilicon: {
      url: "https://github.com/ValentinoFarias/cutshotwebsite/releases/download/app-v1.2.0/CutShot-1.2.0-mac-arm64.dmg",
      size: "186 MB",
      arch: "Apple Silicon (M1–M4)",
    },
    intel: {
      url: "https://github.com/ValentinoFarias/cutshotwebsite/releases/download/app-v1.2.0/CutShot-1.2.0-mac-x64.dmg",
      size: "193 MB",
      arch: "Intel",
    },
  },
  win: {
    url: "https://github.com/ValentinoFarias/cutshotwebsite/releases/download/app-v1.2.0/CutShot-1.2.0-win-x64.exe",
    size: "174 MB",
    arch: "64-bit",
  },
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
