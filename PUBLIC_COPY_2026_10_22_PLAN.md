# Public copy update — 22 October 2026

## Scope and execution plan

1. Apply the final approved English wording to Home, About, Services and Contact.
2. Preserve the existing design: typography, sizing, spacing, breakpoints, imagery, videos, colour treatments, links and animation choreography.
3. Change Home portfolio/review heading tags to H2 with their existing visual styling. Show the two saved Home portfolio captions on desktop as explicitly requested.
4. Keep the new shared-footer wording restricted to `/`. Keep the existing telephone CTA and WhatsApp link.
5. Leave saved Home descriptions, introduction, image alts, reviews and project identities untouched. No database migration or content write is needed for these source edits.
6. Owner runs scoped lint, TypeScript and production build, then reviews desktop/mobile rendering. Push and deployment follow only after the results are reviewed.

## Implemented

- Home headline uses the approved editorial wording in every existing animation frame.
- Home style message uses its approved two lines with destinations on a separate line.
- Home-only footer CTA; existing call action retained.
- Semantic Home H2s, preserving saved heading words and existing styling.
- Optional persistent project caption enabled only for the Home grid receiving saved content; titles, locations, images, links and order still come from those records.
- About introduction, FAQ introduction and approved answers; booking answer retained. Approved preview and delivery sentences are shared with Services.
- About quote spacing corrected; signature and rotating poetic quotations retained.
- Services has the three approved descriptions and eight process steps in the approved order. Safety appears once in the wedding-day step. Automation 009 is untouched.
- Contact changes are limited to the message placeholder and explanatory paragraph. Validation, fields, submit action and inquiry-to-lead flow are untouched.

## Checkout differences and unresolved acceptance

- The old About title exists only as a hidden H1 in this checkout. Its words are updated in that same hidden position. The visible Fine Artist / Lover of Life hero is preserved. Implementing a different visible central title requires clarification of the intended existing element; no extra heading has been added.
- Home headings and card identities are database-managed. This implementation preserves those saved values; it does not rewrite them to match local fallback data. Owner must confirm the live saved Claire & Thanos / Laura & Alex captions and headings.
- Services now has three approved cards instead of five old descriptions. Existing card components, animation implementation and image pools remain; the stacking section's existing length-derived duration adjusts to the card count.
- Longer approved text must be checked at narrow widths and short viewport heights. No font-size, fixed-height, spacing or breakpoint changes are included to compensate for copy length.
- Source attribution of testimonials #3 and #9 remains unverified. Locations for Anthi & Anastasis and Leeam & Natalie remain unverified. Do not invent replacements.
- Publications await authoritative links. Destination landing pages and other project SEO are out of scope.

## Owner verification

Run `powershell -ExecutionPolicy Bypass -File .\scripts\verify-public-copy-2026-10-22.ps1` from the project root. It does not migrate, seed, send email, trigger automation, push or deploy. Existing lint findings may appear in legacy components; retain the log for review.

After a successful build, use the local preview to check:

- Home H1 and SEO title are unchanged. Saved meta description, alts, featured descriptions and personal introduction are retained.
- Home headline after multiple animation cycles, separate destination line, exact portfolio/review H2 words, and permanent card captions on desktop/mobile.
- New footer wording only on Home. Other public pages and private offers keep their existing footer copy. Call and WhatsApp still work.
- About approved paragraphs and FAQ answers, original signature, poetic quotation and corrected AND TIMELESS spacing. Hidden H1 remains hidden.
- Services three cards and all eight accordion steps, including booking before planning, 60-day timeline, 25-photo preview, 12–16 week delivery, prints and album copy. Expand every step.
- Contact text and placeholder at 320/375px and desktop widths. Inspect the existing form wiring without submitting a production lead.
- No clipping, horizontal overflow, changed photo/link order or animation regression. If longer copy does not fit, report the exact viewport before making any design changes.

## First owner verification and follow-up

Owner supplied results: TypeScript and production build passed. Scoped lint found one Services hero mount-effect error, an unused About FAQ import and a React Hook Form subscription warning. The mount update now runs in a cancellable animation-frame callback, the unused import is removed, and the existing form field subscriptions use `useWatch`. No design classes, validation rules or submission handlers changed in this follow-up. Rerun the owner verifier after these source edits.

## Final owner acceptance

On 22 October 2026 the owner supplied a full PASS for scoped ESLint, TypeScript and production build (verification transcript ended at 10:03:54 +03:00). The owner then reviewed the result, confirmed "looks good", and authorized Git push with existing deployment paths retained.

Status: source implementation and owner verification/visual acceptance completed; Git push authorized; production deployment pending. No migration is required for this release. Keep the established fixed Plesk application/document roots unchanged.
