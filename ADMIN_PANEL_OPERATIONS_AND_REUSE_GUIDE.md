# Vasilis Moumkas Studio CRM — Admin operations, workflow and reuse guide

Updated: 3 September 2026  
Workspace: `C:\Users\sab_j\Desktop\Projects\moumkas-new\moumkas-awwwards`  
Current local evidence: `artifacts/verification/sprint-26-results.txt` — full PASS, 3 September 2026 12:17 +03:00.

## 1. Purpose and operating boundary

This is the practical map of the complete admin panel: where each feature lives, what its buttons do, when workflow steps change, which email is used, and which source files own the behavior.

The application is a bilingual wedding/baptism CRM built with Next.js App Router, React, TypeScript, MySQL/MariaDB and Nodemailer. The admin is designed to guide the studio from inquiry to final delivery without repeatedly selecting the event or communication language.

Important boundaries:

- Local PASS proves the checked source compiled and passed the local verification suite. It does not prove that Papaki, SMTP, cron, migrations or the live site were updated.
- Database migrations, builds, deployment, SMTP tests, production checks and real-email tests are owner-run operations.
- Never copy `.env*`, credentials, live client records, offer slugs, portal slugs, uploaded receipts or email history to another project.
- Reuse interaction patterns and architecture in another project; do not copy Moumkas identity, approved client copy, database rows or business-specific workflow rules.

## 2. Admin shell and global controls

Primary source: `src/app/admin/AdminChrome.tsx`.

- Desktop sidebar switcher:
  - **Compact menu** hides labels and keeps icons, giving the workspace more width.
  - The reverse control expands the labels again.
- Mobile menu button opens/closes the admin navigation.
- `GR | EN` changes admin interface labels only. It does not change public-site URLs or the language sent to a client.
- The reminder bell is powered by `src/components/admin/WorkflowReminderCenter.tsx` and `src/lib/workflow-reminders.ts`.
- **Sign out** ends the authenticated admin session.
- Authentication is handled by `src/lib/admin-auth.ts`. Do not bypass missing or invalid environment configuration.

Navigation order:

1. Overview
2. Journey Dashboard
3. Leads
4. Create Offer
5. Offers
6. Clients
7. Onboarding
8. Timelines
9. Portfolio
10. Email Templates
11. Document Templates
12. Automation Queue
13. Guide

The old Settings route may still exist, but it is intentionally not part of the sidebar.

## 3. The canonical client journey

Workflow authority: `src/lib/client-workflow.ts`.

| Step | Meaning | Completion evidence / action |
| --- | --- | --- |
| `000` | First introduction | Essential lead information is collected or a later valid activity makes it obsolete. |
| `001` | Personal proposal | The exact connected offer is sent; acceptance is tracked separately. |
| `002` | First follow-up | Optional automated/manual follow-up. Skipped if acceptance makes it unnecessary. |
| `003` | Final follow-up | Optional automated/manual follow-up. Sending it skips unresolved earlier conditional follow-ups. |
| `004` | Welcome to collaboration | Booking thank-you email. |
| `005` | Client Portal | Portal/questionnaire access email. |
| `006` | Collaboration agreement | Contract email and later signature/approval evidence. |
| `007` | Booking confirmation | Deposit/invoice email and payment evidence. |
| `JOB ACCEPTED` | Automatic gate | Contract approved/signed plus invoice/payment evidence. |
| `009` | Organizing the schedule | Timeline communication and approved timeline evidence. |
| `EVENT DAY` | Main shoot | Production status records event coverage. |
| `008` | Personal thank-you | Post-event thank-you email. |
| `DELIVERY / JOB COMPLETE` | Automatic gate | Final gallery delivery or completed lead evidence. |

Progression rules:

- The event/language profile is selected once at Qualify Lead: Wedding GR, Wedding EN, Baptism GR or Baptism EN.
- Later templates and documents inherit that profile.
- Successful tracked email delivery is workflow evidence.
- If `003` is sent, unresolved `002` is skipped and `004` becomes the next action.
- Accepted offers skip unused conditional `002` and `003` steps.
- Required steps are not silently skipped.
- Automatic gates cannot be completed from an arbitrary UI toggle; they require connected evidence.
- Manual corrections remain available where appropriate and can be cleared back to evidence-derived status.
- Workflow mutations revalidate related screens through `src/lib/admin-workflow-revalidation.ts`.

