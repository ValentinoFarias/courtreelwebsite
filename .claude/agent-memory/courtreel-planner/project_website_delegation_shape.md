---
name: project-website-delegation-shape
description: How CourtReel website work is chunked and delegated — three sequential tasks over one shared CSS file, and the fact that the coder/ml-specialist agent types do not exist in this environment
metadata:
  type: project
---

**The `coder` and `ml-specialist` agent types named in the planner's output
format do not exist in this environment.** Available types are `general-purpose`,
`claude`, `Explore`, `Plan` and the Vercel specialists. Keep writing
`DELEGA A: coder` in the plan block (it tells Valentino who should own it), but
actually spawn `general-purpose`.

**Chunking that worked (session 1, 2026-09-20 — site built end to end):**
T1 scaffold + `style.css` tokens/base/primitives → T2 the seven static server
components + `HomePage` assembly → T3 the three `"use client"` components +
README. Each verified with a clean `npm run build` before the next started.

**Why sequential, never parallel:** every component writes into the *same*
`src/assets/css/style.css`, under its own fixed banner. Two agents in that file
at once collide. The twelve banners exist precisely so sequential agents never
reorder it.

**How to apply:** a subagent starts cold, so each delegation must restate the
closed constraints (no TypeScript, no new deps, vanilla CSS, which files are
`"use client"`) and name T1's exact token and primitive class names to reuse —
otherwise it invents parallel ones. Tell it to read `style.css` and one existing
component first. Also tell it explicitly **not** to run `git init` or commit;
Valentino owns version control. See [[project-website-spec-is-closed]].
