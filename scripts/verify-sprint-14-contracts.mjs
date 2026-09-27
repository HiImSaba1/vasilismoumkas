import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const read=(path)=>readFile(resolve(process.cwd(),path),"utf8");
const checks=[];
const requireText=(source,pattern,label)=>{if(!pattern.test(source))throw new Error(`FAIL - ${label}`);checks.push(`PASS - ${label}`)};
const requireCount=(source,pattern,count,label)=>{const found=[...source.matchAll(pattern)].length;if(found!==count)throw new Error(`FAIL - ${label}: expected ${count}, found ${found}`);checks.push(`PASS - ${label}`)};

const[renderer,templates,composer,preview,delivery,automation,clientAction]=await Promise.all([
  read("src/lib/email-renderer.ts"),read("src/lib/email-templates.ts"),read("src/components/admin/EditableEmailComposer.tsx"),read("src/app/admin/email-templates/EmailPreview.tsx"),read("src/lib/email-delivery.ts"),read("src/lib/automation-runner.ts"),read("src/app/admin/clients/[id]/email/actions.ts")
]);

requireText(renderer,/role="presentation"/,"renderer uses email-safe presentation tables");
requireText(renderer,/x-apple-disable-message-reformatting/,"renderer guards Apple Mail reformatting");
requireText(renderer,/\[if mso\]/,"renderer includes an Outlook compatibility branch");
requireText(renderer,/7099163a-198e-4cf5-ab4c-799e6ae5757a\.webp/,"approved Santorini image is the default header");
requireText(renderer,/ΔΕΙΤΕ ΤΗΝ ΠΡΟΣΩΠΙΚΗ ΣΑΣ ΠΡΟΤΑΣΗ/,"Greek offer CTA is present");
requireText(renderer,/VIEW YOUR PERSONAL PROPOSAL/,"English offer CTA is present");
requireText(renderer,/ΔΕΙΤΕ ΜΙΑ ΟΛΟΚΛΗΡΩΜΕΝΗ WEDDING STORY/,"Greek gallery CTA is present");
requireText(renderer,/VIEW A COMPLETE WEDDING STORY/,"English gallery CTA is present");
requireText(renderer,/const background="#221f20"/,"all email CTAs use the dark background");
requireText(renderer,/const color="#ffffff"/,"all email CTAs use light text");
requireText(renderer,/background:#221f20;color:#ffffff.*word-break:break-all/,"ordinary template URLs render as visible dark buttons");
requireText(renderer,/bgcolor="#FFFFC4"[\s\S]*color:#221f20[\s\S]*>INSTAGRAM</,"Instagram footer button uses soft yellow with dark text");
requireText(renderer,/bgcolor="#ffffff" style="border:1px solid #221f20"[\s\S]*color:#221f20[\s\S]*>PINTEREST</,"Pinterest footer button uses white with dark text");
requireCount(renderer,/Vasilis Moumkas \| Fine Art Wedding Photographer/g,2,"shared HTML and text footers each define one signature");
requireText(renderer,/removeLegacySignature\(bodyText\)/,"legacy body signature is removed at render time");
requireText(templates,/renderEmailDocument\(bodyText/,"saved templates use the shared renderer");
requireText(templates,/renderEmailDocument\(clean/,"edited emails use the shared renderer");
requireText(composer,/renderEmailDocument\(body/,"composer preview uses the shared renderer");
requireText(composer,/same renderer as SMTP/,"composer identifies renderer parity");
requireText(preview,/srcDoc=\{html\}/,"template preview displays the exact rendered document");
requireText(preview,/Desktop/,"desktop preview control is available");
requireText(preview,/Mobile/,"mobile preview control is available");
requireText(clientAction,/renderEditedEmail\(input\.subject,input\.bodyText,input\.locale/,"client edited sends preserve the selected locale");
requireText(delivery,/rendered_html/,"delivery history still archives rendered HTML");
requireText(delivery,/status='sent'/,"delivery status logging remains intact");
requireText(automation,/renderTemplate\(template,values\)/,"automation uses the shared template renderer");

console.log(checks.join("\n"));
console.log(`PASS - ${checks.length} Sprint 14 HTML email design contracts verified.`);
