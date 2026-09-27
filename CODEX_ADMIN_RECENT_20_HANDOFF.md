# Moumkas Admin CRM — latest 20 implementation handoff

Updated: 3 September 2026  
Workspace: `C:\Users\sab_j\Desktop\Projects\moumkas-new\moumkas-awwwards`

## Mandatory startup

Read this file and then `codex_agent_instructions.md` completely. For a tab-by-tab functional map, button behavior, workflow/email/automation process and reusable admin patterns, also read `ADMIN_PANEL_OPERATIONS_AND_REUSE_GUIDE.md`. Inspect current source and the newest relevant file in `artifacts/verification/` before editing. Codex implements code/scripts; the owner runs PowerShell verification, migrations, builds, deployment, SMTP and production checks. Never expose secrets or treat local PASS as Papaki deployment evidence.

Stack: Next.js 16 App Router, React 19, TypeScript, MySQL/MariaDB, Nodemailer. Product: bilingual wedding/baptism photographer CRM with one persistent event-plus-language workflow profile.

## Latest 20 implementation blocks

### 01 — Responsive portfolio and reusable imagery

- Mobile galleries preserve natural ratios; desktop metro/parallax remains separate.
- Portfolio uploads record dimensions and supply reusable email images.
- Files: `src/components/sections/Projects/ProjectCard.tsx`, `ProjectContent.tsx`, `src/app/admin/portfolio/PortfolioGalleryInput.tsx`, `PortfolioForm.tsx`, `actions.ts`, `e2e/portfolio-mobile.spec.ts`.

### 02 — Safe tracked email and editable composer

- Idempotency prevents double sends; recipient remains server-authoritative.
- Subject/body are editable and template switching refreshes content/preview immediately.
- Rendered HTML/text is archived for audit.
- Files: `src/lib/email-delivery.ts`, `src/components/admin/EditableEmailComposer.tsx`, `src/app/admin/leads/actions.ts`, `LeadEmailSender.tsx`.
- Migrations: `015_email_delivery_content_archive.sql`, `016_email_delivery_idempotency.sql`.

### 03 — Offer date selection and validity

- Stable ISO event dates and long-range calendar selection.
- Template 001 offers expire 30 days after actual sending.
- Files: `src/app/admin/dashboard/OfferCalendar.tsx`, `src/lib/offers.ts`.
- Migration: `017_template_001_offer_validity.sql`.

### 04 — Compact admin shell and record workspaces

- Sidebar has expanded and icons-only modes; reminders remain accessible.
- Client/lead sections use compact cards, wrapping titles and single-focus accordions.
- Files: `src/app/admin/AdminChrome.tsx`, `src/components/admin/WorkflowReminderCenter.tsx`, `ClientWorkspaceSection.tsx`, `CollapsibleAdminCard.tsx`.

### 05 — Gmail sent archive and communication evidence

- Client mail uses configured studio SMTP identity.
- Internal `[SENT]` copy includes template, couple, recipient and event metadata.
- Archive failure does not resend or misreport the client delivery.
- Files: `src/lib/email-delivery.ts`, `src/components/admin/EmailHistory.tsx`, lead/client email actions.
- SMTP acceptance proves provider acceptance, not guaranteed inbox reading; offer views are stronger engagement evidence.

### 06 — Invoice payment ledger and booking gates

- Payments can be added, edited or voided, never silently hard-deleted.
- Accepted collection is the payment ceiling; overpayment is blocked.
- Contract signature plus deposit/payment evidence confirms booking.
- Files: `src/lib/invoice-payments.ts`, `src/app/admin/clients/[id]/InvoicePaymentManager.tsx`.
- Migration: `018_invoice_payment_ledger.sql`.

### 07 — Portal invoice and reactive balances

- Portal shows a read-only invoice/payment ledger without misleading Pay Now.
- Admin balances refresh after mutations; capped editable 25% deposit shortcut exists.
- Files: `src/app/portal/[slug]/PortalInvoicePanel.tsx`, `InvoicePaymentManager.tsx`, `src/lib/client-portals.ts`, `src/components/admin/AdminLocale.tsx`.

