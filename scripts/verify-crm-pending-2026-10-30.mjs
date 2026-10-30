// Offline only: all database, email and lock operations are fakes.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createRequire} from "node:module";
import ts from "typescript";
const nativeRequire=createRequire(import.meta.url);
function load(path,mocks={},env={}){
 const output=ts.transpileModule(readFileSync(path,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
 const loaded={exports:{}};
 new Function("require","module","exports","process",output)(name=>{if(name==="server-only")return{};if(Object.hasOwn(mocks,name))return mocks[name];if(name.startsWith("@/")||name.startsWith("next/"))throw Error(`Unmocked import: ${name}`);return nativeRequire(name);},loaded,loaded.exports,{env});
 return loaded.exports;
}
const locks=load("src/lib/event-date-lock.ts");
for(const override of [undefined,{confirmed:false,reason:"Confirmed coverage"},{confirmed:true,reason:"short"}]){
 const calls=[];
 const connection={query:async(sql)=>{calls.push(sql);return sql.includes("GET_LOCK")?[[{acquired:1}]]:sql.includes("FROM clients")?[[{id:"other",couple_names:"Other client"}]]:[[]];}};
 await assert.rejects(locks.lockClientEventDate(connection,"2026-11-01",undefined,override),locks.EventDateConflictError);
 assert.equal(calls.filter(sql=>sql.includes("RELEASE_LOCK")).length,1);
}
{
 const calls=[];
 const connection={query:async(sql)=>{calls.push(sql);return sql.includes("GET_LOCK")?[[{acquired:1}]]:sql.includes("FROM clients")?[[{id:"other",couple_names:"Other client"}]]:[[]];}};
 const name=await locks.lockClientEventDate(connection,"2026-11-01",undefined,{confirmed:true,reason:"Coverage capacity checked by administrator"});
 assert.equal(name,"moumkas:client-date:2026-11-01");
 assert.equal(calls.some(sql=>sql.includes("RELEASE_LOCK")),false);
 await locks.releaseClientEventDate(connection,name);
 assert.equal(calls.some(sql=>sql.includes("RELEASE_LOCK")),true);
}
console.log("PASS - Date conflicts still block by default; only explicit reasoned confirmation proceeds under the retained date lock.");
for(const adminOverride of [true,false]){
 const writes=[];let committed=false,notices=0,receivedOverride;
 const connection={beginTransaction:async()=>{},commit:async()=>{committed=true;},rollback:async()=>{},release:()=>{},
 query:async(sql)=>{
  if(sql.startsWith("SELECT * FROM offers"))return [[{id:1,lead_id:"lead",event_type:"baptism",language:"gr",status:"sent",payload:{collection:{ph:"Full Christening Experience GR",p:"750"}}}]];
  if(sql.includes("FROM leads"))return [[{event_date:"2026-11-01",phone:null,ceremony_location:null,reception_location:null}]];
  if(sql.includes("FROM document_templates"))return [["questionnaire","contract","invoice"].map(document_type=>({document_type,template_key:`baptism-el-${document_type}`}))];
  if(sql.includes("FROM clients"))return [[]];
  throw Error(`Unexpected query: ${sql}`);
 },execute:async(sql,params)=>{writes.push({sql,params});return[{affectedRows:1}];}};
 const api=load("src/lib/offers.ts",{
  "@/lib/database":{getDatabase:()=>({getConnection:async()=>connection})},
  "@/lib/automations":{},"@/lib/contract-templates":{contractForWorkflowProfile:()=>"Existing contract"},
  "@/lib/event-date-lock":{lockClientEventDate:async(_connection,_date,_exclude,override)=>{receivedOverride=override;return"date-lock";},releaseClientEventDate:async()=>{}},
  "@/lib/email-delivery":{sendInternalOfferAcceptance:async()=>{notices++;return{success:true};}},
 });
 const override={confirmed:true,reason:"Owner verified separate coverage"};
 await api.respondToOffer("test-offer",{action:"accept",name:"Offline test",email:"test@example.invalid",packageName:"Full Christening Experience GR"},{adminOverride,dateOverride:override,suppressNotification:true});
 assert.equal(committed,true);assert.equal(notices,0);
 assert.deepEqual(receivedOverride,adminOverride?override:undefined);
 const docs=writes.filter(item=>item.sql.includes("INSERT IGNORE INTO lead_document_records"));
 assert.equal(docs.length,3);
 const invoice=JSON.parse(docs.find(item=>item.params[2]==="invoice").params[4]);
 assert.equal(invoice.total,"750");assert.equal(invoice.prepaid_amount,"0");
 assert.equal(writes.some(item=>item.sql.includes("DELETE")),false);
 assert.equal(writes.some(item=>item.sql.includes("date-conflict-override")),adminOverride);
}
console.log("PASS - Public offer acceptance cannot bypass date conflicts; manual acceptance can suppress notifications and never invents received payments.");
{
 const {buildPendingActions}=load("src/lib/pending-actions.ts");
 const base={leadId:"one",coupleNames:"Test",eventDate:"2026-11-01",instruction:"Next action",actionHref:"/admin/leads/one",actionLabel:"Open",currentStep:{key:"001",description:"Review offer"}};
 const items=buildPendingActions([{...base,group:"waiting"},{...base,leadId:"two",group:"do-next"},{...base,leadId:"done",group:"completed"}], [{id:"reminder",kind:"workflow"},{id:"failed",kind:"automation",priority:"critical",clientName:"Test",title:"Failed",description:"Review queue",href:"/admin/automations",actionLabel:"Open"}]);
 assert.equal(items.length,3);assert.equal(items.filter(item=>item.kind==="workflow").length,2);
 assert.equal(items.find(item=>item.id==="journey:one").status,"waiting");
 assert.equal(items.some(item=>item.id==="journey:done"),false);
}
console.log("PASS - Pending actions include waiting and next steps, omit completed journeys and avoid duplicate workflow reminders.");
{
 const missing={code:"ER_NO_SUCH_TABLE",sqlMessage:"Table 'local.site_settings' doesn't exist"};
 const dev=load("src/lib/local-settings-fallback.ts",{},{NODE_ENV:"development"});
 const production=load("src/lib/local-settings-fallback.ts",{},{NODE_ENV:"production"});
 assert.equal(dev.allowLocalMissingSettings(missing),true);
 assert.equal(production.allowLocalMissingSettings(missing),false);
 assert.equal(dev.allowLocalMissingSettings({code:"ER_ACCESS_DENIED_ERROR",sqlMessage:missing.sqlMessage}),false);
 assert.equal(dev.allowLocalMissingSettings({code:"ER_NO_SUCH_TABLE",sqlMessage:"Table 'local.clients' doesn't exist"}),false);
}
for(const file of ["src/app/admin/offers/actions.ts","src/app/admin/leads/actions.ts"]){
 const mocks=Object.fromEntries([...readFileSync(file,"utf8").matchAll(/from "([^"]+)"/g)].map(match=>match[1]).filter(name=>name.startsWith("@/")||name.startsWith("next/")).map(name=>[name,{}]));
 mocks["@/lib/admin-auth"]={requireAdmin:async()=>{throw Error("Unauthorized");}};
 const api=load(file,mocks);
 const action=file.includes("offers")?api.acceptOfferAction:api.activateClientWorkspaceAction;
 await assert.rejects(action({},new FormData()),/Unauthorized/);
}
console.log("PASS - Local schema fallback is development-only; acceptance/workspace actions reject unauthenticated callers before mutation.");
console.log("PASS - CRM PENDING OFFLINE CHECKS. No database, real email or network accessed.");
