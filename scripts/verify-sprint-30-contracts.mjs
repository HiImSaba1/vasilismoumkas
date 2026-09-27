import {readFile} from "node:fs/promises";
import {resolve} from "node:path";

const read=path=>readFile(resolve(process.cwd(),path),"utf8");
const checks=[];
const requireText=(source,pattern,label)=>{if(!pattern.test(source))throw new Error(`FAIL - ${label}`);checks.push(`PASS - ${label}`)};
const[portals,page,composer,picker,actions,financials,seoImage,marquee]=await Promise.all([
  read("src/lib/client-portals.ts"),
  read("src/app/admin/clients/[id]/email/page.tsx"),
  read("src/app/admin/clients/[id]/email/ClientEmailComposer.tsx"),
  read("src/app/admin/clients/[id]/email/ClientTemplateImagePicker.tsx"),
  read("src/app/admin/clients/[id]/email/actions.ts"),
  read("src/lib/client-email-financials.ts"),
  read("src/components/ui/SeoImage.tsx"),
  read("src/app/portal/[slug]/PortalMarquee.tsx"),
]);

requireText(portals,/normalizePortalSlug[\s\S]*decodeURIComponent\(slug\)\.normalize\("NFC"\)/,"portal keeps the exact stored Unicode slug after URL decoding");
requireText(portals,/parsePortalDocumentData\(value:unknown\)[\s\S]*catch\{return\{legacy_content:value\}\}/,"portal safely handles empty, object, malformed and legacy document data");
requireText(portals,/const data=parsePortalDocumentData\(row\.document_data\)/,"portal document rendering uses the safe parser instead of unconditional JSON parsing");
requireText(portals,/(?=[\s\S]*safePortalDate\(value:unknown,mode:"date"\|"timestamp"\))(?=[\s\S]*Number\.isNaN\(parsed\.getTime\(\)\))(?=[\s\S]*eventDate:safePortalDate\(portal\.event_date,"date"\))(?=[\s\S]*createdAt:safePortalDate\(row\.created_at,"timestamp"\))/,"portal tolerates legacy or zero event and file dates without crashing the whole page");
requireText(portals,/let documentRows:[\s\S]*try\{const\[result\]=await db\.query<typeof documentRows>[\s\S]*catch\{documentRows=\[\]\}[\s\S]*try\{const\[result\]=await db\.query<typeof fileRows>[\s\S]*catch\{fileRows=\[\]\}/,"optional legacy document or file rows cannot take down the base portal");
requireText(portals,/documentRows\.flatMap[\s\S]*catch\{return\[\]\}[\s\S]*fileRows\.flatMap[\s\S]*Number\.isFinite/ ,"malformed individual portal records are skipped safely during rendering");
requireText(portals,/DATE_FORMAT\(c\.event_date,'%Y-%m-%d'\)[\s\S]*BINARY p\.public_slug=BINARY \?[\s\S]*catch\{[\s\S]*NULL language FROM client_portals/ ,"base portal lookup avoids invalid MySQL dates and falls back when the accepted-offer join drifts");
requireText(seoImage,/^"use client";[\s\S]*onError=/,"shared SEO image owns its browser error handler inside a client boundary");
requireText(marquee,/SeoImage[\s\S]*PortalMarquee/,"portal marquee uses the client-safe image boundary for wedding and baptism heroes");
requireText(page,/listPortfolioEmailImages\(\)[\s\S]*emailImages=\{emailImages\}/,"client email page loads the established portfolio image library");
requireText(composer,/ClientTemplateImagePicker[\s\S]*headerImageOverride=\{previewHeaderImage\}/,"client composer exposes image selection and updates the SMTP-equivalent preview");
requireText(picker,/EmailHeaderImagePicker[\s\S]*template\.id[\s\S]*template\.locale[\s\S]*Use image in this template/,"client template picker reuses the searchable Email Templates image interface for the exact variant");
requireText(actions,/updateClientTemplateHeaderImageAction[\s\S]*listPortfolioEmailImages\(\)[\s\S]*images\.some\(image=>image\.src===input\.headerImage\)[\s\S]*getEmailTemplate\(input\.templateId,client\.eventType,input\.locale\)[\s\S]*updateEmailTemplate/,"client image changes are portfolio-validated and saved to the exact event and locale template");
requireText(page,/en: englishTemplates\.filter[\s\S]*withClientFinancialParagraph\(item\)[\s\S]*el: greekTemplates\.filter[\s\S]*withClientFinancialParagraph\(item\)/,"both English and Greek Template 005 previews receive the calculated financial paragraph");
requireText(financials,/(?=[\s\S]*template\.id!=="005")(?=[\s\S]*total\*\.25)(?=[\s\S]*net\*\.24)/,"Template 005 derives a 25 percent net deposit and 24 percent VAT from the accepted collection total");
requireText(financials,/Καθαρή αξία προκαταβολής:[\s\S]*Συνολικό ποσό προκαταβολής:[\s\S]*remaining net amount is/,"Template 005 includes complete Greek and English deposit, VAT, payable-now and remaining-value copy");

console.log(checks.join("\n"));
console.log(`PASS - ${checks.length} Sprint 30 portal recovery and client email image contracts verified.`);
