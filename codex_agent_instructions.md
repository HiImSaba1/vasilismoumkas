# Codex continuation guide — Moumkas photographer admin CRM

Last updated: 12 August 2026

Use this file as the first context for a new Codex task. It summarizes the project decisions and current implementation so the next agent does not need the full original conversation.

## 1. Project and objective

- Workspace: `C:\Users\sab_j\Desktop\Projects\moumkas-new\moumkas-awwwards`
- Stack: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, MySQL/MariaDB, Nodemailer, PDF-Lib.
- Public website: `https://vasilismoumkas.com`
- Admin goal: a simple bilingual wedding/baptism photography CRM focused on leads, offers, clients, client portals, questionnaires, contracts, invoices, timelines, email templates, reminders, automations, and portfolio CRUD.
- Gallery delivery itself is handled by another website and must not become a large gallery-management system here.
- The admin must guide a new employee through the approved workflow without requiring them to guess the next action.

## 2. Start every new task this way

1. Read this file completely.
2. Inspect the actual current files related to the requested feature. Treat this guide as context, not a substitute for current code.
3. Read the relevant client reference file before changing approved copy or workflow behavior.
4. Check whether the directory is a Git worktree before relying on `git diff`. At the time of this handoff, `git` reported that this project directory was not a Git repository.
5. Preserve existing user work and avoid broad rewrites.
6. Never print, copy, commit, or embed credentials. Use environment variables only.
7. Implement the requested sprint, run scoped ESLint on touched files, then run `npm run build`.
8. Do not claim production or database cutover success unless it was actually verified against Papaki.

## 3. Authoritative references

Current reference documents:

- `client-files-for-changes-in-admin/agency-workflow-000-009.pdf`
- Wedding email-template documents in `client-files-for-changes-in-admin/`
- Baptism email-template documents in `client-files-for-changes-in-admin/`

Historical requirements/reference paths mentioned during development:

- `client_emails_as_source_of_truth.txt`
- `admin_reference_code/`
- `C:\Users\sab_j\Desktop\Projects\Sabaweb\saba-web-solutions` was used only as a visual/interaction reference for selected components.

The historical paths may not exist in the present checkout. Do not invent missing copy. Use the current reference documents or ask the user when approved wording cannot be recovered.

## 4. Approved client workflow

The canonical sequence is:

1. `000` — A first introduction: collect essential event information.
2. `001` — Your personal proposal: send the private offer and complete galleries.
3. `002` — A thoughtful follow-up: first follow-up.
4. `003` — Staying in touch: second and final follow-up.
5. `004` — Welcome to our collaboration: booking thank-you message.
6. `005` — Your personal Client Portal: send portal/questionnaire access.
7. `006` — Collaboration agreement: contract for signature.
8. `007` — Booking confirmation: deposit and invoice.
9. `JOB ACCEPTED` — automatic status change after the booking gates are satisfied.
10. `009` — Organizing the schedule: timeline before the event.
11. `EVENT DAY · MAIN SHOOT` — wedding or baptism coverage.
12. `008` — A personal thank you: send after the event.
13. `DELIVERY · JOB COMPLETE` — automatic completion gate.

Important behavior:

- `002` and `003` are conditional. If the offer is accepted before they are sent, they are automatically skipped.
- Required steps must not be silently skipped.
- Automatic gates must be completed by real connected evidence, not arbitrary manual status changes.
- Admin users must retain manual offer acceptance for bookings received by phone, message, or email.
- Manual acceptance must reconcile/create the connected client workspace, portal, and booking documents.
- Contract approval/signature plus invoice/deposit payment confirms the booking and advances `JOB ACCEPTED`.
- When a later valid event makes conditional earlier follow-ups irrelevant, those conditional steps become skipped automatically.
- Completed journeys show a green treatment/stamp. Status colors across the admin follow the established semantic palette: green completed/accepted, orange pending/follow-up, red missed/failed/not done, blue qualified/accepted decision where applicable, grey skipped.

## 5. Main implemented architecture

### Workflow and reminders

- `src/lib/client-workflow.ts` — canonical English workflow definitions and evidence resolution.
- `src/lib/journey-dashboard.ts` — journey dashboard aggregation.
- `src/lib/workflow-reminders.ts` — actionable workflow reminders.
- `src/lib/admin-workflow-revalidation.ts` — centralized route revalidation after workflow mutations.
- `src/components/admin/ClientWorkflowTracker.tsx` — focused client workflow with current action and collapsed history/future.
- `src/components/admin/WorkflowReminderCenter.tsx` — reminder bell/modal, including snooze behavior.
- `src/app/admin/journeys/page.tsx` — Journey Dashboard.
- `src/app/admin/workflow-actions.ts` — manual workflow actions.

