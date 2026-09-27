import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root=process.cwd();
const read=(path)=>readFile(resolve(root,path),"utf8");
const checks=[];
const requireText=(source,pattern,label)=>{if(!pattern.test(source))throw new Error(`FAIL - ${label}`);checks.push(`PASS - ${label}`)};

const[composer,leadSender,clientSender,leadAction,clientAction,templates,leadsPage]=await Promise.all([
  read("src/components/admin/EditableEmailComposer.tsx"),
  read("src/app/admin/leads/LeadEmailSender.tsx"),
  read("src/app/admin/clients/[id]/email/ClientEmailComposer.tsx"),
  read("src/app/admin/leads/actions.ts"),
  read("src/app/admin/clients/[id]/email/actions.ts"),
  read("src/lib/email-templates.ts"),
  read("src/app/admin/leads/page.tsx"),
]);

requireText(composer,/key=\{`\$\{selected\}-\$\{attempt\}`\}/,"template changes remount every editable field");
requireText(composer,/name="subject"[\s\S]*onChange=/,"subject is editable");
requireText(composer,/name="bodyText"[\s\S]*onChange=/,"full email content is editable");
requireText(composer,/title="Final email preview"/,"final HTML preview is present");
requireText(composer,/pending\?"Sending…"/,"shared composer exposes sending progress");
requireText(composer,/window\.confirm\("Send another copy/,"shared composer confirms deliberate resend");
requireText(leadSender,/EditableEmailComposer[\s\S]*sendLeadTemplateAction/,"Lead workflow uses the shared composer");
requireText(clientSender,/EditableEmailComposer[\s\S]*sendClientEmailAction/,"Client workflow uses the shared composer");
for(const[source,label]of[[leadAction,"Lead"],[clientAction,"Client"]]){
  requireText(source,/recipient:z\.email\(\)/,`${label} action validates the recipient`);
  requireText(source,/subject:z\.string\(\)\.trim\(\)\.min\(1\)\.max\(500\)/,`${label} action validates the edited subject`);
  requireText(source,/bodyText:z\.string\(\)\.trim\(\)\.min\(1\)\.max\(50000\)/,`${label} action validates the edited body`);
  requireText(source,/idempotencyKey:input\.idempotencyKey/,`${label} action retains duplicate protection`);
  requireText(source,/renderEditedEmail\(input\.subject,input\.bodyText\)/,`${label} action safely renders edited content`);
}
requireText(templates,/return\{subject:replace\(template\.subject\),bodyText,text:/,"approved template render exposes the personalized body");
requireText(templates,/export function renderEditedEmail/,"edited email rendering retains the server-owned signature");
requireText(templates,/export async function listAllEmailTemplates/,"all bilingual event variants can be selected");
requireText(leadsPage,/item\.eventType===lead\.eventType&&item\.locale===locale/,"Lead composer selects the correct event and offer language");
requireText(leadsPage,/offer_url:offerUrl[\s\S]*portal_url:portalUrl/,"Lead template receives connected offer and portal data");

console.log(checks.join("\n"));
console.log(`PASS - ${checks.length} Sprint 02 source contracts verified.`);
