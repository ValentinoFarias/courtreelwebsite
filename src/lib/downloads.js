/*
  downloads — where the installers actually live, and who is allowed to be told.

  ---------------------------------------------------------------------------
  SERVER ONLY. Never import this from a component.
  ---------------------------------------------------------------------------
  The whole point of the access code is that the file URLs are not in the page
  the browser downloads. Importing this module from a client component would
  bundle these strings into the JavaScript and undo it, silently. The only
  importer is src/app/api/download/route.js.

  ---------------------------------------------------------------------------
  What this does and does not protect
  ---------------------------------------------------------------------------
  The assets are public GitHub release assets. The code stops a visitor who
  lands on the site from downloading, and it keeps the URLs out of the page
  source — that is all it can do. Anyone who has been given a link, or who
  browses this repo's releases, reaches the files without typing anything, and
  anyone who passes the gate once can see the URL in their network tab and pass
  it on. Making that impossible needs private assets and signed links, which is
  a different job (see the README).

  The code itself lives in the CUTSHOT_DOWNLOAD_CODE environment variable and
  never in this repository, which is public: a code committed here would be a
  code anyone can read. With the variable unset the route answers 503 rather
  than falling back to something guessable.
*/

const RELEASE_BASE =
  "https://github.com/ValentinoFarias/cutshotwebsite/releases/download/app-v1.2.0";

/** Build id (as the page sends it) → the file it downloads. */
const TARGETS = {
  "mac-arm64": `${RELEASE_BASE}/CutShot-1.2.0-mac-arm64.dmg`,
  "mac-intel": `${RELEASE_BASE}/CutShot-1.2.0-mac-x64.dmg`,
  "win-x64": `${RELEASE_BASE}/CutShot-1.2.0-win-x64.exe`,
};

/**
 * The download URL for a build id, or null when the id is not one we publish.
 *
 * @param {unknown} buildId
 * @returns {string|null}
 */
export function downloadUrlFor(buildId) {
  if (typeof buildId !== "string") return null;
  return TARGETS[buildId] ?? null;
}

/** True when an access code is configured at all. */
export function isGateConfigured() {
  return typeof process.env.CUTSHOT_DOWNLOAD_CODE === "string" &&
    process.env.CUTSHOT_DOWNLOAD_CODE.trim() !== "";
}

/**
 * Case-insensitive, whitespace-forgiving comparison: the code is read off a
 * club noticeboard or a WhatsApp message, and "tenniscotham " should work.
 *
 * @param {unknown} submitted
 * @returns {boolean}
 */
export function isCodeCorrect(submitted) {
  if (!isGateConfigured() || typeof submitted !== "string") return false;

  const expected = process.env.CUTSHOT_DOWNLOAD_CODE.trim().toUpperCase();
  return submitted.trim().toUpperCase() === expected;
}
