# CutShot website

The one-page site for CutShot: what the app does, where to download it, and a
form for testers to tell you what broke.

Next.js App Router, plain `.jsx`, one CSS file, deployed on Netlify. No backend.

---

## 1. Placeholder checklist — do this in one pass

Nothing on the list generates itself. Everything here is a literal
`{{PLACEHOLDER}}` in the code or a file that does not exist yet. Grep with
`grep -rn '{{' src` any time you want to re-check.

### Text placeholders

| Placeholder | Where | What to put there |
| --- | --- | --- |
| `{{YYYY-MM-DD}}` | `src/data/release.js` → `releasedAt` | The release date. Not currently rendered anywhere, but keep it true — it is the record of when this build went out. |
All of these were filled in on 2026-09-22 for the 1.2.0 release: `release.js`
carries real URLs, sizes and dates, and `FeedbackForm.jsx` carries the real
address. The table is kept as the description of what each field is for.

| Field | Where | What goes there |
| --- | --- | --- |
| `releasedAt` | `src/data/release.js` | The release date. Not rendered, but keep it true — it is the record of when a build went out. |
| `mac.appleSilicon.url`, `mac.intel.url` | `src/data/release.js` | Absolute GitHub Releases URLs to the two `.dmg` files. macOS needs two builds: one executable cannot serve both CPUs. Until a URL is real, that button renders **"Coming soon"** and is disabled. |
| `win.url` | `src/data/release.js` | Same for the Windows `.exe`. |
| `size` (×3) | `src/data/release.js` | File size as you want it read, e.g. `186 MB`. While it is a placeholder the row shows *"not published yet"*. |
| `arch` (×3) | `src/data/release.js` | Labels the download rows and the buttons: `Apple Silicon (M1–M4)`, `Intel`, `64-bit`. |
| `trial.days`, `trial.contact` | `src/data/release.js` | The trial length the download section quotes, and the address the "email me for a key" link points at. The app asks for a key on first launch, so this is not decoration. |
| `notes` | `src/data/release.js` | One string per change. Not rendered on the page yet — it exists so the data file is the whole truth about a build. |

### The domain

There is no `{{DOMAIN}}` token — the domain lives in two real places instead:

- `NEXT_PUBLIC_SITE_URL` in Netlify (see *Deployment*). This is what makes the
  Open Graph image URL absolute, which is what makes the WhatsApp preview work.
- The fallback in `src/app/(site)/layout.jsx`: `"https://cutshot.app"`. Change
  it if the real domain differs, so a local build is not lying.

### Missing brand assets

`public/cutshot-mark.svg` (hero logo) and the four screenshots in
`public/screenshots/` (`calendar.jpg`, `theplayer.jpg`, `analizer.jpg`,
`shotreview.jpg`) are in place. Two brand assets are still missing. Neither is
`import`ed — a static import of a missing file fails `next build` — so the site
builds and looks correct without them; each starts working once the file is on
disk.

| File | Size / format | Used by | To switch on |
| --- | --- | --- | --- |
| `public/icon.png` | 1024×1024 app icon | Not wired yet | Drop it in `public/`. For a favicon the simplest route is to put a copy at `src/app/icon.png` — Next picks that up automatically, no code. `layout.jsx` has a comment saying no favicon is declared *because* this file does not exist; delete the comment when it does. |
| `public/og.png` | 1200×630 social preview | `src/app/(site)/layout.jsx` metadata | Nothing to flip. The metadata already points at `/og.png`; the moment the file exists, link previews start working. Needs `NEXT_PUBLIC_SITE_URL` set to be absolute. |

**Replacing a screenshot or the logo:** overwrite the file in `public/`. Each
component holds a small local array (`shots` in `Screenshots.jsx`, `brandMark` in
`Hero.jsx`) with `src`, `alt` and an `available` flag; setting it to `false`
falls back to a labelled placeholder instead of a broken image. The logo is
served through `next/image`, which is why `next.config.mjs` sets
`dangerouslyAllowSVG` (with a script-blocking CSP).

---

## 2. Setup

