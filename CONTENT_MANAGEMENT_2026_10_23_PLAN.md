# Website / CRM content management — 23 October 2026

## Scope and state

This batch extends the implemented Phase 1. The owner verified the earlier Phase 1 ESLint, offline questionnaire tests, TypeScript and build. **Those results do not certify this larger batch.** Codex has prepared source changes and owner-run checks; no live database, SMTP, migrations, push or deployment was executed by Codex.

Source requirements: the client's consolidated website/CRM request and supplementary Home mobile email. Preserve approved saved copy and the existing public composition, imagery defaults, animation durations, easing, hover and scroll choreography. Optional content changes take effect only when an administrator explicitly publishes them. No new destination copy or wedding-location association is invented.

## Implemented source

| Area | Entry point and behaviour |
| --- | --- |
| Questionnaire | Client workspace → Edit questionnaire answers; same native/legacy record, answer-only patches, stale-edit rejection, admin/client timestamp, completed client submissions remain locked. No admin-save email, queue or booking/document status mutation. |
| Pages | `/admin/pages` → Home, About, Services, Contact cards; return to hub from each editor. |
| Home | `/admin/pages/home`; all existing stored sections plus editable headline parts/H1, marquee message/keywords and Home-only footer CTA lines. Paragraphs split only at existing blank lines. Existing Bricolage file has OS/2 weight 800 despite its CSS weight declaration; the existing local variable Roboto is scoped to intro paragraphs below 768px, weight 300. Desktop font is retained. SVG CTA arrow and word-level headline wrapping retain animations. |
| About | Public introduction, hero video/copy, signature, highlighted quote, biography text/headings/tags/images, gallery images/alt/captions and quotes, FAQ title/introduction, add/reorder/hide FAQ. Defaults retain existing random gallery and highlighted quotes. |
| Services | Hero text/image, existing image pools or chosen replacements, three fixed service cards with image/alt/caption and descriptions, Process & Journey add/reorder/hide, existing CTA text/link. Fixed service-card count protects the animation geometry. |
| Contact | Existing copy plus heading, label, video, optional image override/alt/caption and button label. Empty image inherits the shared Website Contact image; an override affects only Contact. |
| Content safety | Save draft, private saved preview, explicit publish, last 12 previous public snapshots, restore into editable draft, public/draft version conflict rejection. Shared fields are labelled. Current legacy Home/Website/SEO editors remain available and save directly; Home saves use version checks, retain previous public versions and preserve the saved draft. The new page workspace detects later changes before publishing. |
| Internal links | Select public page/project/destination links for buttons. Supported paragraph fields offer selection-based insertion using `[label](/internal/path)`; render through a restricted parser without HTML. Headings, image alt, labels and placeholders remain plain text. |
| SEO | `/admin/seo` retains existing metadata/business/project controls. `/admin/seo/coverage` includes primary, ancillary and destination pages and portfolio projects; main SEO overrides, independent social fields/images, previews, explicit inheritance and noindex. Canonical is fixed to each real public route. |
| Sitemap/private routes | Published destination/project URLs only; noindex overrides omitted. Questionnaire/admin/offer/portal/timeline get private indexing protection; private URLs never enter sitemap. |
| Headings/schema | Semantic H2/H3 added to existing About/Services content with visual styles retained. Ancillary missing H1s supplied invisibly. Business schema uses saved business details and current services; unverified static five-star aggregate, opening hours and price claims removed. Address remains conditional on confirmation. About FAQ schema uses only visible public FAQs. |
| Redirects | `/admin/seo/redirects` handles optional /legacy/... public paths through a dedicated handler, HTTP 301; current routes retain precedence. No global database-backed middleware was added. Project renames write old→new history in the same transaction as project/gallery records, flatten earlier aliases and retain static-source tombstones; only project routes perform a redirect lookup. |
| Destinations | `/admin/destinations`; shared public template under `/destinations/{slug}`, separate copy/H1/SEO/images/alt/captions/sections/FAQ, real published wedding selection, private draft/preview, publication/unpublication and revision restore. Slug remains fixed after choosing it. No pages are automatically created/published. |
| Contact save safety | Lead is persisted before the internal email. If internal SMTP fails, the saved lead is still acknowledged; the form awaits the request. No automatic Template 000 is sent or scheduled. |