## 4. Overview — `/admin/overview`

Primary source: `src/app/admin/overview/page.tsx`.

Purpose:

- Studio command center and shortcut page.
- Shows high-level counts/actions and temporary walkthrough cards for newly implemented features.

Main actions:

- **Create offer** opens the guided proposal builder.
- Shortcut cards open the relevant operational area.
- “Οδηγός νέων λειτουργιών” cards explain recent functionality and link directly to it.

Visual behavior:

- Recent-feature cards use dark `#221f20` background with white text on hover.
- Temporary cards should be removed after final business acceptance, not merely after a local build.

Reusable Sabaweb pattern: a temporary “What changed” section with deep links is useful during client acceptance. Keep feature status honest: local, staging or live.

## 5. Journey Dashboard — `/admin/journeys`

Primary sources:

- `src/app/admin/journeys/page.tsx`
- `src/lib/journey-dashboard.ts`
- `src/lib/client-workflow.ts`

Purpose:

- Cross-client view of journey position, next action and completion.
- Uses evidence from leads, offers, deliveries, client documents, onboarding, timelines and production.

Typical use:

1. Open Journey Dashboard.
2. Find the couple/family.
3. Read the current action/status.
4. Open the related lead or client workspace.

Do not treat this page as a separate workflow database. It is an aggregation of authoritative records.

## 6. Leads — `/admin/leads`

Primary sources:

- `src/app/admin/leads/page.tsx`
- `src/app/admin/leads/LeadCreateForm.tsx`
- `src/app/admin/leads/actions.ts`
- `src/lib/leads.ts`

Purpose:

- Create and browse inquiries before or during conversion.
- Lead card title is the couple/family name. Booked, offer sent and similar states are smaller secondary metadata.
- Cards are ordered with the newest relevant records first.

Create-lead process:

1. Add couple/family names and contact/event information.
2. Choose the required workflow profile once.
3. Save the lead.
4. Open the lead card to continue the guided workflow.

The profile controls email language, event-specific offer path, questionnaire, contract, invoice and subsequent templates.

## 7. Lead workspace — `/admin/leads/[id]`

Primary sources:

- `src/app/admin/leads/[id]/page.tsx`
- `src/app/admin/leads/[id]/actions.ts`
- `src/app/admin/leads/LeadWorkflowWizard.tsx`
- `src/app/admin/leads/LeadEmailSender.tsx`
- `src/app/admin/leads/LeadTemplateImagePicker.tsx`
- `src/app/admin/leads/NativeDocumentManager.tsx`
- `src/components/admin/EmailHistory.tsx`

Purpose:

- One dedicated workspace for the selected lead.
- Keeps the six-tab guided wizard inside the current lead instead of navigating back to the lead list.
- Shows lead details, connected offer, workflow, native documents and communication history.

Main controls:

- **Continue guided workflow** opens the existing wizard inside this lead at the correct stopped step.
- **Create prefilled offer** appears only when no offer exists.
- **View offer / View accepted offer** opens the connected public proposal.
- **Revise offer** appears for an existing non-accepted offer; an accepted offer does not invite unnecessary recreation.
- **Edit lead details** expands the edit form for contact/event information and notes.
- **Send & Track** opens the real next email template, not always Template 001.
- Email image picker shows the selected image on the left and searchable/filterable portfolio images on the right. The selected image is fully visible rather than cropped.
- Email history shows subject, recipient, timestamp, status and the exact connected offer identity where available.

Offer resend rule:

- Resending Template 001 must reference the exact connected valid offer.
- Revoked, rejected or expired offers are blocked from Template 001 sending.
- A successful tracked send records `offer_id` and moves that exact draft offer to sent.
- Existing revoked offers remain historical records and are not merged or deleted.

Delivery interpretation:

- “Sent successfully” means the SMTP provider accepted the message.
- The Gmail `[SENT]` archive copy is internal evidence of the attempt/content.
- Neither proves inbox reading. Offer views or a client response are stronger engagement evidence.

## 8. Create Offer — `/admin/dashboard`

Primary sources:

- `src/app/admin/dashboard/page.tsx`
- `src/app/admin/dashboard/WeddingDashboard.tsx`
- `src/app/admin/dashboard/BaptismDashboard.tsx`
- `src/app/admin/dashboard/TimelineDashboard.tsx`

