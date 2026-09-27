import {readFile} from "node:fs/promises";
import {resolve} from "node:path";

const read=path=>readFile(resolve(process.cwd(),path),"utf8");
const checks=[];
const requireText=(source,pattern,label)=>{if(!pattern.test(source))throw new Error(`FAIL - ${label}`);checks.push(`PASS - ${label}`)};
const[approved,contracts,portals,offers,dashboard,wedding,baptism,leadPage,wizard]=await Promise.all([
  read("src/lib/approved-contracts.ts"),
  read("src/lib/contract-templates.ts"),
  read("src/lib/client-portals.ts"),
  read("src/lib/offers.ts"),
  read("src/app/admin/dashboard/page.tsx"),
  read("src/app/admin/dashboard/WeddingDashboard.tsx"),
  read("src/app/admin/dashboard/BaptismDashboard.tsx"),
  read("src/app/admin/leads/[id]/page.tsx"),
  read("src/app/admin/leads/LeadWorkflowWizard.tsx"),
]);

requireText(approved,/approvedBaptismEnContract[\s\S]*approvedWeddingEnContract[\s\S]*approvedBaptismGrContract[\s\S]*approvedWeddingGrContract/,"all four approved agreement files are bundled");
requireText(approved,/PRIVATE BAPTISM PHOTOGRAPHY AGREEMENT[\s\S]*PRIVATE WEDDING PHOTOGRAPHY AGREEMENT/,"approved English agreements remain event specific");
requireText(approved,/ΙΔΙΩΤΙΚΟ ΣΥΜΦΩΝΗΤΙΚΟ ΦΩΤΟΓΡΑΦΙΚΗΣ ΚΑΛΥΨΗΣ ΒΑΠΤΙΣΗΣ[\s\S]*ΙΔΙΩΤΙΚΟ ΣΥΜΦΩΝΗΤΙΚΟ ΓΑΜΗΛΙΑΣ ΦΩΤΟΓΡΑΦΙΣΗΣ/,"approved Greek agreements remain event specific");
requireText(contracts,/contractForWorkflowProfile[\s\S]*eventType==="baptism"/,"contract selection is event and language aware");
requireText(contracts,/resolveContractForWorkflowProfile[\s\S]*knownWeddingDefault/,"legacy generated wedding defaults are repaired for baptism portals");
requireText(portals,/resolveContractForWorkflowProfile\(data\.contract_text,portal\.event_type,language\)/,"portal resolves the contract from its event and accepted-offer language");
requireText(offers,/contractForWorkflowProfile\(offer\.event_type,offer\.language\)/,"new accepted offers persist the correct profile contract");
requireText(offers,/profilePrefix=`\$\{offer\.event_type\}-\$\{offer\.language\}`/,"new documents use profile-specific template keys");
requireText(dashboard,/requestedLang:"gr"\|"en"=searchParams\.get\("lang"\)==="gr"\?"gr":"en"/,"offer builder reads the workflow language query with a strict language union");
requireText(dashboard,/lang:requestedLang/,"prefilled lead carries its chosen offer language");
requireText(wedding,/initialLead\?\.lang \?\? "en"/,"wedding builder initializes from the selected workflow language");
requireText(baptism,/initialLead\?\.lang \?\? "gr"/,"baptism builder initializes from the selected workflow language");
requireText(leadPage,/lang:lead\.workflowLocale==="el"\?"gr":"en"/,"lead detail prefilled-offer link preserves its workflow language");
requireText(wizard,/lang:lead\.workflowLocale==="el"\?"gr":"en"/,"guided wizard preserves its workflow language");

console.log(checks.join("\n"));
console.log(`PASS - ${checks.length} Sprint 28 workflow profile contracts verified.`);
