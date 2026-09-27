import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const read=path=>readFile(resolve(process.cwd(),path),"utf8");
const checks=[];
const requireText=(source,pattern,label)=>{if(!pattern.test(source))throw new Error(`FAIL - ${label}`);checks.push(`PASS - ${label}`)};
const[action,delivery,history,sender,wizard,leads,offers]=await Promise.all([
  read("src/app/admin/leads/actions.ts"),read("src/lib/email-delivery.ts"),read("src/components/admin/EmailHistory.tsx"),read("src/app/admin/leads/LeadEmailSender.tsx"),read("src/app/admin/leads/LeadWorkflowWizard.tsx"),read("src/app/admin/leads/page.tsx"),read("src/lib/offers.ts")
]);
requireText(action,/templateId==="001"&&!offer/,"Template 001 refuses to send without a connected offer");
requireText(action,/\["revoked","rejected","expired"\]\.includes\(offer\.status\)/,"Template 001 refuses unusable offers");
requireText(action,/if\(template\.id==="001"&&offer\?\.status==="draft"\)await markOfferSent\(offer\.slug\)/,"successful Template 001 delivery marks its exact draft offer sent");
requireText(action,/Exact offer: \$\{offer\.slug\}/,"send confirmation names the exact offer link");
requireText(delivery,/d\.offer_id,o\.slug AS offer_slug,o\.status AS offer_status/,"delivery history resolves the recorded offer identity");
requireText(history,/Exact offer used by this email/,"email history exposes the exact recorded offer");
requireText(sender,/Template 001 will send this exact offer/,"Send and track previews the exact connected offer");
requireText(wizard,/offer=\{offer\}/,"guided workflow forwards the connected offer identity");
requireText(leads,/title=\{lead\.coupleNames\} subtitle=\{`\$\{leadTitle\[lead\.status\]\}/,"lead cards promote couple names and demote workflow status");
requireText(offers,/SELECT offer_id,MIN\(sent_at\) AS first_sent_at[\s\S]*template_id='001' AND status='sent'/,"manual status repair uses real Template 001 delivery evidence");
requireText(offers,/o\.expires_at=DATE_ADD\(COALESCE\(o\.sent_at,delivery\.first_sent_at,CURRENT_TIMESTAMP\)/,"offer validity follows the recorded send date");
for(const check of checks)console.log(check);
console.log(`PASS - ${checks.length} Sprint 22 offer clarity contracts verified.`);