Purpose:

- Guided builder for Wedding or Baptism proposals.
- A lead-prefilled URL carries names, email, date, locations, event type and language into the wizard.

Process:

1. Open from a lead whenever possible so the result remains connected.
2. Choose Wedding or Baptism if the type was not already supplied.
3. Select/customize collections.
4. Review contact and logistics information.
5. Generate the offer.
6. Use the large centered return button below the generated offer link to return to the correct guided-workflow tab for the connected lead.

The separate timeline entry here is a creation tool, not the future Calendar availability tab.

## 9. Offers — `/admin/offers`

Primary sources:

- `src/app/admin/offers/page.tsx`
- `src/app/admin/offers/actions.ts`
- `src/app/admin/offers/OfferDecisionControls.tsx`
- `src/app/admin/offers/DeleteOfferButton.tsx`
- `src/app/admin/offers/[slug]/edit/*`
- `src/lib/offers.ts`

Purpose:

- Offer library with exact slug, event/language, view count, validity and status.

Important statuses:

- Draft: created but no tracked send evidence has reconciled it yet.
- Sent/viewed: current proposal was sent/opened.
- Accepted: selected offer converted the lead and created/reconciled the client workspace.
- Revoked/rejected/expired: retained as history and not valid for sending as the current offer.

Main controls:

- **Open** expands the compact offer card.
- **View** opens the public offer.
- **Edit/revise** changes an eligible offer without inventing a second identity accidentally.
- **Accept** supports manual acceptance received by phone/message/email and reconciles client, portal and booking documents.
- **Mark sent** repairs a historical draft only when successful Template 001 delivery evidence exists. It does not send an email.
- Delete is restricted for accepted/connected records.

## 10. Clients — `/admin/clients`

Primary sources:

- `src/app/admin/clients/page.tsx`
- `src/app/admin/clients/actions.ts`
- `src/lib/clients.ts`

Purpose:

- Lists converted/accepted client records.
- Existing compact list cards remain; clicking a client opens the dedicated client workspace.

Use the couple/family name as the main identity. Workflow status belongs in secondary text/badges.

The compact red trash icon uses two confirmation stages. Final confirmation removes the complete connected journey: client, related lead and offers, portal, documents/private files, timelines, automations, deliveries and activity history.

## 11. Client workspace — `/admin/clients/[id]`

Primary sources:

- `src/app/admin/clients/[id]/page.tsx`
- `src/app/admin/clients/[id]/actions.ts`
- `src/components/admin/ClientWorkflowTracker.tsx`
- `src/components/admin/ClientWorkspaceSection.tsx`
- `src/components/admin/CollapsibleAdminCard.tsx`
- `src/app/admin/clients/[id]/InvoicePaymentManager.tsx`
- `src/app/admin/clients/[id]/ClientFileUpload.tsx`

Layout:

- 60/40 workspace hierarchy.
- Current workflow is on the left.
- Document/workspace accordion rows stay on the right.
- Clicking a right-side accordion highlights it with dark background/light text without reserving a duplicate empty panel.

### “Η ΕΠΟΜΕΝΗ ΕΝΕΡΓΕΙΑ”

This is the main operational card. Open the current row to see:

- status and requirement;
- why the status was derived;
- internal note;
- the exact action button;
- manual correction controls where allowed.

Email steps `002–009` open `/admin/clients/[id]/email?template=NNN` on the exact workflow template. Labels describe what will be composed, for example **Compose Client Portal email**, **Compose contract email** and **Compose invoice email**.

The email is not blindly sent from this card. The button opens the composer so Vasilis can preview/edit and then use **Send to client**.

History and future behavior:

- Completed history contains terminal previous steps.
- Upcoming begins after the current step; it must not duplicate the current action.
- If `003` was sent or skipped as resolved evidence, `004` is current and upcoming begins at `005`.

### Workspace accordions

- Offer: connected selected proposal.
- Invoice: accepted collection, payments and balance.
- Contract: agreement copy, signature/approval and PDF.
- Questionnaire: portal questionnaire and completion.
- Files: private legal/supporting files.
- Notes/status controls: clear manual record updates.

### Invoice controls

- **Record payment** creates ledger evidence.
- **Use 25% deposit** fills a capped suggested payment amount.
- Existing payments can be corrected or voided with audit information; they are not silently hard-deleted.
- Payment cannot exceed the accepted collection total.
- Invoice/portal balances react to the payment ledger.
- There is no misleading online Pay Now flow; payments are recorded administratively.

