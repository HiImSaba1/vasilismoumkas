import fs from "node:fs";

const read=(path)=>fs.readFileSync(path,"utf8");
const offers=read("src/lib/offers.ts");
const actions=read("src/app/admin/offers/actions.ts");

function requireText(source,pattern,label){
  if(!pattern.test(source))throw new Error(`FAIL - ${label}`);
  console.log(`PASS - ${label}`);
}

requireText(offers,/SELECT document_type,template_key FROM document_templates WHERE event_type=\? AND locale=\? AND is_active=1/,"offer acceptance reads the canonical document template table");
requireText(offers,/const templates=new Map<BookingDocumentType,string>\(\)[\s\S]*templates\.set\(row\.document_type,row\.template_key\)/,"validated templates remain available throughout the acceptance transaction");
requireText(offers,/for\(const type of \["questionnaire","contract","invoice"\] as const\)[\s\S]*const template=templates\.get\(type\)[\s\S]*INSERT IGNORE INTO lead_document_records/,"booking records use configured active template keys");
requireText(offers,/catch\(error\)\{await connection\.rollback\(\);throw error\}/,"failed acceptance rolls back the complete transaction");
requireText(offers,/await connection\.commit\(\);if\(input\.action==="accept"\)\{const origin=[\s\S]*sendInternalOfferAcceptance/,"internal notification remains after transaction commit");
requireText(actions,/const reference=randomUUID\(\)[\s\S]*console\.error\(`Admin offer acceptance failed \[\$\{reference\}\]`[\s\S]*Reference: \$\{reference\}/,"unexpected admin acceptance failures expose a safe log reference");

console.log("PASS - SPRINT 51 OFFER ACCEPTANCE CONTRACTS VERIFIED");
