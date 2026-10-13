# CRM complete backlog — 13 October 2026

This document converts the owner's consolidated report into an implementation and verification plan. It is a planning record, not production certification.

## Status vocabulary

- `LIVE VERIFIED`: directly evidenced on the production server.
- `LOCAL PASS`: implemented and covered by the named local verifier, but not yet deployed/proved live.
- `NEEDS AUDIT`: code or behavior may already exist, but current evidence is insufficient.
- `FIX`: an existing behavior has a confirmed defect or inconsistency.
- `NEW`: a new product capability requiring implementation and acceptance criteria.
- `DECISION`: owner approval is needed before implementation can be final.

## Release baseline

| Scope | Status | Evidence / next gate |
| --- | --- | --- |
| Sprint 37 automation, booking and Calendar corrections | `LIVE VERIFIED` for deployment/health and migration 026 evidence; individual business scenarios still need UI acceptance tests | Production BUILD_ID previously verified during release; preserve server evidence and rerun scenario-specific checks where listed below. |
| Sprint 38 explicit 000–009 scheduling fix | `LOCAL PASS` | `artifacts/verification/sprint-38-results.txt`; deploy, inspect cron/heartbeat read-only, then run one real Template 001 test to the studio mailbox. |
| Sprint 39 owner-managed Homepage content | `LOCAL PASS` | `artifacts/verification/sprint-39-results.txt`; migration 027 and deployment are required before activation. |

## Delivery order

1. **Release A — Sprint 38 + Sprint 39:** deploy the already verified code, apply migration 027, verify health and persistent storage, then perform controlled live acceptance.
2. **Release B — Email integrity and automation safety:** complete all remaining mail queue, idempotency, reply-stop, composition snapshot and failure-observability gaps.
3. **Release C — Client lifecycle and commercial records:** offers, revisions, availability, booking gates, invoices, payments, questionnaires and signed-record protection.
4. **Release D — Calendar, timeline and production:** Google sync evidence, production timelines, gallery and physical-product tracking.
5. **Release E — Historical imports and owner content controls:** Studio Ninja import workflow, remaining Contact/About/media management and publication permissions.
6. **Design release:** email visual specification and Homepage facelift only after explicit visual approval.

## A. Scheduling and automation integrity

| Requirement | Classification | Priority | Target | Proof required |
| --- | --- | --- | --- | --- |
| Manual `Schedule` for every Template 000–009 | `LOCAL PASS` Sprint 38 | P0 | Release A | Real 001 scheduled 10–15 minutes ahead; exactly one received email. |
| Manual jobs must not receive the automatic 24-hour preview postponement | `LOCAL PASS` Sprint 38 | P0 | Release A | Queue timestamp remains selected Greece time through runner execution. |
| Europe/Athens display and DST-safe persistence | `LOCAL PASS` Sprint 38 | P0 | Release A | Form, confirmation, queue and history show the same instant and explicit Greece-time label. Test one summer and one winter timestamp without sending. |
| Queue runner heartbeat and 15-minute overdue explanation | `LOCAL PASS` Sprint 38 | P0 | Release A | Read-only cron frequency/config check plus current production heartbeat. The 15-minute window is presentation only, never rescheduling. |
| Cron actually processes manual Template 001 | `NEEDS LIVE TEST` | P0 | Release A | Runner log/activity and delivery record around the test time; no Send now action. |
| Manual send cancels its still-pending scheduled duplicate | `LOCAL PASS` Sprint 38 | P0 | Release A | After controlled manual fallback test, zero active duplicates for the same lead/template/delivery identity. |
| Reschedule leaves one active queue record and preserves composition | `NEEDS AUDIT` | P0 | Release B | DB/UI test: schedule, change time, confirm one active job and unchanged approved snapshot. |
| Cancel from queue and client/lead record | `NEEDS AUDIT` | P1 | Release B | Cancellation visible in queue and history; runner cannot send it. |
| Automatic/Manual/Paused per client and template | `PARTIAL / NEEDS AUDIT` | P1 | Release B | State transition matrix and persistence test for all three modes. |
| Global maintenance pause with backlog review | `NEW` | P1 | Release B | Pause blocks claims/sends, shows backlog, and resumes only after explicit confirmation. |
| Protection against double click, concurrent cron, and Send now/runner races | `PARTIAL / NEEDS AUDIT` | P0 | Release B | Concurrency test proves a single SMTP attempt and one delivery identity. |
| SMTP accepted but DB update uncertain must not blindly resend | `NEEDS AUDIT` | P0 | Release B | Failure-injection test produces an uncertain/reconciliation state, not automatic resend. |
| Failure reason, targeted retry, audit history and owner notification | `PARTIAL / NEEDS AUDIT` | P1 | Release B | Simulated SMTP failure exposes reason, safe retry and one notification. |
| UI distinguishes SMTP acceptance from inbox delivery | `EXISTS / VERIFY COPY` | P1 | Release B | Sent status and help text do not claim inbox receipt/open. |
| 24-hour automatic preview occurs once per delivery identity | `NEEDS AUDIT` | P1 | Release B | Repeated runner calls neither duplicate the digest nor repeatedly postpone. |

