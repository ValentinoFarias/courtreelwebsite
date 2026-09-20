"use client";

import { useEffect, useState } from "react";

import InstallNotes from "@/components/InstallNotes";
import { isDownloadReady, release } from "@/data/release";

/*
  DownloadCards — the download section: one card per platform, plus the
  install-warning disclosure underneath.

  ---------------------------------------------------------------------------
  Why this is a client component
  ---------------------------------------------------------------------------
  Two things genuinely need the browser: guessing which OS the visitor is on,
  and the "copy link" button for phone visitors. Everything else is static.

  ---------------------------------------------------------------------------
  No hydration mismatch
  ---------------------------------------------------------------------------
  OS detection runs in an effect AFTER mount, never during render. The server
  HTML and the first client render are therefore identical: `detected` starts
  as null and NEITHER card is promoted. The clay outline and the "looks like
  your system" badge appear on the second render, once the effect has run.

  Both cards are always rendered, whatever the detection says. Detection is a
  hint, not a gate: it is routinely wrong (a Mac on a corporate proxy, a
  Windows machine in a Linux VM), and a visitor must never have to fight the
  page to reach the build they actually want.

  ---------------------------------------------------------------------------
  Placeholders
  ---------------------------------------------------------------------------
  Until src/data/release.js has real values, `isDownloadReady()` is false and
  the button renders as a real, disabled <button> reading "Coming soon" — never
  a link to nowhere. Size and architecture are shown as "not published yet"
  rather than leaking a raw {{PLACEHOLDER}} onto the page.
*/

/* How long the "Copied" confirmation stays up. */
const COPY_RESET_MS = 2400;

/* Same rule as isDownloadReady, applied to a display value rather than a URL:
   a leftover {{PLACEHOLDER}} is not something to show a visitor. */
const isFilledIn = isDownloadReady;

const builds = {
  macos: {
    id: "macos",
    name: "macOS",
    action: "Download for macOS",
    file: "A .dmg you drag into Applications.",
    build: release.mac,
  },
  windows: {
    id: "windows",
    name: "Windows",
    action: "Download for Windows",
    file: "An .exe installer.",
    build: release.win,
  },
};

/**
 * Best guess at the visitor's desktop OS.
 *
 * `navigator.userAgentData.platform` is the modern hint (Chromium only); the
 * user-agent string is the fallback everywhere else. macOS is tested first
 * because several Apple platform strings would otherwise trip the "win" test.
 *
 * Browser-only: never call this during render.
 *
 * @returns {"macos"|"windows"|null} null when nothing matches — the honest answer.
 */
function detectPlatform() {
  if (typeof navigator === "undefined") return null;

  const hinted =
    typeof navigator.userAgentData?.platform === "string"
      ? navigator.userAgentData.platform
      : "";
  const haystack = `${hinted} ${navigator.userAgent || ""}`.toLowerCase();

  if (haystack.includes("mac") || haystack.includes("iphone") || haystack.includes("ipad")) {
    return "macos";
  }
  if (haystack.includes("win")) return "windows";

  return null;
}

/**
 * One platform card.
 *
 * @param {object} props
 * @param {"macos"|"windows"} [props.platform] - which build this card is for.
 * @param {boolean} [props.active] - true only once detection has matched this card.
 */
