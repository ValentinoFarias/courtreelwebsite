---
name: project-website-spec-is-closed
description: The CutShot website build spec is authoritative and closed — stack, palette, sections and form handling are decided; {{PLACEHOLDER}} values stay literal and are never asked about
metadata:
  type: project
---

The full website build spec was handed over as authoritative project
instructions. Its section 2 says explicitly: the decisions are made, **do not
ask**. Closed decisions worth not re-litigating:

- Next.js 16 App Router, React 19, **plain `.jsx`, no TypeScript**, ESM.
- **Vanilla CSS only** — one `src/assets/css/style.css`, BEM-like with a `home__`
  prefix. No Tailwind, no CSS Modules, no component/icon libraries. Animation
  libraries were banned too, **except GSAP and three.js, allowed since
  2026-09-20** (see the amendment at the bottom).
- No CMS, no database, no server code. Content is hardcoded in components; the
  only mutable file is `src/data/release.js`.
- Netlify Forms for feedback, via the `public/__forms.html` crawler-bait trick
  (Netlify cannot see React-rendered forms — without that file, submissions 404).
- Light theme only. Clay `#b04a2f` is the single rationed accent; the primary
  button is ink `#14120c`, not clay. Do not lighten clay (4.9:1 on paper).
- Product facts (section 3) are fixed — never invent app features on the page.

**Why:** Valentino wrote the spec after the decisions were already made in the
app itself; re-opening them costs time and drifts the site away from the app's
own visual language.

**How to apply:** treat `{{DOMAIN}}`, `{{MAC_DOWNLOAD_URL}}`, `{{CONTACT_EMAIL}}`
etc. as literal strings to ship, collected into a checklist at the top of the
README — never as questions for the user mid-task. Same for the brand assets,
which do not exist yet. See [[project-two-cutshot-repos]] and
[[reference-website-external-systems]].

## The one sanctioned deviation from the spec (2026-09-20)

`--color-text-secondary` ships at alpha **`.6`**, not the `.58` the spec's token
block gives verbatim. Measured independently: `.58` = **4.428:1** on
`--color-paper`, which **fails** the spec's own 4.5:1 floor in section 10; `.6` =
**4.73:1** and also clears 4.5 on `--color-stage`. Visually indistinguishable.

**Why:** the spec contains an internal contradiction — a verbatim token that
violates its own stated accessibility minimum. The floor wins.

**How to apply:** do **not** "restore" `.58` on a future read of the spec. The
line carries an explanatory comment and the README records it. Related measured
facts: `--color-clay` is 4.9:1 on paper (spec says do not lighten it — correct,
leave alone) but only **4.27:1 on `--color-stage`**, so clay text must stay off
stage-backed areas; in the download section it lives inside elevated cards.

## Amendment: more clay in small marks, but not in bands (2026-09-20)

Valentino found the page too flat. Clay now also colours the how-it-works
progress line and the hand-drawn "Work in progress" marks on Features
(handwriting font: Caveat via `next/font/google`, self-hosted). He also tried
full-width clay section bands (Screenshots, Download, footer) and **rejected
them** — do not put clay backgrounds on sections again. Sections stay paper or
stage; the primary button stays ink. Section eyebrows and the 01–04 step
numbers are clay, using `--color-clay-text` (`#a94529`), a slightly deeper clay,
because plain clay is 4.27:1 on stage and fails the 4.5:1 floor for small text.

## Amendment: GSAP and three.js are allowed (2026-09-20)

Valentino lifted the spec's "no animation libraries" ban for **GSAP (+ ScrollTrigger)
and three.js only**. Every other library ban still stands, and no other library
is implied by this.

**Why:** he wants richer motion on the page. The ban had no stated reason in the
spec; the likely ones were page weight and the calm "instruction manual" tone.

**How to apply:** three.js goes in a lazy-loaded client component (it is the
heaviest thing on the page, and visitors are often on phones), with a static
fallback if WebGL fails and rendering paused off-screen. Honour
`prefers-reduced-motion` (static final states, no WebGL loop) and never let
motion hide content. The rest of the spec is unchanged: light theme, clay
rationed, no gradients/glassmorphism/neon, stroke colours only for the five
stroke types, logo mark never under ~64px. The spec's "at most a subtle
fade/rise on scroll" motion line is superseded for these two libraries, but the
calm tone is not.

**Status (2026-09-20): implemented.** The designer's motion pass is in the repo:
`gsap` + `three` installed, `src/lib/{court,courtScene,motion}.js` and
`src/components/motion/*` added, five server components edited to mount them.
Nine `"use client"` files now exist for motion (README §7). One post-import fix:
`HeroCourtScene.jsx` camera was re-framed because the near baseline was cropped.