### 08 — Explicit bilingual client email

- GR/EN email language is selected explicitly and server-enforced.
- Admin UI locale never silently determines the couple’s email language.
- Files: `src/app/admin/clients/[id]/email/ClientEmailComposer.tsx`, `actions.ts`, `src/lib/email-templates.ts`, `EditableEmailComposer.tsx`.

### 09 — Shared HTML renderer and natural paragraphs

- Preview and SMTP use the same email-safe renderer.
- Accidental source line wraps become normal paragraphs; horizontal padding is reduced.
- CTA, closing and professional signature share one rendering order.
- Files: `src/lib/email-renderer.ts`, `src/lib/email-template-renderer.ts`, `EditableEmailComposer.tsx`.

### 10 — Searchable email image library

- Per event/language template header image, searchable portfolio gallery, uncropped selected preview and default reset.
- Same picker is reused by Email Templates and lead Send & Track; preview updates immediately.
- Files: `src/components/admin/EmailHeaderImagePicker.tsx`, `src/app/admin/email-templates/TemplateEditor.tsx`, `src/app/admin/leads/LeadTemplateImagePicker.tsx`, `LeadEmailSender.tsx`, `src/lib/portfolio.ts`.
- Migration: `019_email_template_header_image.sql`.

### 11 — Persistent workflow profile

- Qualify Lead requires Wedding GR/EN or Baptism GR/EN once.
- All later emails, offers and documents inherit the stored event and locale.
- Files: `src/lib/leads.ts`, `src/lib/lead-email-template-scope.ts`, `src/app/admin/leads/LeadWorkflowWizard.tsx`, `actions.ts`.
- Migration: `020_workflow_profile_document_templates.sql`.

### 12 — Reusable document templates and provisioning

- Questionnaire, contract and invoice templates are scoped by type/event/locale.
- Admin can create, edit, activate and select defaults; lead records inherit the saved workflow profile.
- Files: `src/lib/document-templates.ts`, `src/app/admin/document-templates/page.tsx`, `actions.ts`, `src/lib/lead-native-documents.ts`.
- Migrations: `020`, `021_workflow_document_provisioning.sql`, `022_workflow_document_trigger_collation.sql`.

### 13 — Correct proposal CTA placement

- Template 001 CTA is centered immediately below the proposal-introduction paragraph and before closing/signature.
- Files: `src/lib/email-renderer.ts`, `scripts/verify-sprint-19-contracts.mjs`.

### 14 — Prefilled offer return and in-place wizard

- Generated offer links return to the matching lead and correct guided-workflow tab.
- The six-step wizard opens inside the dedicated lead workspace.
- Files: `src/app/admin/dashboard/WeddingDashboard.tsx`, `BaptismDashboard.tsx`, `src/app/admin/leads/LeadWorkflowWizard.tsx`, `src/app/admin/leads/[id]/page.tsx`.

### 15 — Lead/client detail redesign

- Existing list cards stay compact; clicking opens `/admin/leads/[id]` or `/admin/clients/[id]`.
- Dedicated pages use a 60/40 workflow/records layout; active rows use dark/light contrast without duplicate reserved space.
- Files: lead/client list and `[id]/page.tsx`, `ClientWorkflowSection.tsx`, `ClientWorkflowTracker.tsx`, `ClientWorkspaceSection.tsx`, `CollapsibleAdminCard.tsx`.

### 16 — Workflow progression from real activity

- Real Template 002/003 delivery may skip unresolved earlier conditional steps.
- Delivered 003 makes 004 next; upcoming begins at 005.
- Accepted offers close irrelevant conditional steps; manual state can be cleared back to evidence.
- Send & Track selects the real next workflow template instead of always 001.
- Files: `src/lib/client-workflow.ts`, `LeadWorkflowWizard.tsx`, lead actions, `ClientWorkflowTracker.tsx`.

### 17 — Automation duplicate protection

- Queue checks delivery history before SMTP and cancels already-delivered jobs.
- Only Templates 002, 003, 007 and 009 can auto-send.
- Existing follow-up advances one template and three days; manual sends reconcile queue state.
- Files: `src/lib/automations.ts`, `automation-runner.ts`, `email-delivery.ts`, `src/app/api/automations/run/route.ts`, lead/client email actions.

