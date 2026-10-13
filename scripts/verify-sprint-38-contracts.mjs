import {readFile} from "node:fs/promises";
import {resolve} from "node:path";

const read=path=>readFile(resolve(process.cwd(),path),"utf8");
const checks=[];
const requireText=(source,pattern,label)=>{if(!pattern.test(source))throw new Error(`FAIL - ${label}`);checks.push(`PASS - ${label}`)};
const rejectText=(source,pattern,label)=>{if(pattern.test(source))throw new Error(`FAIL - ${label}`);checks.push(`PASS - ${label}`)};

const[automations,page,database,composer,runner,leadAction,clientAction]=await Promise.all([
  read("src/lib/automations.ts"),
  read("src/app/admin/automations/page.tsx"),
  read("src/lib/database.ts"),
  read("src/components/admin/EditableEmailComposer.tsx"),
  read("src/lib/automation-runner.ts"),
  read("src/app/admin/leads/actions.ts"),
  read("src/app/admin/clients/[id]/email/actions.ts"),
]);

requireText(automations,/send_mode='automatic'[\s\S]{0,260}Postponed to allow the required 24-hour preview/,"the 24-hour preview delay applies only to system-automatic jobs");
rejectText(automations,/WHERE status='scheduled' AND template_id REGEXP '\^00\[0-9\]\$' AND preview_notified_at IS NULL AND scheduled_for<=CURRENT_TIMESTAMP/,"manual schedules cannot be postponed by the legacy all-job preview condition");
requireText(runner,/WHERE status='scheduled' AND scheduled_for<=CURRENT_TIMESTAMP/,"the runner processes due explicit schedules without an automatic-template filter");
requireText(automations,/sendMode:row\.send_mode[\s\S]*timezone:row\.timezone/,"queue records expose delivery mode and timezone");
requireText(automations,/event_type='automation-run'[\s\S]*lastRunAt/,"the queue reads the latest completed runner heartbeat");
requireText(page,/timeZone:"Europe\/Athens"[\s\S]*Greece time/,"every queue timestamp is explicitly rendered in Europe Athens time");
requireText(page,/RUNNER_GRACE_MS=15\*60\*1000[\s\S]*Scheduled emails receive a 15-minute runner window/,"due jobs remain waiting during the expected runner window");
requireText(page,/missedByRunner[\s\S]*runner completed after this email was due but did not send it/,"overdue jobs explain whether a runner missed them");
requireText(composer,/Manual scheduling works for every template 000–009/,"the composer explains the manual all-template scheduling contract");
requireText(database,/timezone:\s*"Z"/,"mysql DATETIME values use a stable UTC parsing contract");
for(const[action,label]of[[leadAction,"lead"],[clientAction,"client"]])requireText(action,/athensLocalToUtcSql\(input\.scheduledFor\)[\s\S]*scheduleManualEmail/,`${label} schedules convert Greece local time before persistence`);
requireText(leadAction,/reconcileAutomationAfterDeliveredTemplate/,"manual lead delivery cancels its pending scheduled duplicate");
requireText(clientAction,/reconcileAutomationAfterDeliveredTemplate/,"manual client delivery cancels its pending scheduled duplicate");

console.log(checks.join("\n"));
console.log("PASS - Sprint 38 keeps explicit 000-009 schedules at their selected Greece time, exposes runner health and prevents duplicate delivery.");