### Private files

- Upload accepts PDF, JPEG or PNG up to 5 MB.
- Intended for AADE receipts and other client documents.
- Storage is private/outside public uploads.
- Portal downloads validate portal ownership.
- Uploading a receipt never changes invoice total, paid amount or balance automatically.

## 12. Client email composer — `/admin/clients/[id]/email`

Primary sources:

- `src/app/admin/clients/[id]/email/page.tsx`
- `src/app/admin/clients/[id]/email/ClientEmailComposer.tsx`
- `src/app/admin/clients/[id]/email/actions.ts`
- `src/components/admin/EditableEmailComposer.tsx`
- `src/lib/client-email-financials.ts`

Process:

1. Arrive from the exact current workflow action.
2. Confirm the requested template is selected.
3. Confirm GR/EN explicitly. This controls the client email, independently of admin UI language.
4. Review connected portal/offer sources.
5. Preview subject, body, CTA, signature and selected image.
6. Edit only when needed.
7. Press **Send to client** once.

Server safeguards:

- Recipient is reloaded from the authoritative client record.
- Template event/language is reloaded server-side.
- Idempotency prevents the same submit request from sending twice.
- The rendered HTML/text is archived with the delivery record.
- Successful delivery reconciles workflow and automation state.

Template 005 financial behavior:

- Source total: connected accepted collection/invoice summary.
- Net deposit: 25% of collection total.
- VAT: 24% of that deposit.
- Total deposit: net deposit plus VAT.
- Remaining net value: collection total minus net deposit.
- For a value of `900€`: `225€`, `54€`, `279€`, `675€`.
- The server recalculates the values; it does not trust browser-provided amounts.
- Sending 005 is blocked when a valid connected invoice total is unavailable.
- These calculations personalize the email only; they do not mutate invoice or payment records.

## 13. Onboarding — `/admin/onboarding`

Primary sources:

- `src/app/admin/onboarding/page.tsx`
- `src/app/admin/onboarding/actions.ts`
- `src/lib/onboarding.ts`

Purpose:

- Post-acceptance checklist across portal, questionnaire, agreement, invoice, booking, timeline and production.
- Cards show client name and plain-language next action.

Main controls:

- **Open client** returns to the detailed workspace.
- Automatic evidence should update normal status.
- **Manual correction only** exists for legitimate offline/payment corrections and should not replace real connected evidence.

## 14. Timelines — `/admin/timelines`

Primary sources:

- `src/app/admin/timelines/page.tsx`
- `src/app/admin/timelines/actions.ts`
- `src/lib/timelines.ts`
- `src/app/admin/dashboard/TimelineDashboard.tsx`

Purpose:

- Create/manage client event schedules and their public/private timeline links.
- Workflow step `009` handles the communication; timeline approval is the stronger completion evidence.

Deferred feature: the requested availability Calendar tab and Google Calendar OAuth connection are not part of Sprint 26. Do not describe them as implemented. The future tab should distinguish available/booked dates and warn with couple names when multiple leads/clients share a date.

## 15. Portfolio — `/admin/portfolio`

Primary sources:

- `src/app/admin/portfolio/page.tsx`
- `src/app/admin/portfolio/new/page.tsx`
- `src/app/admin/portfolio/[slug]/page.tsx`
- `src/app/admin/portfolio/PortfolioForm.tsx`
- `src/app/admin/portfolio/PortfolioGalleryInput.tsx`
- `src/app/admin/portfolio/actions.ts`
- `src/lib/portfolio.ts`

Purpose:

- CRUD for public portfolio projects and gallery images.
- Uploaded image dimensions support correct gallery rendering.
- Portfolio imagery is also available to the reusable email image picker.

Do not expand this into a separate client gallery-delivery product; delivery is handled elsewhere.

## 16. Email Templates — `/admin/email-templates`

Primary sources:

- `src/app/admin/email-templates/page.tsx`
- `src/app/admin/email-templates/TemplateEditor.tsx`
- `src/app/admin/email-templates/EmailPreview.tsx`
- `src/app/admin/email-templates/actions.ts`
- `src/components/admin/EmailHeaderImagePicker.tsx`
- `src/lib/email-templates.ts`
- `src/lib/email-renderer.ts`
- `src/lib/email-template-renderer.ts`