### 18 — 24-hour automation preview and queue clarity

- Vasilis receives a digest for next-day automated emails: recipient, template, time and reason.
- Unnotified due jobs are postponed; queue is grouped with plain titles, newest first and blue Needs Attention.
- Files: automation libraries/API and `src/app/admin/automations/page.tsx`.
- Migration: `023_automation_preview_notification.sql`.

### 19 — Portal Home and private legal files

- Portal defaults to Home with questionnaire, contract, invoice and downloadable files.
- Authenticated admin uploads private PDF/JPEG/PNG up to 5 MB, including AADE receipts.
- Storage is outside public uploads; download verifies portal ownership.
- Upload never changes invoice totals/payment state.
- Files: `src/lib/client-files.ts`, `client-portals.ts`, `src/app/admin/clients/[id]/ClientFileUpload.tsx`, client actions/page, `src/app/portal/[slug]/page.tsx`, `src/app/api/portal/[slug]/files/[fileId]/route.ts`.
- Temporary feature walkthrough cards: `src/app/admin/overview/page.tsx`, `src/app/admin-motion.css`.

### 20 — Exact offer identity, resend clarity and lead titles

- Lead card primary title is couple/family name; Booked/Offer sent/etc. is smaller secondary text.
- Send & Track shows the exact offer slug used by Template 001.
- Template 001 blocks missing/revoked/rejected/expired offers.
- Successful Template 001 delivery records `offer_id` and advances the exact draft offer to sent.
- Email History displays exact offer slug/status/link.
- Historical Draft repair uses first successful Template 001 delivery timestamp, recalculates 30-day validity and schedules follow-ups without resending.
- Files: `src/lib/offers.ts`, `email-delivery.ts`, `src/components/admin/EmailHistory.tsx`, lead actions/sender/wizard/page, `scripts/verify-sprint-22-contracts.mjs`, `verify-sprint-22-database.mjs`.

Historical repair path: open `/admin/offers`, find the exact slug shown by Email History and click `Mark sent`. This does not send email; it reconciles status/date/expiry and follow-ups from delivery evidence.

## Verified local state

- `artifacts/verification/sprint-21-results.txt`: full PASS, 2 Sep 2026 14:53 +03:00.
- `artifacts/verification/sprint-22-results.txt`: full PASS, 2 Sep 2026 15:41 +03:00.
- Sprint 22 artifact includes Sprint 21 regression, 11 Sprint 22 contracts, DB preflight, zero-warning scoped ESLint, TypeScript and Next.js production build.
- Sprint 22 needs no migration; it uses existing `email_deliveries.offer_id`.
- Migrations 020/021/022 were explicitly shown imported locally.
- Do not infer migrations 019–023 or Sprint 20–22 code are deployed to Papaki.

Owner verification entry point:

```powershell
.\scripts\moumkas-admin.ps1 -Action Sprint22Verify
```

## Critical do-not-regress rules

- Store event/language once for the whole workflow.
- Do not force Template 001 when another template is the real next action.
- Auto-send only 002/003/007/009; never resend a delivered queue job.
- Keep manual workflow control and manual offer acceptance.
- Never complete automatic gates without connected evidence.
- Preserve revoked offers as history; do not merge/delete them.
- Do not claim inbox reading from SMTP acceptance alone.
- Private file upload must not alter invoice accounting or use public storage.
- Do not reintroduce Pay Now while payments are manually recorded.
- Admin locale must not change public-site or client communication language.
- Never upload `.env*`, secrets, local artifacts, `node_modules`, `.next-playwright` or demo data.
- Never claim Papaki deployment, SMTP, migrations or cron are live without direct evidence.

## Deferred next sprint — Calendar

Not implemented yet. Requested direction: an admin Calendar tab, Google Calendar connection/sign-in, clear booked/available dates, and warnings/closure when a lead or client already occupies a date, including the relevant couple names. This requires explicit Google OAuth/calendar configuration and production setup by the owner.
