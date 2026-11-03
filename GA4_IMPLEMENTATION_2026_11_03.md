# GA4 — 03 November 2026

Measurement ID: G-DPY8NZFS7Z. Web stream: website / 16260852907.

Implementation: basic consent (Google script absent until Accept), persisted Accept/Decline, public editorial route allowlist, canonical page locations without queries/fragments, no external or private referrer, manual initial/navigation page_view with duplicate suppression. Admin/private pages and preview excluded; localhost does not send. Existing banner appearance unchanged. No migrations or environment/port/path changes.

## REQUIRED before deployment
In the correct Analytics property: Admin → Data collection and modification → Data streams → website → Enhanced measurement toggle OFF → confirm/save. Disable the whole enhanced-measurement group for this initial bounded release: manual page views own navigation, and automatic clicks/form events must not collect form details or private destinations. This is a Google-side setting; code cannot certify it. Ask Vasilis for confirmation/screenshot before activating the release.

Google documentation: https://developers.google.com/analytics/devguides/collection/ga4/views (send_page_view:false alone does not disable enhanced history events).

## Owner live acceptance after activation
Clean browser: before choice and after Decline, no googletagmanager script or g/collect. Refresh: Decline retained. Fresh session Accept: script once, one page_view for current route. Home → About → Portfolio → Contact: one page_view each, matching G-DPY8NZFS7Z, title and canonical path. Re-render should not repeat. No query/hash/private link sent. Open admin/offer/portal: no analytics events. Check browser network without adblock; Vasilis must confirm received events in correct property's Realtime (DebugView requires debug-enabled testing). Check internal/developer filters before interpreting results. No claims about historic data recovery.

## Verification
scripts/verify-ga4-2026-11-03.ps1 performs scoped lint, mocked browser contracts, TypeScript and build. Tests send no Google events or real emails. Browser and Realtime proof remain separate deployment gates.