### Release A production acceptance for Sprint 38

1. Deploy the verified commit without unrelated `tsconfig.json` or backup-script changes.
2. Read-only inspect production cron command, interval, last runner activity and active queue.
3. Schedule Template 001 to `vasilis.moumkas@gmail.com` 10–15 minutes ahead in Greece time.
4. Do not use Send now.
5. Confirm `Waiting to send`, runner execution, one delivery, `Sent successfully`, communication history and zero remaining active duplicate.
6. Record commit, artifact checksum, BUILD_ID, Greece timestamps and delivery ID in release evidence.

## B. Follow-ups and lifecycle triggers

| Requirement | Classification | Priority | Target | Proof required |
| --- | --- | --- | --- | --- |
| “They replied — stop 002/003” on Lead and Client | `EXISTS LOCALLY / LIVE VERIFY` from Sprint 37 | P0 | Release A/B | Use a test lead; both pending jobs cancel and cannot regenerate. |
| Offer view is not reply/acceptance | `NEEDS AUDIT` | P0 | Release B | View event leaves follow-ups active and booking unconfirmed. |
| Canonical +6/+10-day 002/003 rules | `EXISTS / NEEDS END-TO-END AUDIT` | P0 | Release B | Timeline tests from actual Template 001 sent timestamp. |
| Manual 002 moves 003 by +3 days | `EXISTS / NEEDS LIVE VERIFY` | P1 | Release B | Manual 002 produces exactly one correctly dated 003. |
| Recheck accepted/booked/withdrawn state immediately before send | `NEEDS AUDIT` | P0 | Release B | State changes just before runner claim prevent invalid delivery. |
| 004 only after real acceptance | `NEEDS AUDIT` | P0 | Release B | No pre-acceptance suggestion/job; acceptance makes it next action. |
| 007 only day after completed event | `LOCAL/LIVE LOGIC EXISTS; SCENARIO VERIFY` | P0 | Release B | Future event cannot send 007; correct post-event job remains possible. |
| Legacy premature 007 history must not suppress correct future 007 | `FIX / NEEDS DESIGN OF DELIVERY IDENTITY` | P0 | Release B | Historical premature delivery retained, future correct lifecycle delivery scheduled once. |
| 009 exactly about 60 days before event and reschedules on date edit | `EXISTS / LIVE VERIFY` | P1 | Release B | Edit date updates one pending 009 without duplicate. |

## C. Email composition and addressing

| Requirement | Classification | Priority | Target | Proof required |
| --- | --- | --- | --- | --- |
| Editable salutation separate from display name | `NEW` | P1 | Release B | Lead/client supports saved salutation; preview/send use it without changing display name. |
| Natural Greek vocative and accents in email | `NEW + CONTENT DECISION` | P1 | Release B | Owner approves representative names; manual override remains authoritative. Do not infer names algorithmically without override. |
| Preview and sent HTML agree on subject/body/image/signature/links/attachments | `PARTIAL; image snapshot covered in Sprint 37` | P0 | Release B | Hash or normalized snapshot comparison for manual and automatic paths. |
| Persist approved composition and actual sent snapshot | `PARTIAL / NEEDS AUDIT` | P0 | Release B | Schedule then inspect stored immutable composition and delivery archive. |
| Critical edits after scheduling require re-review | `NEW` | P1 | Release B | Editing template/offer does not silently mutate a queued approved snapshot; UI shows stale/review-required state if appropriate. |
| Missing required placeholders/links block send with explanation | `PARTIAL / NEEDS AUDIT` | P0 | Release B | Negative tests for portal URL, offer URL and unresolved placeholders. |
| Test Send does not advance workflow or generate follow-ups | `NEEDS AUDIT` | P0 | Release B | Test recipient receives email; CRM evidence and queue remain unchanged. |

## D. Leads, offers, packages and availability

