"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { release } from "@/data/release";

/*
  FeedbackForm — the point of the whole page.

  ---------------------------------------------------------------------------
  How this reaches Netlify
  ---------------------------------------------------------------------------
  Netlify registers a form only if its build-time crawler can see it in static
  HTML. It cannot see a React-rendered form, so public/__forms.html holds a
  hidden copy of exactly these field names and is what gets registered. This
  component then POSTs to that same path as urlencoded data.

  The field names below MUST stay identical to public/__forms.html:
    form-name, bot-field, name, email, platform, topic, message,
    appVersion, userAgent
  If public/__forms.html is ever deleted, submissions 404 in silence.

  ---------------------------------------------------------------------------
  No hydration mismatch
  ---------------------------------------------------------------------------
  Everything the browser knows — the platform guess and the user-agent string —
  is written in an effect after mount, never during render. The first client
  render is byte-identical to the server HTML: `platform` starts empty and
  `userAgent` starts empty.

  ---------------------------------------------------------------------------
  Validation
  ---------------------------------------------------------------------------
  Client-side only, and deliberately thin. Only `message` is required, because
  a tester must be able to send one sentence and get on with their day.
*/

/* Netlify's own endpoint for this form: the static file it crawled at build. */
const FORM_ENDPOINT = "/__forms.html";
const FORM_NAME = "feedback";

const MESSAGE_MAX = 4000;
/* Past this, the character count appears. Silent until it is worth knowing. */
const COUNT_VISIBLE_FROM = 3500;

/* Shape check, not a validity check — the only way to know an address works is
   to send to it. Deliberately permissive. */
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* Mirrors the "what helps most" list rendered above the form. Keep the two in
   step: the list tells people what to look for, the select is where it lands. */
const topics = [
  { value: "missed", label: "A shot it missed" },
  { value: "invented", label: "A shot it invented" },
  { value: "wrong-stroke", label: "A stroke typed wrong" },
  { value: "crash", label: "It crashed or froze" },
  { value: "confusing", label: "Something confusing" },
  { value: "speed", label: "How slow analysis was on my machine" },
  { value: "other", label: "Something else" },
];

const platforms = [
  { value: "macos", label: "macOS" },
  { value: "windows", label: "Windows" },
  { value: "other", label: "Something else" },
];