## Storage and boundaries

- Uses existing `site_settings`: `public_page_*_v1`, `homepage_content_v1`, `workspace:{key}`, `public_seo_overrides_v1`, `destination:{slug}`, `public_retired_redirects_v1`, `public_project_redirects_v1`.
- No schema migration, Plesk path change or production activation is required to implement this batch. Deployment remains a separate owner-run phase.
- Draft and publish writes are transactional, with version checks against both public content and workspace. First-save conflicts fail rather than overwrite a competing editor.
- The public content editors do not import offer/email/document template mutation logic.
- Preview requires admin auth and noindex. Contact submission is disabled in that preview. It renders the same page components and site providers as the public route.
- Automatic approval review rejected an initial global redirect middleware proposal because of broad routing/database impact. The implementation instead uses a handler restricted to /legacy/... for optional retired links and an exact project-route matcher for project aliases.

## Owner verification — next step

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\verify-content-management-2026-10-23.ps1 -Screenshots
```

Stages: scoped ESLint → earlier questionnaire regressions → offline workspace/SEO/destination/Contact tests → TypeScript → production build → local Edge Home screenshots and public metadata/heading/sitemap audit. The browser audit requests local public routes; it never submits a form. The mocked Contact checks use fake lead storage and fake SMTP only.

Evidence: timestamped transcript/ESLint logs in `artifacts/verification`, Home screenshots including desktop headline in `phase1-home-2026-10-23`, public SEO report `content-seo-browser-2026-10-23.json`. Preserve all evidence. A local Home with older one-paragraph saved content produces a REVIEW notice; the script does not replace that copy or certify the approved three-paragraph version.

## Runtime acceptance after code checks pass

Use a designated test environment and test records; do not use a real couple's signed/completed booking for acceptance. Inspect the selected database/environment before making these intentional writes. These actions are **not** run by the verifier.

1. In Pages, open each card and return. Save an About draft, preview it, verify the public page is unchanged, then publish. Restore a previous snapshot into a draft and publish it. Open two editor windows; verify stale saves fail without overwriting the newer save.
2. Add/reorder/hide a FAQ and journey entry. Verify hidden entries are absent publicly and FAQ schema follows visibility. Confirm offers and email templates retain their prior contents.
3. Choose an image from the existing library and edit its alt/caption. Confirm old defaults remain until explicit selection. Test an inline internal link in an introduction and a button link from the list.
4. Edit two answers on a completed test questionnaire; verify untouched answers/status and original submission date remain. Reload the admin and portal; verify corrected answers and admin timestamp. No email, automation, invoice, contract or booking change should result.
5. Review mobile 320/390/430px and desktop 1024/1440px; check paragraph readability and the complete word ITALY, resize behaviour, original animation/hover and actual iPhone monochrome arrow. Review the exact approved three-paragraph Home on the environment where it is stored; local fallback screenshots alone do not prove this.
6. Review SEO inheritance/custom values against rendered metadata, confirm noindex/sitemap behaviour on a test page, and exercise one /legacy/... URL 301. Rename only a designated test project, verify the exact old URL returns 301 and old image paths remain available. A project cannot reuse a historical alias slug.
7. Create a destination draft with client-supplied text and genuinely related published weddings. Confirm anonymous draft URL is 404; save/preview without publishing, then explicitly publish and check sitemap. Unpublish and verify 404/sitemap removal. No invented destination copy should be used to fill production content.
8. Separately submit one clearly marked Contact test inquiry, note the lead ID, verify one lead and one internal notification. Inspect that test lead's queue/delivery history: no sent or scheduled Template 000. This test deliberately creates a record and sends internal email, so keep it separate from the offline verifier. Do not expose recipients, passwords or personal answers in returned evidence.

## Delivery status

Implementation prepared; expanded checks and interactive acceptance pending. No time/cost figures are invented. Public design is intended to remain unchanged except the expressly requested mobile readability correction; visual equivalence and iPhone behaviour require owner acceptance.
