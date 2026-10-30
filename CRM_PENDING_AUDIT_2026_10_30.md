# CRM audit — 2026-10-30

## Evidence and status
- Previous website requests were deployed in Sprint 58. Owner-run bundle, routes, non-www redirect and cleanup passed in the conversation; owner accepted the website. No new website deployment in this batch.
- Read-only browser visit to the affected lead: Baptism EL, draft offer, no active client workspace. Internal notes contain the owner's corrected financial statement; notes are not payment-ledger entries.
- Read-only document-template UI: Baptism GR questionnaire, contract and invoice are active workflow defaults. No template was edited. This does not replace database schema/log verification.
- Client-list UI shows an existing different booking on the same event date. Both activation paths call a shared function that rejects any second client on one date. This is a supported blocking path; exact error references still need log correlation. No acceptance was retried in production.

## Implemented locally; not certified or deployed
- Date collisions still block by default. Admin may explicitly confirm additional capacity with a reason; the date lock is retained, and the override is logged inside the transaction. Public acceptance cannot pass an override.
- Offer acceptance fields are controlled, retaining selected package/name/email and confirmation inputs on action error. Manual admin acceptance suppresses its internal acceptance email. It does not create client-email delivery evidence or paid invoice amounts.
- Guided workspace creation uses an inline action result instead of an uncaught error. It creates/opens a workspace only; it does not itself create the complete booked-client import workflow. A second linked-client check after acquiring the lead row lock reduces duplicate creation on concurrent retries.
- New Pending tab consolidates current workflow actions, waiting/next steps and existing automation reminders. Workflow completions remove the related active item on revalidation. Existing journey and automation history remain linked; no records were deleted.
- Bell now lists recent new leads, Contact-created leads and clients, not old workflow obligations. This is not IMAP/mailbox monitoring. Read acknowledgement is browser-local; initial use baselines existing entries, history window 7 days/max 100. No new notification DB table or emails.
- Modal is portalled to document.body, centred at 70vw/70vh with small-screen bounds, internal scrolling, Escape and focus trapping. Typography was enlarged per owner feedback.
- Sidebar title: single-line Moumkas CRM, reduced spacing. Duplicate name beside bell removed. Header shows active section; shared page subheading is a span with text-xl and line-height 1.1em. Pending history links are outlined buttons.
- Local development tolerates only ER_NO_SUCH_TABLE for site_settings, with a visible console notice and public defaults. Production errors, other missing tables, auth errors and all writes remain fail-closed. Image sizes added to biography and 404 background. Local overview 404 was observed; no source route was missing, and restart/recheck remains needed before claiming resolution.

## Not complete
1. Run redacted read-only diagnostic for error-reference correlation and schema/index checks. No root-cause-specific database repair is authorised by a browser observation alone.
2. Owner verifies capacity for a second same-day booking, then performs activation only after verified deployment. Do not delete the other booking or silently bypass capacity confirmation.
3. Actual agreed total 750, received 650, remaining 100 have not been written by Codex. Historical 100 deposit must not become an additional payment. These values must be reconciled against real invoice/payment fields before owner entry; generic offer acceptance currently creates an unpaid invoice by design. Payment dates/methods remain unknown, never fabricated.
4. Separate booked-client intake form is still a proposal, not implemented: atomic link/create of lead, agreed collection, client, portal, native documents and actual receipts; external-completion evidence without fake signature/email; idempotency and field-preserving errors. Inventory existing workspace/payment APIs first, then estimate effort. Currency cost requires the developer's agreed rate; no quote invented.
5. Full requested Pending scope is not done: explicit scheduled follow-up dates, independent contract/questionnaire/payment rows, agreed payment due dates, four-calendar-month delivery deadline with 15-day warning, date/category filters and controlled manual completion with audit. Do not label invoice balance overdue from the event date. Reuse persisted invoice/document/production evidence before adding schema.

## Owner commands
- scripts/diagnose-baptism-2026-10-30.ps1: bounded SELECT-only transaction and redacted log-reference lookup. It displays no contact details, note contents, portal URLs, credentials or raw logs; does not restart applications.
- scripts/verify-crm-pending-2026-10-30.ps1: scoped ESLint, fake transaction/date/pending/fallback/auth tests, existing content/questionnaire checks, TypeScript and build. Owner must stop the local dev server before the production build to avoid overlapping build output; ports and production paths stay unchanged.

No scripts above were executed by Codex. No production CRM mutation, real payment, email, automation, migration or deployment performed.