After any mutation that changes workflow evidence, use `revalidateAdminWorkflow(...)` so Journeys, Leads, Clients, Onboarding, Automations, Overview, and detail pages remain synchronized.

### Localization

- Admin-only locale switcher: EN/GR, without changing public website URLs.
- `src/components/admin/AdminLocale.tsx` — existing DOM-based admin translation layer and dynamic translation handling.
- `src/components/admin/AdminJourneyEl.ts` — workflow/Journey Dashboard Greek mappings.
- `src/components/admin/AdminGuideAutomationEl.ts` — Guide and Automations Greek mappings.
- Keep English as the canonical source for workflow definitions.
- Treat user/client-provided Greek wording as authoritative.
- Preserve template IDs, step numbers, counters, names, dates, and other dynamic data when translating labels.
- For uppercase Greek UI, follow the user's typography preference and avoid tonos where the design uses uppercase copy.

### CRM data and documents

- `src/lib/leads.ts`, `src/lib/offers.ts`, `src/lib/clients.ts`, `src/lib/onboarding.ts`
- `src/lib/client-portals.ts` — private portal lookup and portal document updates.
- `src/lib/lead-native-documents.ts` — native questionnaire, contract, and invoice records.
- `src/lib/questionnaires.ts`, `src/lib/timelines.ts`
- `src/lib/portfolio.ts` — portfolio CRUD.
- Client portals expose questionnaire, contract, and invoice information in one private journey.
- Contract PDF route: `src/app/api/portal/[slug]/contract.pdf/route.ts`.
- Offer PDF route: `src/app/api/admin/offers/[slug]/pdf/route.ts`.
- Invoice data should inherit the accepted collection, included services/items, total, deposit/prepaid amount, and remaining balance, while remaining editable for client needs.
- Portal/client completions should update admin evidence and send an internal milestone notification once, with duplicate protection.

### Email and automation

- `src/lib/email-templates.ts` — bilingual wedding/baptism templates and placeholder rendering.
- `src/lib/email-delivery.ts` — tracked delivery.
- `src/lib/automations.ts` and `src/lib/automation-runner.ts` — queue and protected execution.
- `src/app/admin/email-templates/` — bilingual template editor.
- Template switching must update all state immediately; do not reintroduce stale title/form state.
- Templates cover IDs `000` through `009` for wedding and baptism, EL primary and EN secondary.
- Email sent to couples uses the `info@...` mailbox identity configured through SMTP.
- Internal notifications go to the environment-configured Gmail recipient.
- Never hardcode mailbox credentials or recipients that already have an environment variable.
- Template `005` is the portal email and combines questionnaire/contract/invoice journey information as previously approved.
- Offer and portal URLs should be populated automatically from connected records.
- Default recent-gallery URL comes from `NEXT_PUBLIC_RECENT_GALLERY_URL` and currently falls back to the approved Pixieset gallery.
- Follow-ups are scheduled around days 6 and 10 after the proposal is sent.
- Papaki cron must call the protected automation endpoint; documenting it is not equivalent to activating it.

### Authentication and security

- `src/lib/admin-auth.ts` — signed expiring HMAC admin session.
- `ADMIN_SESSION_SECRET` must be at least 32 characters.
- Mutations require authentication and validate input.
- Do not weaken the session implementation to bypass missing environment configuration.

## 6. Admin navigation and UX decisions

Current menu order in `src/app/admin/AdminChrome.tsx`:

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
11. Automation Queue
12. Guide

The Settings link was removed from the menu, although an `/admin/settings` route may still exist.

Established UI expectations:

- Admin burger menu is two columns on larger screens and one column on mobile.
- The public website menu must remain the original site menu; do not apply admin-menu changes to it.
- Admin sections use smooth CSS opacity/bottom-to-top entrance animation with a small stagger.
- Clickable buttons/cards need clear hover feedback, commonly dark background with light text or color reversal.
- Leads, offers, clients, guide sections, and comparable dense cards use collapsible cards with identifying titles visible while collapsed.
- Questionnaire fields use two columns on large screens and one on mobile.
- Page headings and card headings must remain responsive and avoid oversized Greek text.
- Tooltips and guided modals should explain inputs and next actions. Setup-style modals must be centered, viewport-safe, scroll internally, and keep navigation buttons visible.
- The Automation Queue and Onboarding screens should explain actions in very plain language.

## 7. Database state and cutover

Production source of truth is intended to be MySQL/MariaDB.

Key files:

- `database/schema.sql`
- `database/README.md`
- `src/lib/database.ts`
- `src/lib/crm-records.ts`
- `scripts/check-database-schema.mjs`
- `scripts/migrate-json-to-mysql.mjs`

