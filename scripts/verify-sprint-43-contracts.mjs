import{readFileSync}from"node:fs";
import{resolve}from"node:path";
const read=path=>readFileSync(resolve(process.cwd(),path),"utf8");
const checks=[];
const requireText=(source,pattern,label)=>{if(!pattern.test(source))throw new Error(`FAIL - ${label}`);checks.push(`PASS - ${label}`)};
const locale=read("src/components/admin/AdminLocale.tsx");
const normalizer=read("src/components/GreekUppercaseNormalizer.tsx");
const wizard=read("src/app/admin/leads/LeadWorkflowWizard.tsx");

requireText(normalizer,/data-admin-locale-isolated="true"/,"Greek offer builders declare an isolated locale boundary");
requireText(locale,/function isLocaleIsolated[\s\S]*closest\('\[data-admin-locale-isolated="true"\]'/,"admin translation recognizes the isolated offer-builder boundary");
requireText(locale,/if\(!element\|\|isLocaleIsolated\(element\)\|\|/,"global text translation skips isolated builder text nodes");
requireText(locale,/if\(isLocaleIsolated\(element\)\)continue;for\(const attr/,"global attribute translation skips isolated builder controls");
requireText(wizard,/href=\{`\/admin\/dashboard\?\$\{query\.toString\(\)\}`\} onClick=\{\(\)=>setOpen\(false\)\}/,"prefilled-offer navigation closes the portaled wizard before routing");
requireText(wizard,/href="\/admin\/offers" onClick=\{\(\)=>setOpen\(false\)\}/,"offer-library navigation also closes the portaled wizard");
console.log(checks.join("\n"));
console.log(`PASS - ${checks.length} Sprint 43 lead-to-offer navigation contracts verified.`);
