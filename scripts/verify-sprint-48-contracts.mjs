import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

const [sendEmail, runner, automations, migration, guide, verification] = await Promise.all([
  read("src/app/sendEmail.ts"),
  read("src/lib/automation-runner.ts"),
  read("src/lib/automations.ts"),
  read("database/migrations/028_disable_website_template_000_automation.sql"),
  read("src/app/admin/guide/page.tsx"),
  read("public/googleaa25c3be9bae904b.html"),
]);

assert.match(sendEmail, /createLead\(/, "Website inquiry must still create a lead");
assert.match(sendEmail, /source:\s*"website-inquiry"/, "Lead source must remain website-inquiry");
assert.match(sendEmail, /getSmtpTransport\(/, "Internal SMTP notification must remain enabled");
assert.match(sendEmail, /replyTo:\s*data\.email/, "Internal notification must reply to the inquiry email");
assert.match(sendEmail, /acknowledgement:\s*"manual-required"/, "Response must expose the manual acknowledgement contract");
assert.doesNotMatch(sendEmail, /scheduleLeadAcknowledgement|completeLeadAcknowledgement|sendWebsiteAcknowledgement|recordLeadEmailSent|getEmailTemplate|renderTemplate/, "Website inquiry must not schedule, render, send or record Template 000");

assert.doesNotMatch(automations, /scheduleLeadAcknowledgement|completeLeadAcknowledgement/, "Legacy automatic acknowledgement helpers must be removed");
assert.match(automations, /send_mode='automatic'[\s\S]*template_id NOT IN \('002','003','007','009'\)/, "Automation preparation must allowlist only approved automatic templates");
assert.match(automations, /send_mode,scheduled_for[\s\S]*VALUES \([^)]*'manual'/, "Explicit manual scheduling must remain available");

assert.match(runner, /new Set\(\["002","003","007","009"\]\)/, "Runtime automatic allowlist must contain only 002, 003, 007 and 009");
assert.match(runner, /job\.send_mode==="automatic"&&!automaticTemplateIds\.has\(job\.template_id\)/, "Runner must reject non-allowlisted automatic jobs");
assert.match(runner, /status='cancelled'/, "Rejected automatic jobs must be cancelled");

for (const contract of [
  /template_id = '000'/,
  /send_mode = 'automatic'/,
  /job_type = 'lead-acknowledgement'/,
  /status IN \('scheduled', 'failed', 'processing'\)/,
  /website-inquiry/,
]) assert.match(migration, contract, `Migration contract missing: ${contract}`);
assert.doesNotMatch(migration, /\bDELETE\b/i, "Migration must preserve audit records");

assert.match(guide, /Website inquiries never queue or send Template 000/, "Admin guide must describe the new manual-only policy");
assert.match(guide, /send Template 000 explicitly from the CRM/, "Admin guide must describe the explicit CRM action");
assert.equal(verification.trim(), "google-site-verification: googleaa25c3be9bae904b.html", "Google verification file must be release-safe");

console.log("PASS - Sprint 48 website inquiry Template 000 contracts verified");