Selection hierarchy:

1. Event: Wedding or Baptism.
2. Language: EL or EN.
3. Template number `000–009`.
4. Edit content/image/active state.
5. Review the shared live preview.

Editor behavior:

- Template switching refreshes content and preview immediately.
- Subject and body can be edited.
- Placeholders are shown for the selected variant.
- Header image can be searched, filtered, selected or reset.
- The preview and SMTP delivery share the same HTML renderer.
- Source line wrapping is normalized into readable paragraphs.
- Left/right email padding was reduced to provide more text width.
- Template 001 proposal CTA is centered directly after the proposal introduction, before closing/signature.
- Template 005 portal URL is rendered as a centered **View Client Portal** button rather than exposed raw text.
- Uppercase Greek UI/portal typography removes tonos at render time without mutating stored names/copy.

### Template map

| Template | Purpose | Automatic? |
| --- | --- | --- |
| `000` | First introduction / information collection | Manual |
| `001` | Personal proposal with exact offer URL | Manual |
| `002` | First offer follow-up | Approved for automation |
| `003` | Final offer follow-up | Approved for automation |
| `004` | Welcome after acceptance | Manual compose/send |
| `005` | Client Portal, questionnaire and financial overview | Manual compose/send |
| `006` | Agreement / contract communication | Manual compose/send |
| `007` | Booking/deposit/invoice confirmation | Approved for automation |
| `008` | Post-event personal thank-you | Manual compose/send |
| `009` | Timeline/schedule communication | Approved for automation |

Only `002`, `003`, `007` and `009` may be sent automatically. Template availability does not imply automation permission.

## 17. Document Templates — `/admin/document-templates`

Primary sources:

- `src/app/admin/document-templates/page.tsx`
- `src/app/admin/document-templates/actions.ts`
- `src/lib/document-templates.ts`
- `src/lib/lead-native-documents.ts`

Purpose:

- Reusable Questionnaire, Contract and Invoice content for all four workflow profiles.

Process:

1. Open the Wedding GR/EN or Baptism GR/EN scope.
2. Choose Questionnaire, Contract or Invoice.
3. Edit an existing template or open **New template**.
4. Set a stable template key and readable name.
5. Edit reusable content.
6. Mark active when usable.
7. Mark one active template as workflow default.
8. Save.

The selected default is provisioned into lead/client documents for the stored workflow profile. Existing client-specific document data remains separate from reusable template definitions.

## 18. Automation Queue — `/admin/automations`

Primary sources:

- `src/app/admin/automations/page.tsx`
- `src/app/admin/automations/actions.ts`
- `src/lib/automations.ts`
- `src/lib/automation-runner.ts`
- `src/app/api/automations/run/route.ts`
- `src/lib/email-delivery.ts`

Allowed automatic templates: `002`, `003`, `007`, `009` only.

Queue groups:

- Waiting to send
- Needs attention
- Sending now
- Sent successfully
- Cancelled

Cards are grouped in plain language and ordered most recent first. “Needs attention” uses the blue attention treatment requested by the user.

Automation process:

1. A valid business event schedules an approved template.
2. The queue checks delivery history before SMTP.
3. If the same template was already sent, the duplicate job is cancelled/reconciled rather than resent.
4. For an already-used follow-up, progression moves one template forward and three days later where applicable.
5. Twenty-four hours before automatic sending, a digest is sent to the configured internal notification mailbox with recipient, template, send time and reason.
6. Unnotified due work is postponed rather than sent invisibly.
7. The protected runner sends only when owner-configured cron calls it.

Buttons:

- **Retry once** is shown for failed jobs. Fix the displayed cause first.
- **Cancel this email** closes scheduled/failed work that should not be sent.
- Filters show all or one queue status.

Do not manually invoke the live automation endpoint merely to test UI. Local code does not prove Papaki cron is active.

## 19. Guide — `/admin/guide`

Primary source: `src/app/admin/guide/page.tsx`.

Purpose:

- In-product operations handbook with collapsible sections and answers.
- Golden rule: review the client record and public links before sending; fix the cause before retrying a failure.

This repository guide is more technical and complete. The in-product Guide should remain concise enough for daily studio use.

## 20. Public Client Portal — `/portal/[slug]`

Primary sources:

