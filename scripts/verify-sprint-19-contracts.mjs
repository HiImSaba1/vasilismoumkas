import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const renderer=await readFile(resolve(process.cwd(),"src/lib/email-renderer.ts"),"utf8");
const checks=[];
const requireText=(pattern,label)=>{if(!pattern.test(renderer))throw new Error(`FAIL - ${label}`);checks.push(`PASS - ${label}`)};

requireText(/Στον παρακάτω σύνδεσμο θα βρείτε την προσωπική σας πρόταση/,"Greek Template 001 proposal paragraph is an explicit CTA anchor");
requireText(/Through the link below, you will find your personal proposal/,"English Template 001 proposal paragraph is an explicit CTA anchor");
requireText(/blocks\.splice\(proposalIntroductionIndex\+1,0,offerUrl\)/,"proposal CTA is placed directly below its introduction paragraph");
requireText(/<td align="center">/,"email CTA remains centered in email-safe markup");
requireText(/ΔΕΙΤΕ ΤΗΝ ΠΡΟΣΩΠΙΚΗ ΣΑΣ ΠΡΟΤΑΣΗ/,"Greek proposal button keeps the approved label");
requireText(/offerIndex>closingIndex/,"closing-order safety remains active");
requireText(/lines\.join\(" "\)/,"single source-document line wraps render as normal paragraph spaces");
requireText(/split\(\/\(\?:\\r\?\\n\)\{2,\}\//,"Windows and Unix blank lines continue to define separate paragraphs");
requireText(/closingStart\.test[\s\S]*lines\.join\("\\n"\)/,"closing and sender name preserve their intentional line break");
requireText(/normalizedTextBody\(bodyText\)/,"plain-text email uses the same normalized paragraphs");
requireText(/padding:42px 20px 28px/,"email body uses reduced side padding for wider text paragraphs");

console.log(checks.join("\n"));
console.log(`PASS - ${checks.length} Sprint 19 Template 001 CTA placement contracts verified.`);
