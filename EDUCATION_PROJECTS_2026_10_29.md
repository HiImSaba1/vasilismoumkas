# Education, project metadata and Contact — 2026-10-29

Source: client email and Contact iPhone/Instagram screenshot in this conversation. Existing Sprint 57 release is not modified by local edits.

## Source changes
- Shared projectHeaderAlt resolves nonblank CRM headerImageAlt first, then matching cover photograph alt, then title/location. Project hero, portfolio slideshow, cards and project social metadata use the helper. No project records are rewritten.
- Shared category mapping handles Baptism/Baptisms and other supported categories explicitly. Unknown categories link to the overall portfolio instead of Editorial. Baptism has a public category entry, usable navigation and sitemap inclusion, separate from the three Home service cards. Category cover uses a real published project's photograph.
- Exact host redirect in next.config.ts: www.vasilismoumkas.com to https://vasilismoumkas.com, permanent (308), preserving path. Next retains query parameters. localhost, staging hostnames and non-www are not redirected by this rule. No broad database middleware expansion, Plesk path/port/DNS change or production configuration write.
- Root metadataBase and sitemap already use the non-www origin. Existing relative internal links remain valid. Email fallback origin aligned; no email template body or saved SEO text rewritten.
- Education added to Pages editor, authenticated media scope, public settings schema and private preview. It reuses versioned draft/publish/restore workflow. SEO settings are a separate record and remain untouched.
- Existing Education layouts, image selection, animation durations/easing/loops and responsive breakpoint retained. Hero/closing copy, 4x4 keyword sequences, images/alt, four section headings/content and buttons are editable. Four row headings are H2 with original visual styles. Section title links now point to real Education anchors rather than nonexistent portfolio categories.
- Online section uses the client's two approved paragraphs verbatim, live by appointment, and INQUIRE ABOUT MENTORING. Old lessons/self-paced body is not rendered. Introduction uses I; service label uses my.
- Education alt descriptions were written after viewing the nine existing source images. They describe the actual photographs, not an imagined mentoring lesson.
- Contact: mobile-only top padding follows measured Navbar height via ResizeObserver; removes the previous 120%/-10% mobile image enlargement. Photograph uses top-aligned object-cover on mobile to protect heads. Desktop dimensions/crop and animation choreography remain as before this batch.

## Verification boundaries
Owner runs scripts/verify-education-projects-2026-10-29.ps1: touched-component lint, expanded offline checks, TypeScript and production build. Codex did not run those commands or access database credentials.

Offline coverage includes approved copy and image preservation, fixed counts/unsafe links, Education-only draft/publish writes, authentication, shared content stale-write/restore protection, header-alt precedence, Baptism aliases and exact host redirect configuration. Offline configuration assertions do not prove the production proxy forwards Host correctly or that an edge redirect is live.

After a new candidate/deployment: inspect actual saved Education SEO title/description, header alts on Eva & George, Suzanna & Alexis, Natasa & Stamatis and Zoi, slideshow, /portfolio/baptism, all four Education H2s and Education draft/preview/publish/restore using a designated owner test. Verify Contact at 320/375/390/430px and desktop, including real Safari and Instagram browser. No Contact form submission is part of these checks.

Use the separate read-only browser audit with an explicit existing origin. It starts no server and changes no ports. Optional live host audit is only meaningful after deployment; predeployment results are a baseline, not proof of this code. If hosting handles www outside Next, report the observed status/location before adjusting hosting. The release procedure must use non-www URLs or explicitly follow the new redirect for health/body checks.

Current state: implemented locally, owner verification and deployment pending. Existing production paths/ports, uploads, rollbacks, database and backups unchanged.
