/**
 * Single source of truth for the current CutShot build.
 *
 * The `{{...}}` values are LITERAL placeholders. Replace them by hand when a
 * build is published; nothing generates them. Until a download URL is filled
 * in, `isDownloadReady()` returns false and the download buttons render as
 * "Coming soon" instead of linking nowhere.
 */
export const release = {
  version: "1.1.0",
  releasedAt: "{{YYYY-MM-DD}}",
  mac: { url: "{{MAC_DOWNLOAD_URL}}", size: "{{NN MB}}", arch: "{{Apple Silicon}}" },
  win: { url: "{{WIN_DOWNLOAD_URL}}", size: "{{NN MB}}", arch: "64-bit" },
  notes: ["{{one line per change in this build}}"],
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
