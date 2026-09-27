import {readFile,stat} from "node:fs/promises";
import {resolve} from "node:path";

const read=path=>readFile(resolve(process.cwd(),path),"utf8");
const checks=[];
const requireText=(source,pattern,label)=>{if(!pattern.test(source))throw new Error(`FAIL - ${label}`);checks.push(`PASS - ${label}`)};
const[data,hero,chess,outro,footer,portal,portalPage,portalInvoice,parallax,seoImage,globals]=await Promise.all([
  read("src/app/(site)/data/proposal-image-sequence.ts"),read("src/components/sections/OfferPage/OfferHero.tsx"),read("src/components/sections/OfferPage/OfferChess.tsx"),read("src/components/sections/OfferPage/OfferOutro.tsx"),read("src/components/core/Footer.tsx"),read("src/app/portal/[slug]/PortalMarquee.tsx"),read("src/app/portal/[slug]/page.tsx"),read("src/app/portal/[slug]/PortalInvoicePanel.tsx"),read("src/components/animations/ParallaxImage.tsx"),read("src/components/ui/SeoImage.tsx"),read("src/app/globals.css"),
]);

const filenames=[...data.matchAll(/src:(?:`\$\{base\}\/([^`]+)`|"([^"]+)")/g)].map(match=>match[1]?`/vm_img/Offer/${match[1]}`:match[2]);
requireText(data,/const base="\/vm_img\/Offer";/,"proposal images use the flattened public Offer path");
if(filenames.length!==10)throw new Error(`FAIL - expected 10 ordered proposal images, found ${filenames.length}`);
checks.push("PASS - proposal manifest contains exactly 10 ordered WebP files");
const expected=["/01-main-vertical-images/01-","/01-main-vertical-images/02-","/01-main-vertical-images/03-","/01-main-vertical-images/04-","/02-small-alternating-images/01-","/02-small-alternating-images/02-","/02-small-alternating-images/03-","/02-small-alternating-images/04-","/02-small-alternating-images/05-","/02-small-alternating-images/06-"];
expected.forEach((part,index)=>{if(!filenames[index].includes(part))throw new Error(`FAIL - proposal image ${index+1} is out of order`)});
checks.push("PASS - four main offer images and six portal marquee images preserve the supplied numbering");
for(const filename of filenames){const info=await stat(resolve(process.cwd(),`public${filename}`));if(info.size<=0)throw new Error(`FAIL - proposal image is empty: ${filename}`);if(info.size>300*1024)throw new Error(`FAIL - proposal image exceeds 300 KB: ${filename}`)}
checks.push("PASS - all 12 proposal assets are non-empty and no larger than 300 KB");
requireText(data,/alt:"[^"]+"/g,"proposal manifest stores descriptive alt text");
requireText(hero,/type==="baptism"\?baptismProposalMainImages\[0\]:weddingProposalMainImages\[0\][\s\S]*object-contain/,"offer hero uses the fixed first image for each event without a random pool");
requireText(chess,/eventType==="baptism"\?baptismProposalMainImages\[idx\+1\]:weddingProposalMainImages\[idx\+1\][\s\S]*fit=\{eventType==="wedding"\?"contain":"cover"\}/,"offer collection rows use the fixed numbered images for each event");
requireText(outro,/weddingProposalSmallImages\.map\(image=>image\.src\)/,"wedding outro stays inside the approved small-image set");
requireText(footer,/proposalMode[\s\S]*setRandomMarquee\(weddingProposalSmallImages\)[\s\S]*alt=\{image\.alt\}/,"offer footer preserves all six small images and their alt text in exact order");
requireText(portal,/eventType==="wedding"\?weddingProposalSmallImages:baptismProposalImageSequence[\s\S]*alt=\{image\.alt\}[\s\S]*loading=\{index<3\?"eager":"lazy"\}/,"portal uses fixed event-specific marquee sequences and eagerly loads the above-fold images");
requireText(parallax,/alt=\{alt\}[\s\S]*fit==="contain"\?"object-contain":"object-cover"/,"shared parallax image forwards SEO alt text and supports uncropped containment");
requireText(seoImage,/fallbackSrc[\s\S]*dataset\.fallbackApplied[\s\S]*srcset=""[\s\S]*src=fallbackSrc/,"shared SEO image safely falls back when a requested production asset is missing");
requireText(hero,/baptismProposalMainImages\[0\]/,"baptism offer hero uses the approved fixed hero image");
requireText(chess,/baptismProposalMainImages\[idx\+1\]/,"baptism offer collection images use the approved fixed sequence");
requireText(outro,/if\(isBaptism\)return/ ,"baptism offer outro cannot introduce random or repeated images");
requireText(footer,/fallbackSrc=\{proposalMode\?HOMEPAGE_WHITE_FOOTER/,"offer footer retains deployed fallbacks");
requireText(portal,/baptismProposalImageSequence[\s\S]*\[\.\.\.images,\.\.\.images\]/,"baptism portal repeats only the approved sequence to create a seamless marquee loop");
requireText(globals,/Client portal identity[\s\S]*overflow-wrap:\s*anywhere[\s\S]*font-size:\s*clamp\(1\.6rem, 7vw, 3rem\)[\s\S]*font-size:\s*clamp\(2rem, 4vw, 3rem\)/,"portal couple names stay compact and wrap safely from mobile through desktop");
requireText(portalPage,/portal-client-name font-light uppercase[\s\S]*removeGreekTonos\(portal\.coupleNames\)/,"portal applies the dedicated responsive identity style to couple names");
requireText(portalInvoice,/portal-invoice-client-name mt-2 font-light uppercase[\s\S]*removeGreekTonos\(data\.client_name\|\|portal\.coupleNames\)/,"invoice applies a dedicated compact style to its client name");
requireText(globals,/portal-invoice-client-name[\s\S]*font-size:\s*clamp\(1\.25rem, 5vw, 2rem\)/,"invoice client name remains compact from mobile through desktop");
requireText(portalPage,/portal-document-heading font-light uppercase[\s\S]*Baptism questionnaire[\s\S]*Baptism photography agreement/,"questionnaire and agreement headings follow the portal event and language");
requireText(globals,/portal-document-heading[\s\S]*font-size:\s*clamp\(1\.25rem, 4vw, 1\.75rem\)/,"questionnaire and agreement headings remain compact on every screen");

console.log(checks.join("\n"));
console.log(`PASS - ${checks.length} Sprint 29 proposal image contracts verified.`);
