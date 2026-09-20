# CourtReel website

The one-page site for CourtReel: what the app does, where to download it, and a
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
| `{{MAC_DOWNLOAD_URL}}` | `src/data/release.js` → `mac.url` | Absolute GitHub Releases URL to the `.dmg`. Until it is real, the macOS button renders **"Coming soon"** and is disabled. |
| `{{WIN_DOWNLOAD_URL}}` | `src/data/release.js` → `win.url` | Same for the Windows `.exe`. |
| `{{NN MB}}` (×2) | `src/data/release.js` → `mac.size`, `win.size` | File size as you want it read, e.g. `118 MB`. While it is a placeholder the card shows *"not published yet"*. |
| `{{Apple Silicon}}` | `src/data/release.js` → `mac.arch` | e.g. `Apple Silicon`, or `Apple Silicon & Intel` if the build is universal. The Windows card already says `64-bit`. |
| `{{one line per change in this build}}` | `src/data/release.js` → `notes` | One string per change. Not rendered on the page yet — it exists so the data file is the whole truth about a build. |
| `{{CONTACT_EMAIL}}` (×4) | `src/components/FeedbackForm.jsx` | Your real email. Four spots: the `mailto:` href and the visible link text, in both the error state and the quiet fallback under the form. Find and replace. |

### The domain

There is no `{{DOMAIN}}` token — the domain lives in two real places instead:

- `NEXT_PUBLIC_SITE_URL` in Netlify (see *Deployment*). This is what makes the
  Open Graph image URL absolute, which is what makes the WhatsApp preview work.
- The fallback in `src/app/(site)/layout.jsx`: `"https://courtreel.app"`. Change
  it if the real domain differs, so a local build is not lying.

### Missing brand assets

None of these exist. None of them is `import`ed either — a static import of a
missing file fails `next build` — so the site builds and looks correct without
them. Each one is behind an `available` flag or a metadata reference that simply
starts working once the file is on disk.

| File | Size / format | Used by | To switch on |
| --- | --- | --- | --- |
| `public/courtreel-mark.svg` | Hairline sketch strokes. **Never render it below ~64px** — the strokes disappear. | `src/components/Hero.jsx` | Drop the file in, set `brandMark.available` to `true`. Until then the hero is a plain text hero, which is deliberate: no grey slab in the opening screen. |
| `public/icon.png` | 1024×1024 app icon | Not wired yet | Drop it in `public/`. For a favicon the simplest route is to put a copy at `src/app/icon.png` — Next picks that up automatically, no code. `layout.jsx` has a comment saying no favicon is declared *because* this file does not exist; delete the comment when it does. |
| `public/og.png` | 1200×630 social preview | `src/app/(site)/layout.jsx` metadata | Nothing to flip. The metadata already points at `/og.png`; the moment the file exists, link previews start working. Needs `NEXT_PUBLIC_SITE_URL` set to be absolute. |
| `public/screenshots/calendar.png` | 16:10, ideally 1600×1000 | `src/components/Screenshots.jsx` | Drop it in, set that entry's `available` to `true`. |
| `public/screenshots/player.png` | 16:10 | `src/components/Screenshots.jsx` | Same. |
| `public/screenshots/shots.png` | 16:10 | `src/components/Screenshots.jsx` | Same. |

**What flipping `available` involves:** nothing but the boolean. Each component
holds a small local array (`shots` in `Screenshots.jsx`, `brandMark` in
`Hero.jsx`) with `src`, `alt` and `available`. False renders a labelled
placeholder naming the missing screen; true renders `next/image` with the alt
text that is already written. One character, no other edit anywhere.

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

1. Build the app and upload both files to **GitHub Releases** as release assets.
2. Copy the two asset URLs.
3. Edit `src/data/release.js` — and nothing else:
   ```js
   export const release = {
     version: "1.2.0",
     releasedAt: "2026-04-11",
     mac: { url: "https://github.com/…/CourtReel-1.2.0.dmg", size: "118 MB", arch: "Apple Silicon" },
     win: { url: "https://github.com/…/CourtReel-1.2.0.exe", size: "104 MB", arch: "64-bit" },
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
- **Server components by default. Exactly three client components:**
  `DownloadCards.jsx`, `InstallNotes.jsx`, `FeedbackForm.jsx`. If a fourth file
  ever needs `"use client"`, that is a decision worth stopping over, not a
  reflex. Anything the browser knows — the OS guess, the user-agent string — is
  read in an effect *after* mount, never during render, so the server HTML and
  the first client render always agree and hydration never mismatches.
- **One `<h1>` on the page**, and it belongs to the hero. Every section uses
  `<h2>` and carries `aria-labelledby`.
- **Clay (`--color-clay`) is rationed.** It is the brand dot, the hero rule, the
  detected-platform outline on a download card, links, and the feedback submit
  button. The primary download buttons are deliberately ink, not clay. Note that
  clay measures 4.27:1 on `--color-stage`, so clay *text* belongs on paper or on
  an elevated card, never directly on a stage-coloured background.
- **Missing-asset convention:** never `import` an image that is not on disk
  (it fails the build). Declare it in a local array with an `available` flag —
  see §1.

---

## 7. Known deviation: `--color-text-secondary`

The spec mandates 4.5:1 minimum contrast and also specified
`--color-text-secondary: rgba(20, 18, 12, .58)`. Those two statements
contradict each other: `.58` measures **4.428:1** against `--color-paper`
(`#f4f3ee`), which fails.

The alpha was nudged to **`.6`**, measuring **4.73:1** on paper and 4.51:1 on
`--color-stage`. The difference is invisible; the compliance is not. A comment
on the line in `style.css` records the original value.

**`--color-clay` was left exactly as specified** at `#b04a2f` (4.89:1 on paper) —
the spec says do not lighten it, and it does not need lightening.
# courtreelwebsite