function DownloadCard({ platform = "macos", active = false }) {
  const entry = builds[platform] ?? builds.macos;
  const { build } = entry;
  const ready = isDownloadReady(build.url);

  const cardClass = active
    ? "home__download-card home__download-card--active"
    : "home__download-card";

  return (
    <li className={cardClass}>
      <h3 className="home__download-os">{entry.name}</h3>

      {/* Rendered only after the effect has run, so it cannot desync hydration. */}
      {active ? (
        <p className="home__download-badge">Looks like your system</p>
      ) : null}

      <dl className="home__download-meta">
        <div className="home__download-meta-row">
          <dt className="home__download-meta-term">Version</dt>
          <dd className="home__download-meta-value">
            {isFilledIn(release.version) ? (
              <span className="home__numeric">{release.version}</span>
            ) : (
              <span className="home__download-meta-value--pending">not published yet</span>
            )}
          </dd>
        </div>

        <div className="home__download-meta-row">
          <dt className="home__download-meta-term">Size</dt>
          <dd className="home__download-meta-value">
            {isFilledIn(build.size) ? (
              <span className="home__numeric">{build.size}</span>
            ) : (
              <span className="home__download-meta-value--pending">not published yet</span>
            )}
          </dd>
        </div>

        <div className="home__download-meta-row">
          <dt className="home__download-meta-term">Architecture</dt>
          <dd className="home__download-meta-value">
            {isFilledIn(build.arch) ? (
              build.arch
            ) : (
              <span className="home__download-meta-value--pending">not published yet</span>
            )}
          </dd>
        </div>
      </dl>

      <p className="home__download-file">{entry.file}</p>

      <div className="home__download-action">
        {ready ? (
          /* The binaries live on GitHub Releases, not in /public — these are
             absolute, external links. */
          <a className="home__btn home__btn--primary" href={build.url} rel="noopener">
            {entry.action}
          </a>
        ) : (
          <button className="home__btn home__btn--primary" type="button" disabled>
            Coming soon
          </button>
        )}
      </div>

      {ready ? null : (
        <p className="home__download-pending">
          The {entry.name} build is not uploaded yet.
        </p>
      )}
    </li>
  );
}

export default function DownloadCards() {
  const [detected, setDetected] = useState(null);
  const [copyState, setCopyState] = useState("idle"); /* idle | copied | failed */
  const [pageUrl, setPageUrl] = useState("");

  /* Detection, after mount. This is the whole hydration-safety story. */
  useEffect(() => {
    setDetected(detectPlatform());
  }, []);

  /* "Copied" is a confirmation, not a permanent state. */
  useEffect(() => {
    if (copyState !== "copied") return undefined;

    const timer = window.setTimeout(() => setCopyState("idle"), COPY_RESET_MS);
    return () => window.clearTimeout(timer);
  }, [copyState]);

  /* The clipboard API is missing on old browsers and rejects outright on
     insecure origins, so the failure path shows the URL to copy by hand. */
  async function handleCopyLink() {
    const url = window.location.href;
    setPageUrl(url);

    try {
      if (typeof navigator.clipboard?.writeText !== "function") {
        throw new Error("Clipboard API unavailable");
      }
      await navigator.clipboard.writeText(url);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }

  return (
    <section
      id="download"
      className="home__section home__section--stage home__download"
      aria-labelledby="home-download-title"
    >
      <div className="home__container">
        <div className="home__section-head">
          <p className="home__eyebrow">Download</p>
          <h2 id="home-download-title" className="home__section-title">
            Free, for macOS and Windows
          </h2>
          <p className="home__lede">
            One file, no account, no sign-up. Both builds are here — take whichever
            matches the machine you edit on, not the one you are reading this on.
          </p>
        </div>

        <ul className="home__download-grid">
          <DownloadCard platform="macos" active={detected === "macos"} />
          <DownloadCard platform="windows" active={detected === "windows"} />
        </ul>

        {/* Phone visitors: a desktop app cannot be installed here, so the useful
            thing to offer is the link. The section is never hidden on mobile —
            only this one line is hidden once there is room for a real download. */}
        <div className="home__download-mobile">
          <p className="home__download-mobile-line">
            Reading this on a phone? CourtReel is a desktop app. Send yourself the
            link and open it on your computer.
          </p>

          <div className="home__download-mobile-actions">
            <button
              className="home__btn home__btn--secondary"
              type="button"
              onClick={handleCopyLink}
            >
              Copy link
            </button>

            <span className="home__download-copy-status" role="status" aria-live="polite">
              {copyState === "copied" ? "Copied" : null}
              {copyState === "failed" ? "Copy it by hand:" : null}
            </span>
          </div>

          {copyState === "failed" ? (
            <p className="home__download-copy-url">
              <code>{pageUrl}</code>
            </p>
          ) : null}
        </div>

        <InstallNotes />
      </div>
    </section>
  );
}
