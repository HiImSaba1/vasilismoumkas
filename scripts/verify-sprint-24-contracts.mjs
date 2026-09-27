import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const read=path=>readFile(resolve(process.cwd(),path),"utf8");
const checks=[];
const requireText=(source,pattern,label)=>{if(!pattern.test(source))throw new Error(`FAIL - ${label}`);checks.push(`PASS - ${label}`)};
const[renderer,templates]=await Promise.all([read("src/lib/email-renderer.ts"),read("src/lib/email-templates.ts")]);
requireText(renderer,/portalUrl\?:string/,"shared email renderer accepts the connected client portal URL");
requireText(renderer,/button\("View Client Portal",portalUrl,true\)/,"Template 005 portal link renders as a named CTA button");
requireText(renderer,/trimmed\.replace\(portalUrl,""\)/,"raw portal URL is removed from the visible email copy");
requireText(templates,/portalUrl:values\.portal_url/,"saved Template 005 rendering forwards the portal URL");
requireText(templates,/portal_url:values\.portal_url\|\|urls\.find\(url=>/,"edited Template 005 preview recognizes portal links");
for(const check of checks)console.log(check);
console.log(`PASS - ${checks.length} Sprint 24 client portal CTA contracts verified.`);
