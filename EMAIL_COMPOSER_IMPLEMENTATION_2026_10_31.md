# CRM email composer — implementation 31 October 2026

## Implemented

### Completion and received-email fix

- Customer subjects use an idempotent Vasilis Moumkas Wedding/Baptism Photography prefix. The same final subject is shown/submitted by the designer/composer. TEST markers remain limited to test sends; existing subject wording stays editable.

- Inbox spacing follow-up: body padding (32px vertical/24px horizontal), heading/body fonts and hero side margins are inline rather than relying on head CSS. Light panels use explicit bgcolor and text colors. The off-white gradient lock was removed after inbox evidence showed light text being inverted on a locked light panel; background and foreground can now adapt together. All layout table/cell borders are reset inline while button outlines remain. Client-forced inversion still needs real inbox acceptance.
- The original signature PNG and the two fixed social PNGs are embedded as CID MIME attachments for tracked sends, owner tests and sent-archive copies. Only these three allowlisted public files can be read; no supplied URL or file path is fetched. Missing files block delivery. The saved HTML retains canonical public image URLs; SMTP substitutes content IDs carrying the same image bytes. No website paths or files are replaced.
- Offline MIME verification checks the real original-logo bytes, all three content IDs, image MIME parts, unknown-path exclusion and missing-file failure. No network or real SMTP was used.

- The versioned envelope now accepts LF, browser-form CRLF and previously escaped line separators. It unwraps an otherwise empty legacy double wrapper; wrappers containing additional edits stop with a repair message rather than silently losing content. This reproduces and fixes the raw JSON shown in the received test email.
- A final delivery guard blocks internal `VM_EMAIL_V…` payloads before SMTP or delivery-row insertion. Offline tests cover CRLF, nested recovery and rejection at the tracked delivery boundary. No replacement real email has been sent by the agent.
- Server-backed composer drafts use the existing site_settings table under a private email-draft namespace, scoped to entity/event/locale/template. Authenticated actions validate the source record/template. Transactional revision comparison prevents stale device writes and stale clearing after delivery. Local backup is retained when the server is unavailable or a conflict occurs. No migration or production database write was run.
- The designer opens with the approved editorial layout while retaining saved copy. 002/003 have a compact main-photo-off option. A separate, confirmed collection action applies the common layout to 000–009 for one event/language, checking all expected versions in a transaction. It preserves subject, images, active flags and automation metadata and excludes test 010. No collection action was executed.
- Explicit off-white bgcolor/background styling now covers the image/content/logo panels, with light color-scheme hints. Some email clients force their own dark-mode transformations; Gmail/Apple Mail inbox acceptance remains required.
- GA4 access/Measurement ID must come from Vasilis. See GA4_OWNER_HANDOFF_2026_10_31.md. No Analytics configuration was guessed or changed. Owner-authorized Gmail testing is documented in EMAIL_INBOX_ACCEPTANCE_2026_10_31.md; Apple Mail acceptance is separate.

### Section builder and test layout 010

- 010 uses an editorial footer variant: redundant standalone signature names and the printed name/job title under the logo are hidden in the visual email. The centered 350px logo remains. The original logo stays on the light panel. Below it the charcoal footer contains a centered website button, a single phone/email row and then centered social icons. Buttons use admin yellow #FFFFC4; only the existing studio social destinations are included. Standard templates retain their previous footer/button appearance.

- Add Image / Text / Image + text columns / Button sections after the introduction. Insert between sections, reorder, duplicate with fresh IDs, remove and undo the most recent removal. Maximum 30 sections. Photo library and alt fields are independent per image.
- Shared renderer preserves the saved order, uses presentation tables, stacks columns on mobile and includes section text/links/image descriptions in the plain-text alternative. Preview-only assets resolve against localhost; outgoing email assets use the public origin. Signature remains centered at 350px.
- Server actions validate section structure, image-library membership and required fields. Connected offer/portal section buttons are validated before immediate or scheduled sends. Older V1 drafts without sections load with an empty section list.
- 010 TEST is a read-only starter derived from 000 for each existing event/language collection. It presents the original body across three photo/text groups and the shared footer; it does not overwrite 000. Initial photos are sample selections from the existing portfolio and can be changed.
- Viewing 010 does not write to the database. Save template explicitly persists the 010 base/variant in one transaction, always inactive; it remains outside 000–009 customer-send/automation flows. Save 010 before using tracked test delivery. No templates were seeded or saved by the agent.
- Offline tests cover legacy envelopes, order and snapshot round trips, section validation, duplicate IDs, image paths, mobile CSS, plain text, 010 source preservation and transactional 010-only writes with a fake database.

### Email Templates workspace follow-up

