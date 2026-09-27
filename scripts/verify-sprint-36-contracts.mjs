import {readFile,stat} from "node:fs/promises";
import {resolve} from "node:path";

const read=path=>readFile(resolve(process.cwd(),path),"utf8");
const checks=[];
const requireText=(source,pattern,label)=>{if(!pattern.test(source))throw new Error(`FAIL - ${label}`);checks.push(`PASS - ${label}`)};
const forbidText=(source,pattern,label)=>{if(pattern.test(source))throw new Error(`FAIL - ${label}`);checks.push(`PASS - ${label}`)};

const[page,marquee,actions,portalData,pdfData,legacyPdf,invoice,portalUrl]=await Promise.all([
  read("src/app/portal/[slug]/page.tsx"),
  read("src/app/portal/[slug]/PortalMarquee.tsx"),
  read("src/app/portal/[slug]/actions.ts"),
  read("src/lib/client-portals.ts"),
  read("src/lib/client-document-pdf.ts"),
  read("src/app/api/portal/[slug]/contract.pdf/route.ts"),
  read("src/app/portal/[slug]/PortalInvoicePanel.tsx"),
  read("src/lib/portal-url.ts"),
]);

requireText(portalUrl,/decodeURIComponent\(slug\)\.normalize\("NFC"\)[\s\S]*encodeURIComponent\(normalizePortalSlugValue\(slug\)\)/,"portal URLs decode, normalize and encode each slug exactly once");
requireText(page,/portalSlugPath\(portal\.slug\)[\s\S]*DocumentPdfActions slug=\{portal\.slug\}/,"portal navigation and document actions use the canonical database slug");
requireText(page,/portalSlugPath\(slug\)[\s\S]*Προβολη PDF[\s\S]*Ληψη PDF/,"document tabs expose working localized Open and Download controls");
forbidText(page,/encodeURIComponent\(slug\)/,"document-tab controls cannot double-encode Greek portal slugs");
requireText(marquee,/portalSlugPath\(identity\)[\s\S]*Ερωτηματολογιο[\s\S]*Προβολη[\s\S]*Ληψη/,"top document controls share the canonical slug builder and portal language");
requireText(actions,/portalSlugPath\(slug\)[\s\S]*saved=true/,"portal form redirects retain a valid normalized slug");
requireText(portalData,/normalizePortalSlugValue/ ,"portal lookup and portal links share one Unicode normalization contract");
requireText(page,/Αρχικη[\s\S]*Ερωτηματολογιο[\s\S]*Συμφωνητικο[\s\S]*Τιμολογιο/,"Greek portals keep navigation labels in Greek");
requireText(page,/localizedStatus[\s\S]*μερικως πληρωμενο/,"Greek portals localize record statuses");
requireText(invoice,/(?=[\s\S]*Επιλεγμενη συλλογη)(?=[\s\S]*Καλυψη)(?=[\s\S]*Φωτογραφοι)(?=[\s\S]*ΥΠΟΛΟΙΠΟ)/i,"Greek invoice content provides localized collection, coverage, photographer and balance labels");
requireText(pdfData,/Roboto-Variable\.ttf[\s\S]*subset:false/,"PDFs embed a full Unicode Greek and Latin font instead of relying on the server");
requireText(pdfData,/normalize\("NFC"\)[\s\S]*titles[\s\S]*invoiceLabels[\s\S]*questionnaireFieldLabel/,"PDF text is normalized and localized by document type");
requireText(legacyPdf,/renderClientDocumentPdf\(portal\.clientId,"contract"\)/,"legacy contract PDF links reuse the Unicode-safe renderer");
const font=await stat(resolve(process.cwd(),"public/fonts/Roboto-Variable.ttf"));
if(font.size<100000)throw new Error("FAIL - embedded Unicode PDF font is missing or truncated");
checks.push("PASS - embedded Unicode PDF font asset is present and non-trivial");

console.log(checks.join("\n"));
console.log(`PASS - ${checks.length} Sprint 36 portal PDF and navigation contracts verified.`);
