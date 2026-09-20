---
name: project-website-spec-is-closed
description: The CourtReel website build spec is authoritative and closed — stack, palette, sections and form handling are decided; {{PLACEHOLDER}} values stay literal and are never asked about
metadata:
  type: project
---

The full website build spec was handed over as authoritative project
instructions. Its section 2 says explicitly: the decisions are made, **do not
ask**. Closed decisions worth not re-litigating:

- Next.js 16 App Router, React 19, **plain `.jsx`, no TypeScript**, ESM.
- **Vanilla CSS only** — one `src/assets/css/style.css`, BEM-like with a `home__`
  prefix. No Tailwind, no CSS Modules, no component/icon/animation libraries.
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
which do not exist yet. See [[project-two-courtreel-repos]] and
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
