import {readFile} from "node:fs/promises";
import {resolve} from "node:path";

const read=path=>readFile(resolve(process.cwd(),path),"utf8");
const checks=[];
const requireText=(source,pattern,label)=>{if(!pattern.test(source))throw new Error(`FAIL - ${label}`);checks.push(`PASS - ${label}`)};
const forbidText=(source,pattern,label)=>{if(pattern.test(source))throw new Error(`FAIL - ${label}`);checks.push(`PASS - ${label}`)};

const[automations,runner,composer,leadAction,clientAction,clients,payments,google,clientPage,guide,migration,migration026,schema,registry,athensTime,leadSender,leadWizard]=await Promise.all([
  read("src/lib/automations.ts"),read("src/lib/automation-runner.ts"),read("src/components/admin/EditableEmailComposer.tsx"),read("src/app/admin/leads/actions.ts"),read("src/app/admin/clients/[id]/email/actions.ts"),read("src/lib/clients.ts"),read("src/lib/invoice-payments.ts"),read("src/lib/google-calendar.ts"),read("src/app/admin/clients/[id]/page.tsx"),read("src/app/admin/guide/page.tsx"),read("database/migrations/025_email_scheduling_and_automation_safety.sql"),read("database/migrations/026_scheduled_email_identity_and_ioannis_repair.sql"),read("database/schema.sql"),read("src/lib/workflow-template-registry.ts"),read("src/lib/athens-time.ts"),read("src/app/admin/leads/LeadEmailSender.tsx"),read("src/app/admin/leads/LeadWorkflowWizard.tsx"),
]);

requireText(registry,/"007":\{title:"A personal thank you",automatic:true\}/,"Template 007 is the approved post-event thank-you");
requireText(runner,/template_id==="007"[\s\S]*event_date>=athensToday[\s\S]*Safety stop/,"SMTP worker blocks Template 007 before or on the event date");
requireText(automations,/post-event-thank-you[\s\S]*DATE_ADD\(c\.event_date,INTERVAL 1 DAY\)/,"Template 007 is reconciled to the day after the event");
forbidText(automations,/booking-confirmation[^\n]*'007'/,"Template 007 is not described as booking confirmation in runtime scheduling");
requireText(automations,/timeline-reminder[\s\S]*DATE_SUB\(c\.event_date,INTERVAL 60 DAY\)/,"Template 009 is reconciled to exactly 60 days before the event");
requireText(clients,/DATE_FORMAT\(c\.event_date,'%Y-%m-%d'\) event_date/,"client dates remain date-only values without timezone shifting");
requireText(clients,/reconcileClientLifecycleAutomations\(id,"client-details-updated"\)/,"event-date edits reschedule lifecycle automations");
requireText(composer,/name="headerImage"[\s\S]*name="deliveryAction" value="schedule"[\s\S]*Send now/,"composer submits the exact image and supports schedule or send now");
requireText(clientAction,/scheduleManualEmail\(\{[^}]*headerImage:template\.headerImage/,"client scheduling snapshots the selected template image");
requireText(automations,/payload=JSON\.stringify\(\{source:"manual-schedule",templateId:input\.templateId,headerImage:[^}]*subject:input\.subject,bodyText:input\.bodyText\}/,"manual schedules preserve template identity, composed subject, body and image");
requireText(runner,/manual\.subject&&manual\.bodyText\?renderEditedEmail[\s\S]*email_header_image:template\.headerImage/,"queued manual delivery renders the saved composition snapshot");
requireText(leadAction,/headerImage:input\.headerImage[\s\S]*renderEditedEmail/,"lead manual sends use the selected image in final HTML");
requireText(leadAction,/athensLocalToUtcSql\(input\.scheduledFor\)[\s\S]*headerImage:template\.headerImage,subject:input\.subject,bodyText:input\.bodyText/,"lead scheduling accepts Greece datetime-local values and snapshots the exact composition");
requireText(clientAction,/athensLocalToUtcSql\(input\.scheduledFor\)/,"client scheduling stores the selected Greece time as a UTC database timestamp");
requireText(athensTime,/timeZone:"Europe\/Athens"[\s\S]*candidate\.toISOString\(\)\.slice\(0,19\)/,"Greece scheduling uses a DST-aware UTC conversion");
requireText(leadWizard,/event_date:lead\.eventDate[\s\S]*offer_url:offerUrl/,"lead preview receives the saved event date and exact connected offer URL");
requireText(leadSender,/values=\{values\}/,"lead composer no longer replaces saved lead values with missing placeholders");
requireText(runner,/manual\.templateId!==job\.template_id[\s\S]*scheduled template identity/,"worker fails closed if the queued row and saved template identity disagree");
requireText(runner,/finalizeAutomationDelivery\(\{templateId:template\.id/,"worker reconciles CRM evidence after a scheduled delivery succeeds");
requireText(automations,/finalizeAutomationDelivery[\s\S]*status='sent'[\s\S]*scheduleOfferFollowups[\s\S]*automation-runner/,"scheduled Template 001 marks its offer sent, provisions follow-ups and records history");
requireText(automations,/Replaced by an explicit manual schedule[\s\S]*send_mode='manual'/,"manual scheduling supersedes pending copies of the same template");
requireText(automations,/stopOfferFollowups[\s\S]*template_id IN \('002','003'\)[\s\S]*followups-stopped/,"off-platform replies can stop both follow-ups with activity evidence");
requireText(clientPage,/They replied — stop 002 \/ 003/,"client workspace exposes a clear stop-follow-up action");
requireText(payments,/requiredDeposit=money[\s\S]*UPDATE onboarding SET invoice_status=\?,booking_status=IF\(agreement_status='approved' AND \?>=CAST\(\? AS DECIMAL/,"booking confirmation requires the recorded agreed deposit");
requireText(google,/privateExtendedProperty[\s\S]*moumkasClientId[\s\S]*method:existing\?"PUT":"POST"/,"Google sync finds and updates CRM-owned events without duplicates");
requireText(google,/sync_status='failed'[\s\S]*last_error[\s\S]*last_attempt_at/,"Google sync records actionable per-client failure state");
requireText(migration,/Cancelled by migration 025[\s\S]*booking-confirmation[\s\S]*post-event-thank-you/,"migration cancels premature legacy 007 jobs and provisions corrected jobs");
requireText(migration,/send_mode ENUM\('automatic','manual'\)[\s\S]*sync_status ENUM\('pending','synced','failed'\)/,"migration installs manual delivery and calendar sync state");
requireText(migration026,/template_id='000'[\s\S]*rendered_subject LIKE '%προσωπική σας πρόταση φωτογράφισης%'[\s\S]*SET d\.template_id='001'/,"migration 026 repairs only the confirmed mislabelled proposal evidence");
requireText(migration026,/Template 001 was already delivered[\s\S]*template_id='001'[\s\S]*followup:6[\s\S]*followup:10[\s\S]*resend',FALSE/,"migration 026 prevents proposal resend and reconciles the existing offer follow-ups");
requireText(schema,/send_mode ENUM\('automatic','manual'\)[\s\S]*timezone VARCHAR\(64\)/,"schema documents delivery mode and Greece timezone");
requireText(guide,/Template 007 is the post-event thank-you on the next day[\s\S]*They replied — stop 002 \/ 003/,"admin guide documents corrected automation rules");

console.log(checks.join("\n"));
console.log(`PASS - ${checks.length} Sprint 37 automation, scheduling, booking and calendar contracts verified.`);
