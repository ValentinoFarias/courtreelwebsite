"use client";

import { useEffect, useRef, useState } from "react";

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

/* One card per platform, but a platform can offer more than one file: macOS
   ships a separate build per CPU, because one executable cannot serve both.
   Each entry in `downloads` becomes its own button with its own size. */
const builds = {
  macos: {
    id: "macos",
    name: "macOS",
    file: "A .dmg you drag into Applications.",
    downloads: [
      { id: "apple-silicon", action: "Download for Apple Silicon", build: release.mac.appleSilicon },
      { id: "intel", action: "Download for Intel", build: release.mac.intel },
    ],
    /* Said on the card rather than buried in the notes: taking the wrong one
       is the single most likely way a visitor ends up with an app that will
       not open. */
    hint: "Apple menu → About This Mac tells you which chip you have.",
  },
  windows: {
    id: "windows",
    name: "Windows",
    file: "An .exe installer.",
    downloads: [{ id: "x64", action: "Download for Windows", build: release.win }],
    hint: null,
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
function DownloadCard({ platform = "macos", active = false, busyId = null, onDownload }) {
  const entry = builds[platform] ?? builds.macos;
  const anyReady = entry.downloads.some((download) => download.build.published);

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

        {/* One row per file the platform offers: on macOS the two builds differ
            in both size and CPU, so a single row could only lie about one. */}
        {entry.downloads.map((download) => (
          <div className="home__download-meta-row" key={download.id}>
            <dt className="home__download-meta-term">
              {isFilledIn(download.build.arch) ? (
                download.build.arch
              ) : (
                <span className="home__download-meta-value--pending">not published yet</span>
              )}
            </dt>
            <dd className="home__download-meta-value">
              {isFilledIn(download.build.size) ? (
                <span className="home__numeric">{download.build.size}</span>
              ) : (
                <span className="home__download-meta-value--pending">not published yet</span>
              )}
            </dd>
          </div>
        ))}
      </dl>

      <p className="home__download-file">{entry.file}</p>

      <div className="home__download-action">
        {entry.downloads.map((download) => (
          <p className="home__download-choice" key={download.id}>
            {/* A button, not a link: the file URL is not in this page. The
                access code is posted to /api/download, which answers with the
                link only if it checks out, and the browser is sent there. */}
            <button
              className="home__btn home__btn--primary"
              type="button"
              disabled={!download.build.published || busyId !== null}
              onClick={() => onDownload(download.build.id)}
            >
              {busyId === download.build.id
                ? "Checking…"
                : download.build.published
                  ? download.action
                  : "Coming soon"}
            </button>
          </p>
        ))}
      </div>

      {entry.hint && anyReady ? (
        <p className="home__download-pending">{entry.hint}</p>
      ) : null}

      {anyReady ? null : (
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
  const [code, setCode] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [gateError, setGateError] = useState(null);
  /* The build the visitor asked for while the dialog is up, or null. */
  const [pendingBuild, setPendingBuild] = useState(null);
  /* A code that has already worked this visit. Asking again for the second
     platform would read as a malfunction, not as security. */
  const [unlockedCode, setUnlockedCode] = useState(null);
  const dialogRef = useRef(null);

  /* Native <dialog>: the focus trap, the Escape key and the backdrop are the
     browser's, and all three are things a hand-rolled overlay gets wrong.
     Opening and closing has to be imperative, hence the ref. */
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (pendingBuild && !dialog.open) dialog.showModal();
    if (!pendingBuild && dialog.open) dialog.close();
  }, [pendingBuild]);

  /**
   * Asks the server for a download link, handing it a code.
   *
   * Everything a wrong code learns from this is "no". The link only exists in
   * the response to a correct one, and the browser is sent straight to it, so
   * the page never has to hold it either.
   *
   * @param {string} buildId
   * @param {string} typed
   */
  async function requestDownload(buildId, typed) {
    setBusyId(buildId);
    setGateError(null);

    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ build: buildId, code: typed }),
      });
      const payload = await response.json().catch(() => null);

      if (response.ok && payload?.url) {
        setUnlockedCode(typed);
        setPendingBuild(null);
        window.location.assign(payload.url);
        return;
      }
      if (response.status === 503) {
        setGateError("Downloads are not switched on yet. Tell Valentino.");
        return;
      }
      /* A code that has stopped working should not keep being reused for the
         other button — send them back to the dialog. */
      setUnlockedCode(null);
      setGateError("That code is not right. Check the email it came in.");
    } catch {
      setGateError("Could not reach the server. Try again in a moment.");
    } finally {
      setBusyId(null);
    }
  }

  /** A download button was pressed: ask for the code, or go straight there if
   *  this visitor has already given a working one. */
  function handleDownload(buildId) {
    if (unlockedCode) {
      void requestDownload(buildId, unlockedCode);
      return;
    }
    setGateError(null);
    setPendingBuild(buildId);
  }

  function handleSubmitCode(event) {
    event.preventDefault();
    const typed = code.trim();
    if (typed === "" || !pendingBuild) return;
    void requestDownload(pendingBuild, typed);
  }

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
            For macOS and Windows
          </h2>
          <p className="home__lede">
            One file, no account, no sign-up. Take the build that matches the
            machine you review video on, not the one you are reading this on.
          </p>
          <p className="home__lede">
            CutShot is in a {release.trial.days}-day trial, so it asks for a key
            the first time it opens.{" "}
            <a className="home__link" href={`mailto:${release.trial.contact}?subject=CutShot%20trial%20key`}>
              Email me for one
            </a>{" "}
            and I will send it back as a line of text to paste in. Nothing is
            checked online: the key is read on your own computer, and so is every
            video you import.
          </p>
        </div>

        <ul className="home__download-grid">
          <DownloadCard
            platform="macos"
            active={detected === "macos"}
            busyId={busyId}
            onDownload={handleDownload}
          />
          <DownloadCard
            platform="windows"
            active={detected === "windows"}
            busyId={busyId}
            onDownload={handleDownload}
          />
        </ul>

        {/* Phone visitors: a desktop app cannot be installed here, so the useful
            thing to offer is the link. The section is never hidden on mobile —
            only this one line is hidden once there is room for a real download. */}
        <div className="home__download-mobile">
          <p className="home__download-mobile-line">
            Reading this on a phone? CutShot is a desktop app. Send yourself the
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

      {/* The code prompt. It appears when a download is asked for, rather than
          sitting on the page: the buttons are what people came for, and the
          code is a step on the way, not a form to fill in first.

          `onCancel` covers the Escape key, which the browser handles itself and
          which would otherwise leave `pendingBuild` set and the dialog shut. */}
      <dialog
        className="home__code-dialog"
        ref={dialogRef}
        aria-labelledby="home-code-title"
        onCancel={(event) => {
          event.preventDefault();
          setPendingBuild(null);
        }}
        onClick={(event) => {
          /* A click on the dialog element itself is a click on the backdrop:
             the form inside stops it from ever reaching here. */
          if (event.target === dialogRef.current) setPendingBuild(null);
        }}
      >
        <form className="home__code-form" onSubmit={handleSubmitCode}>
          <h3 id="home-code-title" className="home__code-title">
            Access code
          </h3>
          <p className="home__code-lede">
            The builds are for the club trial, so they are behind a code. It is in
            the email with your key — or ask me for one.
          </p>

          <label className="home__code-label" htmlFor="home-download-code">
            Code
          </label>
          <input
            id="home-download-code"
            className="home__input home__code-input"
            name="code"
            type="text"
            autoComplete="off"
            autoFocus
            spellCheck={false}
            /* No placeholder: an example of the code is half the code. The
               label above already says what the field is. */
            value={code}
            onChange={(event) => {
              setCode(event.target.value);
              setGateError(null);
            }}
          />

          <p className="home__code-status" role="status" aria-live="polite">
            {gateError ?? " "}
          </p>

          <div className="home__code-actions">
            <button
              className="home__btn home__btn--secondary"
              type="button"
              onClick={() => setPendingBuild(null)}
            >
              Cancel
            </button>
            <button
              className="home__btn home__btn--primary"
              type="submit"
              disabled={code.trim() === "" || busyId !== null}
            >
              {busyId ? "Checking…" : "Download"}
            </button>
          </div>
        </form>
      </dialog>
    </section>
  );
}