| Requirement | Classification | Priority | Target | Proof required |
| --- | --- | --- | --- | --- |
| Create Offer from lead and general form | `EXISTS / REGRESSION TEST` | P1 | Release C | Both paths create one offer and return to correct record. |
| Duplicate protection after request timeout | `NEEDS AUDIT` | P0 | Release C | Replayed save request does not create a second offer. |
| Unlimited leads on same date; warning only when confirmed booking occupies capacity | `PARTIAL / NEEDS POLICY` | P1 | Release C | Multiple leads allowed; confirmed capacity warning names booked job/assigned photographer. |
| Partner/main-photographer capacity for simultaneous events | `NEW + OWNER POLICY` | P1 | Release C | Explicit resources/capacity model; no automatic assumptions. |
| Owner editing of collection, hours, price, team, prints/box, video and extras | `PARTIAL / NEEDS GAP AUDIT` | P1 | Release C | Per-client changes appear consistently in offer, invoice, client workspace and portal. |
| Included service versus optional charged extra | `NEEDS AUDIT/SCHEMA REVIEW` | P1 | Release C | Totals count optional accepted charges only; included items remain visible. |
| Offer revision preserves prior version and same lead | `PARTIAL / NEEDS AUDIT` | P1 | Release C | Revision creates linked version; previous accepted/sent evidence remains immutable. |
| Accepted agreements protected from silent mutation | `NEEDS AUDIT` | P0 | Release C | Edit creates revision or requires explicit controlled amendment. |
| Empty planner hides “In collaboration with”; never substitutes Direct | `FIX / VERIFY CURRENT RENDERER` | P2 | Release C | Empty and populated render tests. |
| One offer-validity rule everywhere | `DECISION` | P1 | Release C | Current implementation is 30 days after Template 001 send. Owner chooses final value/exceptions; email, offer and guide use the same rule. |
| Historical test prices never become catalogue defaults | `NEEDS AUDIT` | P1 | Release C | Defaults come only from approved package settings. |

## E. Client portal, documents and payments

| Requirement | Classification | Priority | Target | Proof required |
| --- | --- | --- | --- | --- |
| Accepted offer reuses existing client and documents | `EXISTS / REGRESSION TEST` | P0 | Release C | Reaccept/reconcile leaves one client and same documents/payments. |
| Public portal URL, never admin login | `EXISTS / LIVE LINK AUDIT` | P0 | Release C | Template 005 and Calendar event open correct public portal. |
| Location, collection, hours, team and files consistent | `PARTIAL / NEEDS MATRIX TEST` | P1 | Release C | Same authoritative values across client, portal and documents. |
| Accepted, Confirmed, Signed, Part-paid and Paid remain distinct | `PARTIAL / NEEDS UI AUDIT` | P0 | Release C | State matrix with no collapsed/misleading label. |
| Confirmed = signed/approved agreement + agreed deposit covered | `EXISTS Sprint 37 / LIVE VERIFY` | P0 | Release C | Payment below threshold stays pending; threshold plus signature confirms. |
| Questionnaire incremental save/reopen | `NEW or PARTIAL — inspect current submit contract` | P1 | Release C | Save partial, revisit, edit, final submit/reopen with audit record. |
| Wedding/Baptism GR/EN templates and PDFs | `EXISTS / FULL REGRESSION NEEDED` | P1 | Release C | Eight combinations render correct labels/content and Unicode-safe PDFs. |
| Master-template edits do not alter signed/generated snapshots | `NEEDS AUDIT` | P0 | Release C | Change master after signing; existing record/PDF remains unchanged. |
| Invoice net/VAT/total/deposit/balance labels and math | `PARTIAL / NEEDS ACCEPTANCE CASES` | P0 | Release C | Example 550 + 132 = 682 and actual bank deposit are represented distinctly. |
| Receipt upload never records another payment | `EXISTS BY DESIGN / REGRESSION TEST` | P0 | Release C | Upload file changes file count only. |
| Correct payment date, balance and “Agreement accepted by” | `NEEDS AUDIT` | P1 | Release C | Controlled payment/signature scenario. |
| Portal PDFs open/download at every booking stage | `EXISTS after Sprint 36 / LIVE REGRESSION` | P0 | Release C | Draft/accepted/confirmed portal records download correct GR/EN files. |

## F. Google Calendar, timeline and production

| Requirement | Classification | Priority | Target | Proof required |
| --- | --- | --- | --- | --- |
| Google event ID and update-in-place without duplicates | `EXISTS Sprint 37 / LIVE VERIFY` | P0 | Release D | Sync, edit date/location, resync: same Google event ID. |
| Show destination account/calendar, status and last successful sync | `PARTIAL / NEEDS AUDIT` | P1 | Release D | Per-client status with success/failure/last attempt. |
| Calendar event contains confirmed job data and real portal URL | `NEEDS AUDIT` | P1 | Release D | Open Google event and compare authoritative CRM values. |
| Wedding red, baptism yellow | `EXISTS/VERIFY GOOGLE MAPPING` | P2 | Release D | CRM and Google visual test. |
| No automatic invitations or invented details | `NEEDS AUDIT` | P0 | Release D | Attendee field remains empty unless explicitly authorized. |
| Independent timeline creation linked to client | `PARTIAL / NEEDS AUDIT` | P1 | Release D | Create independently, connect once, edit retains same URL. |
| Coverage/travel validation | `NEW` | P2 | Release D | Timeline warns about impossible overlap/travel without fabricating durations. |
| Production previews/editing/gallery/physical products and deadlines | `NEW, LARGE SCOPE` | P2 | Later production sprint | Owner-approved data model and UI before implementation. |
| Template 008 active gallery/download/review URL | `NEW/PARTIAL` | P2 | Later production sprint | Required active URL blocks client delivery if absent. |
| Gallery delivery does not equal all physical products delivered | `NEW STATE MODEL` | P2 | Later production sprint | Independent completion states. |