/**
 * Best guess at the visitor's desktop OS, used only to pre-fill the platform
 * select — which stays editable, because the guess is sometimes wrong.
 *
 * Kept local rather than shared with DownloadCards on purpose: it is eight
 * lines, and it keeps each client component readable on its own.
 *
 * Browser-only: never call this during render.
 *
 * @returns {"macos"|"windows"|null}
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

export default function FeedbackForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [platform, setPlatform] = useState("");
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [botField, setBotField] = useState("");
  const [userAgent, setUserAgent] = useState("");

  const [fieldErrors, setFieldErrors] = useState({ email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const appVersion = release.version;

  /* Everything browser-shaped happens here, after mount. */
  useEffect(() => {
    const detected = detectPlatform();
    if (detected) setPlatform(detected);
    if (typeof navigator !== "undefined") setUserAgent(navigator.userAgent || "");
  }, []);

  function resetForm() {
    setName("");
    setEmail("");
    setTopic("");
    setMessage("");
    setFieldErrors({ email: "", message: "" });
    setError("");
    setSubmitted(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    /* Honeypot. A bot filled a field no human can see: pretend it worked and
       post nothing at all. Telling it apart from a real success is the bot's
       problem, not ours. */
    if (botField.trim() !== "") {
      setSubmitted(true);
      return;
    }

    const trimmedMessage = message.trim();
    const trimmedEmail = email.trim();

    const nextErrors = {
      message:
        trimmedMessage === ""
          ? "Please write something — even one sentence helps."
          : trimmedMessage.length > MESSAGE_MAX
            ? `That is ${trimmedMessage.length} characters; the limit is ${MESSAGE_MAX}.`
            : "",
      email:
        trimmedEmail !== "" && !EMAIL_SHAPE.test(trimmedEmail)
          ? "That does not look like an email address. Leave it blank if you would rather not say."
          : "",
    };

    setFieldErrors(nextErrors);
    if (nextErrors.message || nextErrors.email) return;

    setSubmitting(true);
    setError("");

    try {
      const body = new URLSearchParams({
        "form-name": FORM_NAME,
        "bot-field": "",
        name: name.trim(),
        email: trimmedEmail,
        platform,
        topic,
        message: trimmedMessage,
        appVersion,
        userAgent,
      });

      const response = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });

      if (!response.ok) {
        throw new Error(`The form returned ${response.status}.`);
      }

      setSubmitted(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error && submitError.message
          ? submitError.message
          : "The form could not be sent.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const remaining = MESSAGE_MAX - message.length;
  const showCount = message.length >= COUNT_VISIBLE_FROM;

  return (
    <section
      id="feedback"
      className="home__section home__feedback"
      aria-labelledby="home-feedback-title"
    >
      {/* Decorative brand mark closing the page; see the FEEDBACK banner. */}
      <div className="home__feedback-watermark" aria-hidden="true">
        <Image
          className="home__watermark-image"
          src="/courtreel-mark.svg"
          alt=""
          width={1024}
          height={1024}
        />
      </div>

      <div className="home__container home__container--narrow home__feedback-inner">
        <div className="home__section-head">
          <p className="home__eyebrow">Tell me what broke</p>
          <h2 id="home-feedback-title" className="home__section-title">
            This is a test build, and you are the test
          </h2>
          <p className="home__lede">
            CourtReel gets better only from people telling me where it fell over.
            You do not have to be diplomatic or thorough — one sentence is a real
            contribution.
          </p>
        </div>

        {submitted ? (
          <div className="home__feedback-success" role="status">
            <h3 className="home__feedback-success-title">Thank you — that came through.</h3>
            <p className="home__feedback-success-body">
              I read every one of these. If you left an email address I may write
              back with a question; if not, it still counts.
            </p>
            <p className="home__feedback-success-body">
              Something else on your mind?
            </p>
            <button
              className="home__btn home__btn--secondary"
              type="button"
              onClick={resetForm}
            >
              Write another note
            </button>
          </div>
        ) : (
          <>
            <div className="home__feedback-useful">
              <h3 className="home__feedback-useful-title">
                What helps most, concretely
              </h3>
              <ul className="home__feedback-list">
                <li>A shot it missed — roughly where in the video.</li>
                <li>A shot it invented that never happened.</li>
                <li>A stroke typed wrong: a backhand called a forehand.</li>
                <li>Anything that crashed or froze, and what you were doing.</li>
                <li>Anything confusing — a button you could not find.</li>
                <li>
                  How slow analysis was on your machine, and roughly how long the
                  video was.
                </li>
              </ul>
            </div>

            <form
              className="home__feedback-form"
              name={FORM_NAME}
              onSubmit={handleSubmit}
              noValidate
            >
              {/* Netlify keys the submission off this. */}
              <input type="hidden" name="form-name" value={FORM_NAME} readOnly />

              {/* Honeypot: off-screen, out of the tab order, hidden from AT.
                  Only a bot ever fills this in. */}
              <div className="home__visually-hidden" aria-hidden="true">
                <label htmlFor="feedback-bot-field">Leave this field empty</label>
                <input
                  id="feedback-bot-field"
                  name="bot-field"
                  type="text"
                  value={botField}
                  onChange={(event) => setBotField(event.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <div className="home__feedback-row">
                <div className="home__field">
                  <label className="home__label" htmlFor="feedback-name">
                    Your name <span className="home__label-optional">optional</span>
                  </label>
                  <input
                    className="home__input"
                    id="feedback-name"
                    name="name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    autoComplete="name"
                  />
                </div>

                <div className="home__field">
                  <label className="home__label" htmlFor="feedback-email">
                    Email <span className="home__label-optional">optional</span>
                  </label>
                  <input
                    className="home__input"
                    id="feedback-email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    aria-invalid={fieldErrors.email ? true : undefined}
                    aria-describedby={
                      fieldErrors.email ? "feedback-email-error" : "feedback-email-hint"
                    }
                  />
                  <p className="home__field-hint" id="feedback-email-hint">
                    Only so I can ask a follow-up question.
                  </p>
                  <p
                    className="home__field-error"
                    id="feedback-email-error"
                    aria-live="polite"
                  >
                    {fieldErrors.email}
                  </p>
                </div>
              </div>

              <div className="home__feedback-row">
                <div className="home__field">
                  <label className="home__label" htmlFor="feedback-platform">
                    Your system
                  </label>
                  <select
                    className="home__select"
                    id="feedback-platform"
                    name="platform"
                    value={platform}
                    onChange={(event) => setPlatform(event.target.value)}
                  >
                    <option value="">Not sure</option>
                    {platforms.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="home__field">
                  <label className="home__label" htmlFor="feedback-topic">
                    What is this about?
                  </label>
                  <select
                    className="home__select"
                    id="feedback-topic"
                    name="topic"
                    value={topic}
                    onChange={(event) => setTopic(event.target.value)}
                  >
                    <option value="">Pick the closest thing</option>
                    {topics.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="home__field">
                <label className="home__label" htmlFor="feedback-message">
                  What happened?
                </label>
                <textarea
                  className="home__textarea"
                  id="feedback-message"
                  name="message"
                  rows={7}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  maxLength={MESSAGE_MAX}
                  required
                  aria-invalid={fieldErrors.message ? true : undefined}
                  aria-describedby={
                    fieldErrors.message
                      ? "feedback-message-error"
                      : "feedback-message-hint"
                  }
                />

                <div className="home__field-foot">
                  <p className="home__field-hint" id="feedback-message-hint">
                    One sentence is plenty. Required.
                  </p>
                  {showCount ? (
                    <p className="home__char-count" aria-live="polite">
                      <span className="home__numeric">{remaining}</span> characters left
                    </p>
                  ) : null}
                </div>

                <p
                  className="home__field-error"
                  id="feedback-message-error"
                  aria-live="polite"
                >
                  {fieldErrors.message}
                </p>
              </div>

              {/* Context I would otherwise have to ask for. */}
              <input type="hidden" name="appVersion" value={appVersion} readOnly />
              <input type="hidden" name="userAgent" value={userAgent} readOnly />

              <div className="home__feedback-actions">
                <button
                  className="home__btn home__feedback-submit"
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? "Sending…" : "Send it"}
                </button>
              </div>

              {/* A broken form is never a dead end. */}
              <p className="home__form-error" role="status" aria-live="polite">
                {error ? (
                  <>
                    <span className="home__form-error-text">
                      That did not send. {error}
                    </span>{" "}
                    <span>
                      Nothing is lost — copy your note and email it to{" "}
                      <a className="home__link" href="mailto:{{CONTACT_EMAIL}}">
                        {"{{CONTACT_EMAIL}}"}
                      </a>
                      .
                    </span>
                  </>
                ) : null}
              </p>

              <p className="home__feedback-fallback">
                Rather just email me?{" "}
                <a className="home__link" href="mailto:{{CONTACT_EMAIL}}">
                  {"{{CONTACT_EMAIL}}"}
                </a>
              </p>
            </form>
          </>
        )}
      </div>
    </section>
  );
}
