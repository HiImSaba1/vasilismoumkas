# CRM approved email layout and external-send recording — 5 November 2026

## Scope and cause

Source: owner-supplied email and `C:\Users\sab_j\Downloads\CRM-001-approved-layout-reference.html`.

The structured renderer hardcoded yellow `#FFFFC4` buttons, a dark `#292724` editorial footer, image social icons and suppression of the text signature. Saving stores a composition envelope; preview and delivery rebuild that envelope through the renderer, so editing or loading a different starting composition could not override those constants. This is a source diagnosis; the reported production wedding/EL/001 version 21 has not been queried or modified.

## Implemented behavior

- Structured standard/editorial emails share a light signature: logo, localized name, Fine Art Photographer, tel/mailto/site, text Instagram/Pinterest. Buttons use beige `#D9CEC3` with `#b7aaa0` border. Legacy plain-text rendering uses the same signature and palette. Archived deliveries are never rewritten.
- Existing structured templates, saved customer drafts and queued compositions render through the corrected renderer without replacing their saved personal copy, variables, images, gallery settings or sections. Existing content order is preserved.
- Wedding/EL/001 has an explicit **Load approved wedding 001 layout** button. It loads the reference image paths and ordered sections into the editor only. It does not save automatically or replace existing customer drafts. Greeting uses `couple_names`; the offer button uses the actual connected offer. Personal introduction and optional practical details are editable text sections, initially empty, rather than unsupported global placeholders. Gallery/video are disabled only in this explicit 001 starting layout.
- The approved preset uses the reference's three exact photo paths. Two uploaded photos are not present in this local checkout. The existing server-side portfolio allowlist still applies: verify all three exist in the installed server's portfolio library and are publicly reachable before saving/sending. No substitute image was invented or uploaded.
- Template-designer tests require the saved subject/body/header and the recipient `vasilis.moumkas@gmail.com`. Unsaved or different recipient requests are rejected server-side. Tests use SMTP without inserting customer delivery rows, changing workflow or reconciling automations. Customer-composer tests are also restricted to that owner address; they retain their explicit current-draft preview behavior.

## External Gmail 001

The lead workspace now contains **Καταγραφή εξωτερικής αποστολής 001** and a separate **Gmail / εξωτερικές αποστολές** history. This is a historical-exception recorder, not a Gmail sending channel.

The authenticated operator supplies the actual send time in Europe/Athens, recipient, subject and evidence/Message-ID, and confirms that the email already went out. The server validates the connected offer and saved lead email, rejects future/invalid dates, records an `external-email-recorded` activity with UTC time, original source and evidence, and cancels pending/failed 001–003 jobs for that lead/offer/connected client. A repeated submission returns the existing result rather than adding a duplicate.

No email is sent, no SMTP delivery is fabricated and no offer, booking or workflow status is advanced. Therefore a draft offer intentionally remains draft; external-send evidence is displayed separately from CRM sent-mail counts. This avoids starting the existing mark-offer-sent/follow-up machinery. The contact hold remains in force for this lead and requires a separate reviewed future change to release; there is no automatic expiry or bypass button.

001–003 scheduling, runner execution and tracked delivery check the hold. Delivery reservation locks the lead row and rechecks the hold before recording a queued delivery. External registration takes the same lead lock and refuses an active queued delivery/processing job. This prevents registration racing with a new tracked send. A stale queued delivery must be investigated; the recorder does not overwrite it.

This implementation uses the existing activity log and queue tables; no schema migration is required. Dimitris & Anna Maria have not been located, edited, recorded or emailed in this work. Their exact recipient, offer, Gmail evidence and actual send time must be verified by the owner before the new recorder is used.

## Verification and remaining gates

Passed locally: scoped ESLint, TypeScript, and `node scripts/verify-email-approved-layout-2026-11-05.mjs`. The offline harness covers renderer styles/locales, save/reload and regenerated HTML, draft preservation/conflicts, 001 section order, safe links, single signature, MIME logo attachment, saved-only owner tests, external recording/deduplication/recipient mismatch, blocked 001–003 delivery, and the reservation-time hold recheck. These use mocks, not a real database or SMTP server; concurrent MySQL behavior still needs integration acceptance.

Run the owner verification script next:

```powershell
& {
    Set-Location -LiteralPath 'C:\Users\sab_j\Desktop\Projects\moumkas-new\moumkas-awwwards'
    & .\scripts\verify-email-approved-layout-2026-11-05.ps1
}
```

This runs scoped lint, offline checks, TypeScript and production build and captures a transcript. It does not deploy, migrate, seed or send email. The old 31 October offline harness predates this approval and asserts the superseded footer; use the new 5 November verification script for this change.

After successful owner verification and the normal guarded release:

1. On test records, save wedding/EL/001, close/reopen/reload, and verify the beige button, light signature, correct ordered sections and exact approved photos. Inspect each image URL. Review and save any intended personal wording; do not overwrite old customer drafts just to change their styling.
2. Load it into a customer test draft, save/reload the draft and verify the connected personal offer URL. Also inspect representative old standard/editorial drafts and all 000–009 variants for content, variables, correct purpose and absence of old footer colors. Existing archived sent emails must remain unchanged.
3. Send from CRM only to `vasilis.moumkas@gmail.com`. Designer tests use sample links; use a test customer's composer for a connected-offer test. Check delivered HTML in desktop and actual iPhone/Safari or mail client and Android/Chrome or mail client: correct photos/proportions, no horizontal overflow, working tel/mailto/site/social links, single signature. Offline HTML checks do not prove inbox/mobile acceptance.
4. Compare workflow/status, client sent-mail count and automation rows before/after each test: unchanged.
5. On a test lead with a connected draft offer, record an external 001. Verify separate source/evidence history, duplicate submission behavior, unchanged draft/workflow, cancelled pending 001–003 and rejection of new 001–003 sends/schedules. Attempt registration while a test job is processing: it must refuse. Verify unrelated 004–009 remain unaffected. No real customer email is needed.
6. Only after the above, use the new recorder for the real external Gmail exception with owner-verified evidence. Never resend that 001.

Production build, deployment, server photo/library availability, real database integration, saved/reloaded browser acceptance and delivered desktop/mobile SMTP tests remain pending. No real email has been sent by Codex.
