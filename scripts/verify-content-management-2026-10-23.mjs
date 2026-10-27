// Owner-run offline contract tests. Application database and SMTP are replaced by in-memory fakes.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createRequire} from "node:module";
import ts from "typescript";
const nativeRequire=createRequire(import.meta.url);
function load(path,mocks={}) {
  const code=ts.transpileModule(readFileSync(path,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
  const loaded={exports:{}};
  new Function("require","module","exports","process",code)(name=>{
    if(name==="server-only")return {};
    if(Object.hasOwn(mocks,name))return mocks[name];
    if(name.startsWith("@/")||name.startsWith("next/"))throw new Error(`Forbidden unmocked import: ${name}`);
    return nativeRequire(name);
  },loaded,loaded.exports,{env:{SMTP_FROM_EMAIL:"studio@example.invalid",INQUIRY_NOTIFICATION_EMAIL:"internal@example.invalid"}});
  return loaded.exports;
}
const copy=load("src/app/(site)/data/ApprovedPublicCopy.ts");
const faqAbout=load("src/app/(site)/data/FaqAboutData.ts",{"@/app/(site)/data/ApprovedPublicCopy":copy});
const faq=load("src/app/(site)/data/FaqData.ts",{"@/app/(site)/data/ApprovedPublicCopy":copy});
const aboutGallery=load("src/app/(site)/data/Pages-Photoset/Aboutpage.ts");
const knownGalleryPhoto={src:aboutGallery.ABOUT_GALLERY_POOL[0],alt:"Existing photograph description"};
const content=load("src/lib/public-page-content.ts",{
  "@/app/(site)/data/ApprovedPublicCopy":copy,"@/app/(site)/data/FaqAboutData":faqAbout,"@/app/(site)/data/FaqData":faq,
  "@/app/(site)/data/ServicesData":{baseServices:[1,2,3].map(index=>({title:`Service ${index}`,description:"Approved description",tags:["Photography"]}))},
  "@/app/(site)/data/Pages-Photoset/Aboutpage":aboutGallery,
  "@/app/(site)/data/ProjectsData":{ProjectsData:[{photoset:[knownGalleryPhoto]}]},
});
const oldAbout={title:"Existing title",intro:["Existing paragraph one","Existing paragraph two"],faqIntro:"Existing FAQ introduction",faq:faqAbout.faqAboutData};
const upgraded=content.publicPageSchemas.about.parse(oldAbout);
assert.deepEqual(upgraded.intro,oldAbout.intro);
assert.deepEqual(upgraded.galleryDescriptions.map(image=>image.src),aboutGallery.ABOUT_GALLERY_POOL);
assert.equal(upgraded.galleryDescriptions[0].alt,knownGalleryPhoto.alt);
assert.equal(upgraded.galleryDescriptions[1].alt,"");
assert.deepEqual(upgraded.galleryImages,[]);
assert.deepEqual(upgraded.footerCtaLines,["YOUR WEDDING. YOUR STORY.","LET’S CREATE SOMETHING MEANINGFUL."]);
assert.equal(upgraded.faq[0].hidden,false);
const reordered=content.publicPageSchemas.about.parse({...upgraded,faq:[{...upgraded.faq[1],hidden:true},upgraded.faq[0]]});
assert.equal(reordered.faq[1].question,upgraded.faq[0].question);
assert.equal(reordered.faq.filter(item=>!item.hidden).length,1);
assert.throws(()=>content.publicPageSchemas.about.parse({...upgraded,galleryImages:[{src:"/one.jpg",alt:"First image",caption:""}]}));
const serviceCopy=content.publicPageSchemas.services.parse({...content.defaultPublicPageContent.services,visuals:{...content.servicesVisualDefaults,leftImage:"/left.jpg",leftAlt:"Chosen left image",leftCaption:"Optional caption"}});
assert.equal(serviceCopy.visuals.leftAlt,"Chosen left image");
assert.equal(serviceCopy.visuals.leftCaption,"Optional caption");
const oldVisuals={...serviceCopy.visuals};
for(const key of ["leftAlt","leftCaption","partnerAlt","partnerCaption","rightAlt","rightCaption","heroCaption"])delete oldVisuals[key];
assert.equal(content.publicPageSchemas.services.parse({...serviceCopy,visuals:oldVisuals}).visuals.leftCaption,"");
for(const unsafe of ["https://example.invalid","//example.invalid","/\\evil","/%2f%2fevil"]) assert.equal(content.internalLink.safeParse(unsafe).success,false);
console.log("PASS - existing approved content survives schema upgrades; FAQ ordering/visibility and unsafe link rejection verified.");

function workspaceFixture(raw={title:"Current public content"},revisions=[]) {
  let records=new Map([["page-key",raw]]);
  if(revisions.length)records.set("workspace:page-key",{draft:null,revisions,updatedAt:null});
  let staged;
  const writes=[];let committed=false,rolledBack=false;
  const connection={
    beginTransaction:async()=>{staged=new Map(records);},
    query:async(_sql,keys)=>[keys.flatMap(key=>records.has(key)?[{setting_key:key,value_json:JSON.stringify(records.get(key))}]:[])],
    execute:async(sql,params)=>{writes.push({sql,params});const update=sql.startsWith("UPDATE");staged.set(update?params[1]:params[0],JSON.parse(update?params[0]:params[1]));return[{affectedRows:1}];},
    commit:async()=>{records=staged;committed=true;},rollback:async()=>{rolledBack=true;},release:()=>{},
  };
  const api=load("src/lib/content-workspace.ts",{"@/lib/database":{isDatabaseConfigured:()=>true,getDatabase:()=>({getConnection:async()=>connection,query:connection.query})}});
  return {api,writes,records:()=>records,committed:()=>committed,rolledBack:()=>rolledBack};
}
{
  const f=workspaceFixture();
  await f.api.writeContentWorkspace({key:"page-key",content:{title:"Private preview"},expectedVersion:f.api.contentVersion(f.records().get("page-key")),expectedWorkspaceVersion:f.api.contentVersion(null),mode:"draft",fallback:{}});
  assert.equal(f.records().get("page-key").title,"Current public content");
  assert.equal(f.records().get("workspace:page-key").draft.title,"Private preview");
  assert.equal(f.writes.length,1);assert.equal(f.committed(),true);
  const snapshot=await f.api.getPublishedContentSnapshot("page-key",{});
  assert.deepEqual(snapshot.content,{title:"Current public content"});
  assert.equal(snapshot.version,f.api.contentVersion(snapshot.content));
  await f.api.writeContentWorkspace({key:"page-key",content:{title:"Legacy SEO save"},expectedVersion:snapshot.version,expectedWorkspaceVersion:f.api.contentVersion(f.records().get("workspace:page-key")),mode:"publish",fallback:{},preserveDraft:true});
  assert.equal(f.records().get("workspace:page-key").draft.title,"Private preview");
}
{
  const history=Array.from({length:12},(_,index)=>({id:String(index),at:"earlier",actor:"admin",content:{title:`Previous ${index}`}}));
  const f=workspaceFixture({title:"Current public content"},history);
  await f.api.writeContentWorkspace({key:"page-key",content:{title:"Reviewed publication"},expectedVersion:f.api.contentVersion(f.records().get("page-key")),expectedWorkspaceVersion:f.api.contentVersion(f.records().get("workspace:page-key")),mode:"publish",fallback:{}});
  const work=f.records().get("workspace:page-key");
  assert.equal(work.draft,null);assert.equal(work.revisions.length,12);assert.equal(work.revisions[0].content.title,"Current public content");assert.equal(work.revisions[0].actor,"admin");
  assert.equal(f.records().get("page-key").title,"Reviewed publication");
}
for(const stale of ["public","workspace"]) {
  const f=workspaceFixture();
  await assert.rejects(f.api.writeContentWorkspace({key:"page-key",content:{title:"Must not save"},expectedVersion:stale==="public"?"wrong":f.api.contentVersion(f.records().get("page-key")),expectedWorkspaceVersion:stale==="workspace"?"wrong":f.api.contentVersion(null),mode:"publish",fallback:{}}),/another window/);
  assert.equal(f.writes.length,0);assert.equal(f.rolledBack(),true);
}
console.log("PASS - draft cannot change public content; publishing retains bounded restore history; stale public/draft versions reject without writes.");

const redirects=load("src/lib/public-redirects.ts",{"@/lib/database":{},"@/lib/public-page-content":content});
assert.throws(()=>redirects.redirectSchema.parse([{from:"/a",to:"/b"},{from:"/b",to:"/a"}]));
assert.throws(()=>redirects.redirectSchema.parse([{from:"/admin/old",to:"/contact"}]));
assert.throws(()=>redirects.redirectSchema.parse([{from:"/old",to:"//outside.invalid"}]));
assert.deepEqual(redirects.redirectSchema.parse([{from:"/legacy/old-page",to:"/contact"}]),[{from:"/legacy/old-page",to:"/contact"}]);
{
  const history=load("src/lib/project-url-history.ts",{"@/lib/database":{}});
  const writes=[];
  const connection={query:async(_sql,params)=>[params[0]==="public_project_redirects_v1"?[{value_json:JSON.stringify([{from:"/portfolio/project/first",to:"/portfolio/project/second"}])}]:[]],execute:async(sql,params)=>writes.push({sql,params})};
  await history.recordProjectRename(connection,"second","third");
  assert.deepEqual(JSON.parse(writes[0].params[0]),[{from:"/portfolio/project/first",to:"/portfolio/project/third"},{from:"/portfolio/project/second",to:"/portfolio/project/third"}]);
  await assert.rejects(history.recordProjectRename(connection,"second","first"),/historical/);
}
console.log("PASS - redirect loops/private/external paths reject; repeated project renames flatten to the latest URL.");

for(const failHistory of [false,true]) {
  const events=[];
  const project={id:"test-project",slug:"old-story",title:"Test story",description:"Test description",seo_title:null,meta_description:null,header_image_alt:null,date_shot:null,client_name:"Test couple",location:"Test location",category:"Wedding",tags:"[]",header_image:"/test.jpg",is_published:1,updated_at:new Date("2026-10-01T00:00:00Z")};
  const connection={beginTransaction:async()=>events.push("begin"),execute:async sql=>{events.push(sql);return[{affectedRows:1}];},commit:async()=>events.push("commit"),rollback:async()=>events.push("rollback"),release:()=>events.push("release")};
  const pool={getConnection:async()=>connection,query:async sql=>[sql.startsWith("SELECT * FROM portfolio_projects")?[project]:[]]};
  const api=load("src/lib/portfolio.ts",{
    "@/lib/database":{isDatabaseConfigured:()=>true,getDatabase:()=>pool},"@/lib/runtime-storage-paths":{},"@/app/(site)/data/ProjectsData":{ProjectsData:[]},
    "@/lib/project-url-history":{recordProjectRename:async(conn,from,to)=>{assert.equal(conn,connection);assert.equal(from,"old-story");assert.equal(to,"new-story");events.push("alias");if(failHistory)throw Error("Mock alias failure");}},
  });
  const input={originalSlug:"old-story",slug:"new-story",title:"Test story",description:"Test description",seoTitle:"",metaDescription:"",headerImageAlt:"",published:true,dateShot:"",client:"Test couple",location:"Test location",category:"Wedding",tags:[],headerImage:"/test.jpg",photos:[]};
  if(failHistory){await assert.rejects(api.savePortfolioProject(input),/Mock alias failure/);assert.equal(events.includes("commit"),false);assert.equal(events.includes("rollback"),true);}
  else{await api.savePortfolioProject(input);assert(events.indexOf("alias")<events.indexOf("commit"));assert.equal(events.includes("rollback"),false);}
  assert.equal(events.at(-1),"release");
}
console.log("PASS - project rename, gallery metadata and URL alias share one transaction; alias failure rolls the update back.");

{
  const destinations=load("src/lib/destinations.ts",{"@/lib/project-url-history":{},"@/lib/database":{isDatabaseConfigured:()=>true,getDatabase:()=>({query:async()=>[[{setting_key:"workspace:destination:private-location",value_json:JSON.stringify({draft:{title:"Private destination",intro:"Private text",image:"",imageAlt:"",sections:[],projectSlugs:[],buttonLabel:"Contact",buttonHref:"/contact",seoTitle:"Draft",metaDescription:"Draft",published:true}})}]]})},"@/lib/public-page-content":content});
  assert.equal((await destinations.listDestinations()).length,0);
  const drafts=await destinations.listDestinations(true);assert.equal(drafts.length,1);assert.equal(drafts[0].content.published,false);
}
console.log("PASS - a saved destination draft remains private even if its future published checkbox is selected.");

{
  const overrides=load("src/lib/seo-overrides.ts",{"@/lib/database":{isDatabaseConfigured:()=>true,getDatabase:()=>({query:async()=>[[{value_json:JSON.stringify({"/about":{socialTitle:"Independent social title",socialDescription:"",socialImage:"/social.jpg",noindex:true}})}]]})}});
  const metadata=await overrides.publicMetadata({title:"Search title",description:"Search description",image:"/default.jpg",imageAlt:"Photograph"},"/about");
  assert.deepEqual(metadata.title,{absolute:"Search title"});assert.equal(metadata.openGraph.title,"Independent social title");assert.equal(metadata.openGraph.description,"Search description");assert.equal(metadata.openGraph.images[0].url,"/social.jpg");assert.equal(metadata.alternates.canonical,"/about");assert.equal(metadata.robots.index,false);
  const fallback=await overrides.publicMetadata({title:"Services search title",description:"Services description",image:"/default.jpg",imageAlt:"Photograph"},"/services");
  assert.equal(fallback.openGraph.title,"Services search title");assert.equal(fallback.robots.index,true);
}
console.log("PASS - independent social overrides preserve search metadata/canonical; empty social fields inherit defaults and noindex is honoured.");

for(const failure of [false,true]) {
  const leads=[],messages=[];
  const api=load("src/app/sendEmail.ts",{"@/lib/leads":{createLead:async input=>{leads.push(input);return"test-lead";}},"@/lib/email-delivery":{smtpConfigured:()=>true,getSmtpTransport:()=>({sendMail:async message=>{messages.push(message);if(failure)throw Error("Mock SMTP unavailable");}})}});
  const result=await api.sendEmail({name:"Offline test",email:"couple@example.invalid",planning:"WEDDING",date:"Test date",message:"Offline verification only"});
  assert.equal(leads.length,1);assert.equal(messages.length,1);assert.equal(messages[0].to,"internal@example.invalid");assert.equal(result.success,true);assert.equal(result.acknowledgement,"manual-required");assert.equal(result.internalNotification,failure?"failed":"sent");
}
console.log("PASS - Contact creates one lead and only an internal notification; failed internal SMTP does not discard the saved lead or send 000.");

for(const path of ["src/app/admin/pages/actions.ts","src/app/admin/destinations/actions.ts","src/app/admin/seo/coverage/actions.ts","src/app/admin/seo/redirects/actions.ts"]) {
  const mocks=Object.fromEntries([...readFileSync(path,"utf8").matchAll(/from "([^"]+)"/g)].map(match=>match[1]).filter(name=>name.startsWith("@/")||name.startsWith("next/")).map(name=>[name,{}]));
  mocks["@/lib/admin-auth"]={requireAdmin:async()=>{throw Error("Unauthorized");}};
  const actions=load(path,mocks);
  for(const action of Object.values(actions))await assert.rejects(action({success:false,message:""},new FormData()),/Unauthorized/);
}
console.log("PASS - all content/SEO/destination/redirect mutations require admin authentication before parsing or writing.");
console.log("PASS - CONTENT MANAGEMENT OFFLINE CHECKS; NO DATABASE, NETWORK OR REAL EMAIL USED.");
