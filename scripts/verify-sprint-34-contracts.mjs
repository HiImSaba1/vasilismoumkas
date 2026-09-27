import {readFile,stat} from "node:fs/promises";
import {resolve} from "node:path";

const read=path=>readFile(resolve(process.cwd(),path),"utf8");
const checks=[];
const requireText=(source,pattern,label)=>{if(!pattern.test(source))throw new Error(`FAIL - ${label}`);checks.push(`PASS - ${label}`)};

const[
  images,hero,chess,layout,gallery,outro,portalMarquee,portalPage,portalPdf,
  questionnaireDefinitions,questionnaires,questionnairePage,portalData,pdfData,
  calendarPage,calendarDay,googleCalendar,
]=await Promise.all([
  read("src/app/(site)/data/proposal-image-sequence.ts"),
  read("src/components/sections/OfferPage/OfferHero.tsx"),
  read("src/components/sections/OfferPage/OfferChess.tsx"),
  read("src/components/sections/OfferPage/OfferLayout.tsx"),
  read("src/components/sections/OfferPage/BaptismOfferGallery.tsx"),
  read("src/components/sections/OfferPage/OfferOutro.tsx"),
  read("src/app/portal/[slug]/PortalMarquee.tsx"),
  read("src/app/portal/[slug]/page.tsx"),
  read("src/app/api/portal/[slug]/documents/[type]/pdf/route.ts"),
  read("src/lib/questionnaire-definitions.ts"),
  read("src/lib/questionnaires.ts"),
  read("src/app/questionnaire/[token]/page.tsx"),
  read("src/lib/client-portals.ts"),
  read("src/lib/client-document-pdf.ts"),
  read("src/app/admin/calendar/page.tsx"),
  read("src/app/admin/calendar/CalendarReservedDay.tsx"),
  read("src/lib/google-calendar.ts"),
]);

const baptismFiles=[
  "baptism-family-joy-hero-vasilis-moumkas.jpg",
  "baptism-family-moment-vasilis-moumkas.jpg",
  "baptism-girl-portrait-vasilis-moumkas.jpg",
  "baptism-decoration-details-vasilis-moumkas.jpg",
  "baptism-child-editorial-portrait-vasilis-moumkas.jpg",
  "baptism-ceremony-moment-vasilis-moumkas.jpg",
  "baptism-emotional-moment-vasilis-moumkas.jpg",
];
let previous=-1;
for(const filename of baptismFiles){
  const index=images.indexOf(filename);
  if(index<0||index<=previous)throw new Error(`FAIL - baptism image is missing or out of order: ${filename}`);
  previous=index;
  const info=await stat(resolve(process.cwd(),"public/vm_img/baptism-crm-final-images-200kb",filename));
  if(info.size<=0||info.size>200*1024)throw new Error(`FAIL - baptism image must be non-empty and no larger than 200 KiB: ${filename}`);
}
checks.push("PASS - the seven supplied baptism images exist, stay below 200 KiB and preserve the approved order");
requireText(images,/baptismProposalMainImages[\s\S]*baptismProposalSmallImages[\s\S]*baptismProposalImageSequence=\[\.\.\.baptismProposalMainImages,\.\.\.baptismProposalSmallImages\]/,"baptism imagery is exposed as one fixed seven-image manifest");
requireText(hero,/type==="baptism"\?baptismProposalMainImages\[0\]:weddingProposalMainImages\[0\]/,"baptism offer hero always uses the approved first image");
requireText(chess,/eventType==="baptism"\?baptismProposalMainImages\[idx\+1\]:weddingProposalMainImages\[idx\+1\]/,"baptism offer collections use the approved second and third images");
requireText(layout,/isBaptism\?<BaptismOfferGallery[\s\S]*hideMarquee=\{isBaptism\}/,"baptism offer renders its fixed detail gallery and suppresses the random footer marquee");
requireText(gallery,/baptismProposalSmallImages\.map[\s\S]*src=\{image\.src\}[\s\S]*alt=\{image\.alt\}/,"baptism offer detail gallery renders the final four images with their descriptive alt text");
requireText(outro,/if\(isBaptism\)return/,"baptism offer outro cannot add unapproved pool images");
requireText(portalMarquee,/eventType==="wedding"\?weddingProposalSmallImages:baptismProposalImageSequence/ ,"client portal selects the fixed seven-image baptism sequence");

