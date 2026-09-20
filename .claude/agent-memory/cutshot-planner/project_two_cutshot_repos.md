---
name: project-two-cutshot-repos
description: "cutshot website" is the marketing site, a DIFFERENT repo from the CutShot Electron app — the planner's roadmap.md/STATUS.md and the recall-first priority ladder belong to the app, not here
metadata:
  type: project
---

There are two separate CutShot codebases. This working directory
(`.../09 - 2026/cutshot website`) is the **public one-page marketing site**
(Next.js 16 App Router + vanilla CSS + Netlify Forms, no CMS, no DB). The
CutShot **app** (Electron, YOLO → pose → event detector → stroke classifier)
lives elsewhere and is the thing the site advertises.

**Why:** the cutshot-planner agent definition is written for the app — it says
to open `roadmap.md`, `STATUS.md` and an architecture-decisions file, and to
prioritise `broken > candidate recall > infra > classifier`. None of those files
exist in the website repo and the recall ladder has no meaning here. Confirmed
empty on 2026-09-20: no git repo, no roadmap, no STATUS.

**How to apply:** when invoked in the website directory, say once that the app's
roadmap/STATUS do not exist here, then translate the ladder to its website
analogue — *broken/half-done > blocks everything else (scaffold, tokens, layout)
> content sections > polish*. Do not go hunting for the app's roadmap or invent
its contents. Keep using the `T<n>` / `auto/T<n>-<slug>` naming so both projects
read the same way. See [[project-website-spec-is-closed]].