- `/admin/email-templates` now opens directly in a two-column workspace, editor left/live preview right. Template 001 is the default starting selection. The template picker stays in the header; the sidebar and separate saved-only preview have been removed.
- `Use basic visual template` loads a reusable style draft for the selected event/language. It keeps the subject and image, replaces editor content only after confirmation, and requires Save template before any database change. It does not create a new workflow template ID or bulk-overwrite existing templates.
- Preview responds to unsaved field/image changes and uses labeled sample customer details and non-customer sample links. Desktop/mobile toggles remain visible. Advanced variables/status and delivery history are collapsed.
- Test delivery on this page now renders the current unsaved design with the same samples/renderer as the preview. No lead/client/offer association or follow-up mutation is passed to the test delivery.
- Unsaved changes warn on page exit and when selecting another template. Scoped lint, TypeScript and offline design/test-render checks pass. Local browser visual inspection was blocked by the local admin login screen; authenticated visual acceptance remains pending.

- Lead Send & Track and Client Compose use the shared structured composer. Separate title, salutation, introduction, connected CTA, image/alt, optional photographic gallery, optional video services/samples/disclaimer, closing, signature and footer.
- New table-based responsive layout follows the reviewed palette and 600px card, 17px left-aligned body, serif headings, 36/22px padding and beige buttons. Supplied signature PNG is bundled as a public email asset. Photos use natural proportions.
- Safe subset of formatting: paragraphs, bold, small headings, lists, labeled links. The introduction supports selecting a phrase and adding its URL. Raw HTML is escaped and invalid URL schemes are rejected.
- Per-message image picker lives inside the currently selected template. It cannot write template defaults. Shared defaults are edited separately in Email Templates with an explicit confirmation.
- Existing approved bodies are retained on conversion; the literal Direct collaborator line and known legacy signature are removed from converted plain text. No invented child names or recipient greetings are inserted. Fill the separate salutation explicitly when job name differs from parent name.
- Template switching offers Keep my text / Load template or its saved draft / Cancel. Drafts are scoped by lead/client, event, locale and template. Autosave is server-backed with revision checks and a browser-local backup when the server is unavailable. Existing email history remains server-backed.
- Before real send/schedule: recipient, subject, event/locale/template and linked offer are shown for confirmation. Server authentication, recipient ownership, available template, approved image, required variables and connected CTA are checked independently.
- Test to owner uses the configured internal mailbox and exact composed renderer. It has no tracked client delivery, offer status change, workflow reconciliation, sent archive or follow-up scheduling. Its action is authenticated, and the client cannot supply a destination address.
- Immediate real deliveries retain existing idempotency protection and exact rendered HTML/text history. Manual schedules carry the versioned body snapshot through the existing scheduler. Follow-up timing/conditions are unchanged.
- Saved templates can opt into structured layout; old templates still render with the legacy renderer until explicitly converted and saved. No seed, bulk overwrite or migration.

## Verification

`scripts/verify-email-composer-2026-10-31.ps1`: scoped ESLint, offline renderer/action/snapshot checks, TypeScript, production build. The offline harness forbids unexpected app dependencies and replaces SMTP with a fake.

Scoped ESLint, offline checks and TypeScript were run during implementation. Owner build and browser acceptance remain separate gates. No real email or production writes were executed.

## Acceptance before deployment / rollout

1. Open a designated lead and client composer; verify draft reload, image changes without text loss, all three template-switch choices and independent GR/EN drafts.
2. Compare 390px/desktop preview; enable/disable gallery/video and verify there are no leftover spacers. Confirm linked offer belongs to that record.
3. Confirm image picker label follows 001/002/003 selection and only template-default save changes future messages.
4. On authorized owner test mailboxes verify Gmail and Apple Mail, image-disabled rendering, readable labeled links, natural image proportions, no overflow and preview/send equivalence. WebP portfolio sources require particular mail-client checking; choose JPEG/PNG from the existing library if the target client cannot display WebP.
5. Verify real customer send only when explicitly authorized; verify exact history snapshot and existing workflow effects. Test-to-owner must leave offer/workflow/queue unchanged.

## Explicit limits

- Server drafts require the existing site_settings table; if it is missing locally, the UI reports local-backup-only mode. No schema is created automatically. Cross-device and conflict behavior still need authenticated acceptance.
- New image uploads continue through the existing portfolio library; this change does not add an independent email upload/storage system or crop tool.
- Signature is the supplied logo plus fixed existing contact/social details; no portrait or handwritten asset was invented.
- No GA4 installation/configuration, public website styling/animations, production port or application path changes.
- No deployment performed. Existing payments and the earlier baptism payment-date/method question are outside this change.