## G. Historical Studio Ninja migration

Classification: `NEW, HIGH-RISK OPERATIONAL WORKFLOW` — separate import sprint after Release C.

Required guarantees:

- Match or explicitly create the intended lead/client; never guess identity.
- Preserve original services, hours, prices, acceptance, deposit evidence and PDFs.
- Create/update the portal and existing Google event without sending email, generating follow-ups or requesting a new signature.
- Produce dry-run evidence and require explicit approval before each import batch.
- Start with one fully specified record (for example Zerina/Nemanja), validate it end to end, then generalize.

Proof: dry-run manifest, before/after counts, record-level checksums/IDs, no new deliveries/jobs, and owner acceptance.

## H. Design and owner-managed site content

| Requirement | Classification | Priority | Target | Proof required |
| --- | --- | --- | --- | --- |
| Shared preview/send renderer | `EXISTS / REGRESSION TEST` | P1 | Release B | Identical normalized output for preview and delivery. |
| Final wedding/baptism email visual spec | `DECISION` due conflicting briefs | P2 | Design release | Owner approves one desktop/mobile reference per event/language family. |
| Approved Template 001 three vertical images and unified signature/footer | `PARTIAL / VISUAL ACCEPTANCE` | P2 | Design release | Desktop/mobile screenshots and test deliveries. |
| Owner changes Homepage SEO, hero, cards, services, portfolio CTA, story and testimonials | `LOCAL PASS` Sprint 39 | P1 | Release A | Migration 027, admin save, public render, fallback and mobile check. |
| Owner changes Contact/About images/content | `NEW` | P2 | Release E | Authenticated editor, preview/publish and fallback behavior. |
| Portfolio order/templates/signature/packages management | `PARTIAL; split into separate bounded features` | P2 | Release E | Feature-specific acceptance tests; no single unsafe generic HTML editor. |
| Publication permissions per client | `NEW / PRIVACY-CRITICAL` | P1 | Release E | Default deny, explicit consent/evidence and removal test. |
| Homepage facelift | `DECISION + DESIGN` | P3 | Design release | Approved mockup before code; does not block delivery fixes. |

## I. Named-record production checks

These are read-only audits first. Do not create, resend, repair or cancel anything until the exact record identity and current state are shown.

| Record | Check |
| --- | --- |
| Αναστασία και Θανάσης | One active 003 only; Friday 16/10 at 12:00 Europe/Athens; no duplicate. |
| Project Agapi / Ανθή | Reply cancellation persists; no regenerated 003. |
| Akis & Caroline | Inspect 007 history and event date before any resend. |
| Ιωάννης Γιαπαύλος | Proposal metadata remains repaired; correct event date; no resend. |
| Zerina & Nemanja | Κτήμα Νεφέλη, real portal URL in Calendar and consistent net invoice. |
| Monika & Angelo | Second photographer Θένια consistent across client, Calendar and Timeline. |
| Separate Anastasia draft | Keep distinct from Αναστασία/Θανάση until complete identity and prices are supplied. |

## J. Acceptance evidence required for every release

- Git commit and exact staged-file list.
- Local named verifier result plus TypeScript, scoped ESLint and production build.
- Linux standalone artifact name and SHA-256.
- Database migration preflight, backup evidence and postcondition verification when applicable.
- Production BUILD_ID, `/api/health`, homepage/admin route smoke tests and persistent storage counts.
- Scenario-specific screenshots/IDs/timestamps without exposing secrets.
- Rollback path and a statement of whether rollback was exercised or only prepared.
- Explicit distinction among `implemented locally`, `deployed`, and `live verified`.

## Immediate next action

Release A should bundle the already locally verified Sprint 38 and Sprint 39 changes. Before Git staging, exclude unrelated `tsconfig.json` and `scripts/build-papaki-linux-release.sh.sprint37-backup`. Migration 027 must be applied before the new build is activated because production preflight now requires `site_settings`.

After Release A is live, do the controlled Template 001 delivery test before starting Release B. If that test fails, freeze new email automation work and diagnose from the saved queue row, runner heartbeat, automation activity and delivery evidence rather than manually resending.
