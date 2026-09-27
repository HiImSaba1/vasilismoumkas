import{readFile}from"node:fs/promises";import{resolve}from"node:path";
const read=path=>readFile(resolve(process.cwd(),path),"utf8");const checks=[];const requireText=(source,pattern,label)=>{if(!pattern.test(source))throw new Error(`FAIL - ${label}`);checks.push(`PASS - ${label}`)};
const[delivery,lead,client,automation,manifest,guide]=await Promise.all([read("src/lib/email-delivery.ts"),read("src/app/admin/leads/actions.ts"),read("src/app/admin/clients/[id]/email/actions.ts"),read("src/lib/automation-runner.ts"),read("scripts/prepare-sprint-07-release-manifest.mjs"),read("SPRINT_07_RELEASE.md")]);
requireText(delivery,/\[SENT\] · \$\{input\.templateId\} · \$\{input\.archive\.templateName\.trim\(\)\} · \$\{input\.archive\.coupleNames\.trim\(\)\} · \$\{date\}/,"Gmail archive subject contains SENT, template id, template title, couple and date");
requireText(delivery,/to:`Vasilis Moumkas <\$\{internalRecipient\(\)\}>`/,"archive copy uses the configured internal Gmail recipient");
requireText(delivery,/subject:input\.subject,html:input\.html,text:input\.text/,"client delivery keeps the original subject and content");
requireText(delivery,/if\(input\.archive\)[\s\S]*sendSentArchiveCopy/,"archive copy is created only for opted-in CRM sends");
requireText(delivery,/catch\(archiveError\)[\s\S]*success:true/,"archive failure cannot falsely mark client delivery as failed");
for(const[source,label]of[[lead,"Lead"],[client,"Client"],[automation,"Automation"]]){requireText(source,/archive:\{templateName:template\.name,coupleNames:/,`${label} delivery supplies structured archive metadata`)}
requireText(lead,/A \[SENT\] copy was archived to Gmail/,"Lead send confirmation reports Gmail archive success");
requireText(client,/A \[SENT\] copy was archived to Gmail/,"Client send confirmation reports Gmail archive success");
requireText(automation,/Gmail \[SENT\] archive copy failed/,"automation retains an archive warning without resending the client email");
for(const file of["src/lib/email-delivery.ts","src/app/admin/leads/actions.ts","src/app/admin/clients/[id]/email/actions.ts","src/lib/automation-runner.ts"])requireText(manifest,new RegExp(file.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")),`${file} is included in the release manifest`);
requireText(manifest,/No database migration or SQL import is required/,"release requires no database migration");
requireText(guide,/Create a Gmail filter/,"deployment guide documents the Gmail rule");
console.log(checks.join("\n"));console.log(`PASS - ${checks.length} Sprint 07 contracts verified.`);
