---
name: reference-website-external-systems
description: Where CourtReel website things live outside the repo — installers on GitHub Releases, form submissions in the Netlify dashboard, hosting on Netlify
metadata:
  type: reference
---

- **Installers (.dmg / .exe, ~100 MB each)** live on **GitHub Releases**, never
  in `public/` and never in the Netlify bundle. Cutting a release = upload the
  binaries there, paste the URLs into `src/data/release.js`, redeploy.
- **Feedback submissions** land in the **Netlify dashboard → Forms → `feedback`**,
  plus email notifications to `{{CONTACT_EMAIL}}`. There is no database to query
  and no API to read them from.
- **Hosting/deploys:** Netlify with `@netlify/plugin-nextjs`. The only env var is
  `NEXT_PUBLIC_SITE_URL` (absolute OG URLs). Note the project has Vercel skills
  and MCP available in the environment — ignore them, this site is Netlify.

**How to apply:** when asked "where do I see the feedback" or "how do I ship a
new version", point at these, not at the repo. See
[[project-website-spec-is-closed]].