- `src/app/portal/[slug]/page.tsx`
- `src/lib/client-portals.ts`
- `src/app/portal/[slug]/PortalInvoicePanel.tsx`
- `src/app/api/portal/[slug]/contract.pdf/route.ts`
- `src/app/api/portal/[slug]/files/[fileId]/route.ts`
- `src/lib/client-files.ts`

Portal tabs/content:

- Home overview
- Questionnaire
- Contract
- Invoice/payment overview
- Downloadable private files

Recent reliability fixes:

- URL-encoded Greek slugs are normalized/decoded centrally before lookup, preventing valid Unicode portal records from incorrectly returning 404.
- Uppercase Greek labels and couple names are rendered without tonos according to the chosen visual rule.
- Legal/AADE files uploaded from admin are visible/downloadable to the correct portal only.

## 21. Email renderer and delivery architecture

Core files:

- `src/lib/email-templates.ts`: template records, variants, placeholders and rendering entry points.
- `src/lib/email-renderer.ts`: shared responsive HTML document, CTA placement and signature ordering.
- `src/components/admin/EditableEmailComposer.tsx`: preview/edit/template selection UI.
- `src/lib/email-delivery.ts`: idempotent tracked SMTP delivery and internal archive.
- `src/components/admin/EmailHistory.tsx`: audit display.

Correct order for proposal email:

1. Main text.
2. Centered proposal CTA.
3. Final closing text and “Kind regards”.
4. Professional signature/contact/social footer.

Correct order for Template 005:

1. Portal explanation.
2. Centered **View Client Portal** CTA.
3. Dynamic financial/client instructions.
4. Closing and professional signature.

## 22. Recent implementation timeline — last ten days

The following summarizes the functionality completed and verified across the recent sprint sequence. Exact production deployment remains a separate owner check.

### Sprint 15 — reusable email imagery

- Portfolio header images per event/language template.
- Search/filter, selected preview and reset behavior.
- Shared in Email Templates and lead Send & Track.
- Migration: `019_email_template_header_image.sql`.

### Sprint 16–17 — workflow UI and automation safety

- Clear lead/client progression and manual/evidence status behavior.
- Duplicate queue protection and follow-up reconciliation.
- Automatic-template allowlist established.

### Sprint 18 — persistent profile and documents

- Required Wedding/Baptism plus GR/EN selection in Qualify Lead.
- Reusable scoped document templates.
- Automatic workflow document provisioning.
- Collation-safe provisioning trigger repair.
- Migrations: `020`, `021`, `022`.

### Sprint 19 — email presentation

- Proposal CTA moved into natural message flow.
- Broken manual source wraps normalized into paragraphs.
- Reduced horizontal padding.

### Sprint 20 — compact lead/client workspaces

- Dedicated slug/detail pages.
- 60/40 hierarchy, compact accordions, active-row treatment.
- Sidebar icon-only switcher.
- Correct guided wizard and next/upcoming/history behavior.

### Sprint 21 — portal Home and private files

- Client Portal Home overview.
- Private 5 MB PDF/JPEG/PNG uploads and protected downloads.
- AADE receipts do not change accounting data.
- Temporary Overview walkthrough cards.

### Sprint 22 — offer identity and resend clarity

- Exact offer identity stored with Template 001 delivery.
- Lead names became primary card titles.
- Invalid old offers blocked from resend.
- Historical draft repair from delivery evidence.

### Sprint 23 — Greek portal slug reliability

- Correct lookup of URL-encoded Unicode public slugs.

### Sprint 24 — Template 005 portal CTA

- Raw portal link replaced with **View Client Portal** CTA in preview and delivered rendering.

### Sprint 25 — uppercase Greek typography

- Tonos removed from uppercase Greek portal/admin labels and uppercase names at display time.
- Stored data remains unchanged.

### Sprint 26 — email action and financial personalization

- Current client workflow card opens the exact email template for `002–009`.
- Template 005 calculates 25% deposit, 24% VAT, gross deposit and remaining net value from connected invoice data.
- Server-side validation blocks invalid/missing totals.
- Verified by `artifacts/verification/sprint-26-results.txt`.

### Sprint 27 — complete deletion and event-scoped imagery

- Leads and Clients expose a compact red trash control with two confirmations.
- Permanent deletion removes the complete connected journey and private uploaded-file storage.
- Baptism offers and baptism Client Portals use only images from portfolio projects whose category is `Baptism`, plus baptism-only fallback assets.
- Wedding and Baptism pools never fall back across event categories.
- Owner verification action: `Sprint27Verify`.