The schema currently includes tables for login attempts, leads, workflow steps, offers, booking/native documents, offer events, clients, onboarding, portals, questionnaires, timelines, documents, bilingual email templates/variants, automation jobs, deliveries, activity logs, portfolio projects/images/deletions, and migrations.

Safe cutover order:

1. Import `database/schema.sql` through phpMyAdmin.
2. Configure production environment variables using a restricted application DB user.
3. Run `npm run db:check-schema` in the correctly configured environment.
4. Run `npm run db:import-json` only once if legacy JSON records still need migration.
5. Compare record counts and verify public offer/timeline/portal rendering.
6. Exercise staging CRUD and workflow transitions.
7. Only then enable production writes/automations.

Papaki JetBackup handles database backups according to the user. Do not create a parallel backup feature in the admin. Still verify restore readiness before a real cutover.

At this handoff, local builds passed, but production deployment, Papaki schema import, production record comparison, and live cron activation were not confirmed.

## 8. Environment variables

Use `.env.example` as the key inventory. Never put real values in this file or in chat output.

Important variables include:

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `DB_CONNECTION_LIMIT`, `DB_SSL`, `DB_SSL_REJECT_UNAUTHORIZED`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USERNAME`, `SMTP_PASSWORD`
- `SMTP_FROM_EMAIL`, `SMTP_ENABLED`
- `INQUIRY_NOTIFICATION_EMAIL`
- `AUTOMATION_SECRET`
- `NEXT_PUBLIC_SITE_URL=https://vasilismoumkas.com`
- `NEXT_PUBLIC_RECENT_GALLERY_URL`

Secrets were previously pasted into chat and a historical notes file. Treat them as sensitive and potentially exposed. Never repeat them; recommend rotation before production deployment.

## 9. Existing local demonstration data

Five local examples were created to make Journey Dashboard states understandable:

- Anna & George — beginning at step `000`.
- Eleni & Dimitris — at first follow-up `002`.
- Maria & Nikos — waiting for an offer response.
- Sofia & Andreas — accepted and requiring step `004`.
- Chloe Family — completed journey.

They are demonstration/local data only. Do not seed, duplicate, delete, or deploy test data unless the user explicitly requests it. Inspect the current database before assuming they still exist.

Related script: `scripts/seed-journey-dashboard-examples.mjs`.

## 10. Current verified state

The latest completed sprint hardened the bilingual Journey Dashboard and workflow UI:

- Workflow definitions use English canonical copy.
- Greek mappings cover workflow titles, descriptions, actions, requirements, statuses, counters, delivery evidence, automatic skip explanations, and event completion messages.
- Dynamic template IDs, step numbers, and counts are preserved during language switching.
- Scoped ESLint passed for the workflow files changed in that sprint.
- `npm run build` passed with Next.js 16.2.12 and all listed routes compiled.
- No production deployment was performed.

Full repository `npm run lint` still reports pre-existing public-site issues outside the admin workflow work, including `any` types, React effect/state warnings, unescaped JSX characters, and some component-definition warnings. Do not attribute those to the latest workflow sprint. Fix them only when requested or when they directly block the current task.

## 11. Validation commands

Run from the project root:

```powershell
npx eslint <touched-files>
npm run build
```

Database commands require a correctly configured environment:

```powershell
npm run db:check-schema
npm run db:import-json
npm run db:seed-email-templates
```

Do not run migration, seed, destructive cleanup, live email, or live automation commands merely to test compilation. Ask before mutating shared/production data.

## 12. Recommended continuation prompt

Paste this after attaching or referencing this file in a new Codex task:

> Read `codex_agent_instructions.md` completely, then inspect the current code for the requested area. Continue from the verified local state and preserve all workflow, localization, security, and data-safety decisions. Do not reread the full historical conversation unless a missing client-approved detail cannot be recovered from the referenced source files. Before editing, tell me which sprint/task you are continuing. After implementation, run scoped ESLint and `npm run build`, and clearly separate local verification from Papaki production deployment.

Then add the concrete new request beneath it.

## 13. Do not regress these decisions

- Do not remove manual offer acceptance.
- Do not mark automatic gates complete without evidence.
- Do not recreate a separate external questionnaire/contract/invoice workflow when the native Client Portal already owns it.
- Do not require users to retype connected offer or portal URLs.
- Do not change the public website language when switching the admin language.
- Do not apply the admin burger menu design to the public site menu.
- Do not replace MySQL production storage with JSON.
- Do not expose secrets in source, logs, commands, screenshots, or handoff documents.
- Do not claim Papaki cron, SMTP, schema migration, or deployment is live without direct verification.
- Do not add unnecessary gallery-management complexity.
