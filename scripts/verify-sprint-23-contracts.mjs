import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const read=path=>readFile(resolve(process.cwd(),path),"utf8");
const checks=[];
const requireText=(source,pattern,label)=>{if(!pattern.test(source))throw new Error(`FAIL - ${label}`);checks.push(`PASS - ${label}`)};
const[portals,page,files,pdf]=await Promise.all([read("src/lib/client-portals.ts"),read("src/app/portal/[slug]/page.tsx"),read("src/app/api/portal/[slug]/files/[fileId]/route.ts"),read("src/app/api/portal/[slug]/contract.pdf/route.ts")]);
requireText(portals,/export function normalizePortalSlug\(slug:string\)/,"portal slugs use one shared normalization boundary");
requireText(portals,/decodeURIComponent\(slug\)\.normalize\("NFC"\)/,"percent-encoded Greek portal slugs are decoded and Unicode-normalized");
requireText(portals,/const normalizedSlug=normalizePortalSlug\(slug\)/,"database lookup always uses the normalized portal slug");
requireText(portals,/WHERE p\.public_slug=\? AND p\.status='active'[\s\S]*\[normalizedSlug\]/,"active portal lookup binds the decoded slug");
requireText(page,/getPortalBySlug\(slug\)/,"portal page uses the shared normalized lookup");
requireText(files,/getPortalBySlug\(slug\)/,"private file downloads use the shared normalized lookup");
requireText(pdf,/getPortalBySlug\(slug\)/,"contract PDF uses the shared normalized lookup");
for(const check of checks)console.log(check);
console.log(`PASS - ${checks.length} Sprint 23 Greek portal URL contracts verified.`);