requireText(portalPdf,/allowed=new Set<DownloadableDocumentType>\(\["contract","questionnaire","invoice"\]\)[\s\S]*getPortalBySlug\(slug\)[\s\S]*renderClientDocumentPdf[\s\S]*download.*===\s*"1"/,"public portal provides stage-independent open and download PDF responses for all three documents");
requireText(pdfData,/LEFT JOIN lead_document_records[\s\S]*status:row\.status\?\?"draft"[\s\S]*questionnaireFields\(document\.eventType,document\.language,document\.data\)/,"portal PDFs render safe contract and questionnaire drafts before a stored document exists");
requireText(portalMarquee,/Client document PDFs[\s\S]*\["questionnaire","contract","invoice"\][\s\S]*Open[\s\S]*Download/,"portal header keeps questionnaire, contract and invoice PDF actions immediately available");
requireText(portalPage,/DocumentPdfActions[\s\S]*type="questionnaire"[\s\S]*type="contract"/,"portal questionnaire and agreement sections expose their own PDF actions");
requireText(pdfData,/questionnaireFieldLabel\(document\.eventType,document\.language,field\.name,document\.data\)/,"questionnaire PDFs use event language and client-specific field labels");

requireText(questionnaireDefinitions,/const baptism:[\s\S]*en:\[[\s\S]*child_name[\s\S]*godparent_names[\s\S]*ceremony_location_address[\s\S]*family_group_photos/,"baptism has a dedicated English questionnaire schema");
requireText(questionnaireDefinitions,/const baptism:[\s\S]*gr:\[[\s\S]*child_name[\s\S]*godparent_names[\s\S]*ceremony_location_address[\s\S]*family_group_photos/,"baptism has a dedicated Greek questionnaire schema");
requireText(questionnaireDefinitions,/sanitizeQuestionnaireAnswers[\s\S]*questionnaireFields\(eventType,language,source\)[\s\S]*allowed\.has\(key\)/,"questionnaire submissions are limited to the selected workflow and client-specific schema");
requireText(questionnaires,/COALESCE\(l\.workflow_locale,o\.language\) workflow_language[\s\S]*sanitizeQuestionnaireAnswers\(questionnaire\.eventType,questionnaire\.language,answers\)/,"standalone questionnaires inherit and enforce the client event and language profile");
requireText(questionnairePage,/questionnaireFields\(record\.eventType,record\.language\)[\s\S]*questions\.map/,"standalone questionnaire renders the matching workflow questions");
requireText(portalData,/sanitizeQuestionnaireAnswers\(portal\.eventType,portal\.language,data,current\?\.data\)/,"portal questionnaire submissions enforce the matching workflow and client-specific questions");
requireText(portalData,/COALESCE\(l\.workflow_locale,o\.language\) language/,"client portal language follows the stored lead workflow profile before the accepted offer fallback");
requireText(portalPage,/questionnaireFields\(eventType,language,document\?\.data\)/,"portal questionnaire renders the matching workflow and client-specific questions");

requireText(calendarPage,/weddingCount[\s\S]*baptismCount[\s\S]*label="Weddings"[\s\S]*label="Baptisms"[\s\S]*label="Total events"/,"CRM Calendar shows automatic wedding, baptism and total event counts");
requireText(calendarPage,/bg-red-700[\s\S]*Wedding[\s\S]*bg-yellow-300[\s\S]*Baptism/,"CRM Calendar legend identifies weddings in red and baptisms in yellow");
requireText(calendarDay,/eventTypes\.has\("wedding"\)\?"bg-red-700[\s\S]*:"bg-yellow-300/,"CRM Calendar day cells derive their primary color from event type");
requireText(googleCalendar,/colorId:item\.eventType==="baptism"\?"5":"11"/,"Google Calendar sync assigns yellow to baptisms and red to weddings");

console.log(checks.join("\n"));
console.log(`PASS - ${checks.length} Sprint 34 portal, baptism workflow and calendar contracts verified.`);
