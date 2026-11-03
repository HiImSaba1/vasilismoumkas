import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const compile = file => ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
function load(file, dependencies={}) { const unit={exports:{}};new Function('require','module','exports',compile(file))(name=>{if(name in dependencies)return dependencies[name];throw Error('Unmocked dependency '+name)},unit,unit.exports);return unit.exports; }
const consent=load('src/lib/analytics-consent.ts');
for(const path of ['/admin','/admin/overview','/portal/private','/offer/private','/questionnaire/token','/timeline/token','/api/health','/contact?email=private'])assert.equal(consent.analyticsPath(path),null);
for(const path of ['/','/about','/portfolio/project/kim-lee','/portfolio/baptism','/destinations/italy'])assert.equal(consent.analyticsPath(path),path);
let pathname='/',stored=null,effect,cleanup;
const listeners=new Map(),scripts=[];
globalThis.localStorage={getItem:()=>stored};
globalThis.location={hostname:'vasilismoumkas.com',origin:'https://vasilismoumkas.com'};
globalThis.document={title:'Public page',createElement:()=>({}),head:{appendChild:script=>scripts.push(script)}};
globalThis.window={addEventListener:(name,fn)=>listeners.set(name,fn),removeEventListener:name=>listeners.delete(name)};
const component=load('src/components/core/GoogleAnalytics.tsx',{'react':{useEffect:fn=>effect=fn},'next/navigation':{usePathname:()=>pathname},'@/lib/analytics-consent':consent}).default;
function render(path){cleanup?.();pathname=path;component();cleanup=effect();}
render('/');assert.equal(scripts.length,0);
listeners.get(consent.CONSENT_EVENT)({detail:'declined'});assert.equal(scripts.length,0);
stored='accepted';listeners.get(consent.CONSENT_EVENT)({detail:'accepted'});assert.equal(scripts.length,1);
const events=()=>window.dataLayer.filter(args=>args[0]==='event');
assert.equal(events().length,1);render('/');assert.equal(events().length,1);
render('/about');assert.equal(events().length,2);assert.equal(scripts.length,1);
render('/portal/private');assert.equal(events().length,2);assert.equal(window['ga-disable-'+consent.GA4_ID],true);
stored='accepted';render('/contact');assert.equal(events().length,3);assert.equal(events().at(-1)[2].page_referrer,'');
listeners.get('storage')({key:consent.CONSENT_KEY,newValue:'declined'});assert.equal(window['ga-disable-'+consent.GA4_ID],true);
console.log('PASS - no tag before consent/after decline; single initialization; public navigation dedup; private route exclusion; cross-tab decline. No network or database used.');