Node **20.9+** (this was built on Node 25).

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # what Netlify runs
```

There is no test suite and no linter config. `npm run build` is the gate.

> Note on `npm run dev`: the feedback form POSTs to `/__forms.html`, which only
> Netlify answers. Locally the submit will fail and show the error state plus the
> `mailto:` fallback — that is the failure path working correctly, not a bug.
> To test the form for real, use a Netlify deploy preview.

---

## 3. Cutting a new release

The binaries are ~100 MB. They do **not** go in `public/` — Netlify would have
to serve them and the repo would carry them forever.

1. Build the app — three packages now: `npm run dist:mac` (Apple Silicon),
   `npm run dist:mac:intel` and `npm run dist:win`, each in its own invocation.
2. Upload all three to **GitHub Releases on this repo** and copy the URLs:
   ```bash
   gh release create app-v1.3.0 path/to/*.dmg path/to/*.exe --title "CutShot 1.3.0" --notes "…"
   ```
   The repo is public, so the asset URLs need no login. They are predictable:
   `https://github.com/ValentinoFarias/cutshotwebsite/releases/download/<tag>/<file>`.
3. Edit `src/data/release.js` — and nothing else:
   ```js
   export const release = {
     version: "1.2.0",
     releasedAt: "2026-04-11",
     mac: { url: "https://github.com/…/CutShot-1.2.0.dmg", size: "118 MB", arch: "Apple Silicon" },
     win: { url: "https://github.com/…/CutShot-1.2.0.exe", size: "104 MB", arch: "64-bit" },
     notes: ["Serve detection no longer fires on a ball toss."],
   };
   ```
4. Redeploy (a push to the deploy branch is enough).

The version number shows in the hero, the download cards and the footer, and
rides along with every feedback submission as `appVersion`, so bumping it in one
place is the whole job.

**A placeholder or empty URL is a safe state.** `isDownloadReady()` in
`release.js` returns false for anything nullish, empty, or still containing
`{{`/`}}`, and that button automatically renders as a disabled **"Coming soon"**
— never a link to nowhere. So you can ship a page for a platform whose build is
not up yet and it degrades honestly.

---

## 3b. The download access code

The download buttons are behind a code. It is **not** in this repository — this
repo is public, so a code committed here would be a code anyone can read. It
lives in one environment variable on the host:

```
CUTSHOT_DOWNLOAD_CODE=TENNISCOTHAM
```

Set it in **Netlify → Site configuration → Environment variables**, then
redeploy. Changing the code later is that one field and a redeploy; no code
change.

**With the variable unset, every download answers 503** and the page says
downloads are not switched on yet. That is deliberate: the alternative is a
fallback code in the source, which is no code at all.

How it works: the page posts the build id and whatever the visitor typed to
`POST /api/download` (`src/app/api/download/route.js`). Only a correct code gets
a URL back, and the browser is then sent to it. The file URLs live in
`src/lib/downloads.js`, which is **server-only — never import it from a
component**, or the links end up in the browser bundle and the gate is
decoration.

**What the gate does and does not do.** It stops a visitor who lands on the site,
and it keeps the URLs out of the page source. It cannot stop anyone who already
has a direct link, or who browses this repo's Releases, since the assets are
public. Anyone who passes the gate once can read the URL in their network tab
and pass it on. Closing that needs private assets and short-lived signed links —
a different job, worth doing only if the downloads ever need to be genuinely
restricted.

---

## 4. Reading form submissions

**Netlify dashboard → Forms → `feedback`.** Every submission lands there with
`name`, `email`, `platform`, `topic`, `message`, plus `appVersion` and
`userAgent` filled in automatically, so you never have to ask "which version?"
or "which OS?".

Two settings worth turning on straight away:

- **Notifications → email notification → `{{CONTACT_EMAIL}}`.** Otherwise you
  only find out by remembering to look.
- **Spam filtering.** There is a honeypot field in the form already (`bot-field`
  — a bot that fills it gets a fake success and nothing is posted), but Netlify's
  own filter catches the rest.

### Never delete `public/__forms.html`

Netlify's build-time crawler registers a form only if it can find it in **static
HTML**. It cannot see a React-rendered form. `public/__forms.html` is a hidden
copy of the form that exists purely to be crawled, and `FeedbackForm.jsx` POSTs
to that same path as urlencoded data.

Delete it, or rename a field in it, and the form silently stops working:
submissions 404 and nothing reaches the dashboard. There is no error anywhere.

The field names must match **exactly**, in both files:

```
form-name   bot-field   name   email   platform   topic   message   appVersion   userAgent
```

If you add a field to the React form, add it to `public/__forms.html` in the
same commit.

---

## 5. Deployment

Netlify, with `@netlify/plugin-nextjs` (already in `netlify.toml` and
`devDependencies`). Build command `npm run build`, publish directory `.next`.

One environment variable:

| Variable | Value | Why |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://your-domain` | Makes the Open Graph image URL absolute. Without it the build falls back to the URL hard-coded in `layout.jsx`, and social previews may point at the wrong host. |

---

## 6. Conventions

Worth knowing before changing anything:

- **Plain `.jsx`, no TypeScript.** There is no `tsconfig.json` and no build step
  that would want one. `jsconfig.json` only provides the `@/*` → `src/*` alias.
- **One vanilla CSS file:** `src/assets/css/style.css`, imported once in the root
  layout. No CSS modules, no Tailwind, no styled-anything.
- **Twelve fixed banner sections in that file, in a fixed order:** tokens, base,
  navbar, hero, how it works, features, screenshots, filming guide, download,
  feedback, footer, responsive. A component's styles go in its own banner and
  nowhere else. **Every `@media` block lives in RESPONSIVE**, smallest to
  largest — the one exception is the `prefers-reduced-motion` kill switch in
  BASE, which is a global reset concern rather than a breakpoint.
- **No magic numbers.** Spacing, radius, type, colour, shadow, motion and focus
  all come from the custom properties at the top of the file.
- **`home__` BEM-like class names** for everything, including the client
  components.
- **Server components by default.** The client components are
  `DownloadCards.jsx`, `InstallNotes.jsx`, `FeedbackForm.jsx`, plus the
  motion-only ones in `src/components/motion/` (see §7). Anything that is not
  interactivity or motion stays a server component and needs a reason to change.
  Anything the browser knows — the OS guess, the user-agent string — is
  read in an effect *after* mount, never during render, so the server HTML and
  the first client render always agree and hydration never mismatches.
- **One `<h1>` on the page**, and it belongs to the hero. Every section uses
  `<h2>` and carries `aria-labelledby`.
- **Clay (`--color-clay`) is the one accent.** It is the brand dot, links, the
  how-it-works progress line, the "work in progress" marks, the detected-platform
  outline on a download card, and the feedback submit button. Full-width clay
  section bands were tried and dropped: sections stay paper or stage. The primary
  download buttons are deliberately ink, not clay. The section eyebrows
  ("Tennis training video", "What it does", …) and the 01–04 step numbers are
  clay too. Plain clay measures only 4.27:1 on `--color-stage`, under the 4.5:1
  floor for small text, so that small text uses `--color-clay-text` (`#a94529`,
  the same orange a touch deeper: 4.62:1 on stage, 5.29:1 on paper). Marks and
  lines keep `--color-clay`; do not use plain clay for small text on stage.
- **Missing-asset convention:** never `import` an image that is not on disk
  (it fails the build). Declare it in a local array with an `available` flag —
  see §1.

---

## 7. Motion layer: GSAP and three.js

The original spec banned animation libraries; **GSAP and three.js were later
allowed, and only those two.** They live in `package.json` as `gsap` and `three`.

- `src/lib/court.js` — the tennis court in metres, once. The SVG fallback and
  both WebGL scenes read it, so they cannot drift apart.
- `src/lib/courtScene.js` — three.js geometry (lines only: no faces, lights or
  shadows). Colours are read from the `--color-ink` / `--color-clay` tokens.
- `src/lib/motion.js` — reduced-motion check, pixel-ratio cap of 2, one-time
  ScrollTrigger registration, the visibility gate, the WebGL probe.
- `src/components/motion/` — one small client component per effect: hero court
  (`HeroCourt`), pinned filming camera (`FilmingCamera`), how-it-works progress
  rule (`HowProgress`), step-3 keycaps (`KeycapSequence`), frame stepper
  (`FrameStepper`), ball-speed calibration (`BallSpeed`) and the screenshot wipe
  (`ShotReveal`). `CourtFallback` is a server component: the static SVG.

The rules that keep it calm: three.js is loaded with `next/dynamic({ ssr: false })`
and gsap with a dynamic `import()`, so neither is in the first-paint bundle; every
WebGL loop stops off-screen and on a hidden tab; a failed context or chunk leaves
the static SVG in place; under `prefers-reduced-motion` no canvas is mounted and
every effect draws its final state once. Every animated block is `aria-hidden`
and sits below prose that says the same thing, so nothing depends on it.

Clay stays rationed: the hero ball and the phone marker in the filming scene are
the only new clay marks. The ball-speed card shows **98 km/h labelled "an example
reading"** — a made-up figure (`EXAMPLE_SPEED` in `BallSpeed.jsx`). If you would
rather not show a number, change the readout there to end on a dash; the four
lit corners are the point of the effect, not the value.

To cut an effect, delete its component's mount from the parent
(`Hero`, `HowItWorks`, `Features`, `Screenshots`, `FilmingGuide`); nothing else
refers to it. The pinned filming scene is the heaviest on the visitor's scroll —
its `pin` option is in `FilmingCameraScene.jsx`.

---

## 8. Known deviation: `--color-text-secondary`

The spec mandates 4.5:1 minimum contrast and also specified
`--color-text-secondary: rgba(20, 18, 12, .58)`. Those two statements
contradict each other: `.58` measures **4.428:1** against `--color-paper`
(`#f4f3ee`), which fails.

The alpha was nudged to **`.6`**, measuring **4.73:1** on paper and 4.51:1 on
`--color-stage`. The difference is invisible; the compliance is not. A comment
on the line in `style.css` records the original value.

**`--color-clay` was left exactly as specified** at `#b04a2f` (4.89:1 on paper) —
the spec says do not lighten it, and it does not need lightening.
# cutshotwebsite