## 23. Database migration map

Relevant recent migrations:

- `015_email_delivery_content_archive.sql` — archived outgoing content.
- `016_email_delivery_idempotency.sql` — duplicate-submit protection.
- `017_template_001_offer_validity.sql` — offer validity after send.
- `018_invoice_payment_ledger.sql` — auditable payments.
- `019_email_template_header_image.sql` — per-template imagery.
- `020_workflow_profile_document_templates.sql` — workflow locale and reusable documents.
- `021_workflow_document_provisioning.sql` — provisioning/default behavior.
- `022_workflow_document_trigger_collation.sql` — collation-safe trigger.
- `023_automation_preview_notification.sql` — 24-hour notification state.

Never infer that these exist on Papaki because they exist locally. Check the target database explicitly before deployment.

## 24. Verification and evidence map

Owner runner: `scripts/moumkas-admin.ps1`.

Latest full local command:

```powershell
.\scripts\moumkas-admin.ps1 -Action Sprint26Verify
```

Latest artifact:

- `artifacts/verification/sprint-26-results.txt`

Sprint 26 PASS includes:

- Sprint 25 regression;
- Sprint 26 workflow/email contracts;
- database preflight for exact offer identity;
- scoped ESLint;
- TypeScript;
- Next.js production build.

Preparation/deployment helpers exist in `scripts/prepare-papaki-upload.ps1`, `scripts/prepare-papaki-environment.ps1` and `scripts/verify-papaki-release.ps1`, but their existence is not evidence that upload or live verification occurred.

## 25. Safe reuse in `saba-web-solutions`

Good patterns to port deliberately:

- Collapsible list cards with the record name always visible.
- Dedicated detail workspace with a current action, completed history and upcoming actions.
- Evidence-driven workflow resolver rather than duplicated page-specific status logic.
- Central revalidation helper after workflow-changing mutations.
- Explicit admin-language versus customer-communication-language separation.
- Shared preview/delivery renderer so preview matches sent HTML.
- Server-authoritative recipient and template lookup.
- Idempotent delivery and archived outgoing content.
- Exact related-record IDs stored on delivery history.
- Searchable reusable image picker.
- Temporary Overview acceptance cards with links to each new feature.
- Plain-language automation groups and a 24-hour preview digest.
- Private file storage with ownership-checked downloads.
- Owner-run PowerShell verification producing timestamped artifacts.

Before porting:

1. Map Sabaweb’s own entities, statuses and permissions.
2. Define its workflow steps independently; do not reuse wedding steps `000–009` blindly.
3. Rebuild queries against Sabaweb’s schema and tenant/organization boundaries.
4. Replace all copy, branding, routes and template IDs.
5. Preserve Sabaweb authentication, SMTP variables and deployment process.
6. Write project-specific contract verifiers instead of copying PASS assertions that inspect Moumkas file names.
7. Seed only synthetic demo data.
8. Verify locally, then stage, then separately verify production.

Never copy:

- real lead/client/email/payment/file records;
- SMTP, database, session or automation secrets;
- private portal/offer links;
- bank details or legal documents without explicit approval;
- Moumkas-branded copy presented as Sabaweb copy;
- database migrations without adapting and reviewing the target schema.

## 26. Known deferred work

- New Calendar admin tab.
- Google Calendar OAuth/sign-in and calendar display.
- Available/booked date visualization.
- Conflict warning naming the couple(s) already occupying a date.
- Owner configuration of Google credentials and production callback URLs.

These are requirements for the next calendar sprint, not current functionality.

## 27. Fast continuation checklist for another Codex agent

1. Read this file completely.
2. Read `CODEX_ADMIN_RECENT_20_HANDOFF.md` completely.
3. Read `codex_agent_instructions.md` completely.
4. Inspect the exact current source files for the requested tab.
5. Inspect the newest relevant artifact in `artifacts/verification/`.
6. Preserve event/language profile inheritance and evidence-based progression.
7. Do not run owner-reserved commands or expose environment values.
8. Implement code and verifier updates.
9. Give the owner one exact PowerShell action.
10. Treat deployment, SMTP, cron, migrations and live checks as separate unverified states until direct evidence is provided.
