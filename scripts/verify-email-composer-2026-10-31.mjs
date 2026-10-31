// Offline: this harness rejects every unmocked app dependency outside pure renderers.
import assert from "node:assert/strict";
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {createRequire} from "node:module";
import {resolve,dirname} from "node:path";
import ts from "typescript";
const nativeRequire=createRequire(import.meta.url);
const pure=new Set(["src/lib/email-composition.ts","src/lib/structured-email-renderer.ts","src/lib/email-renderer.ts","src/lib/approved-email-layout.ts","src/lib/email-inline-assets.ts"]);
function load(path,mocks={},env={}){
  const output=ts.transpileModule(readFileSync(path,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
  const loaded={exports:{}};
  new Function("require","module","exports","process",output)(name=>{
    if(Object.hasOwn(mocks,name))return mocks[name];
    if(name.startsWith(".")){const target=resolve(dirname(path),name+".ts");const relative=target.slice(process.cwd().length+1).replaceAll("\\","/");if(pure.has(relative))return load(relative,mocks,env);}
    if(name==="server-only")return{};
    if(name.startsWith("@/")||name.startsWith("next/")||name.startsWith("."))throw Error(`Unmocked import: ${name}`);
    return nativeRequire(name);
  },loaded,loaded.exports,{env,cwd:()=>process.cwd()});
  return loaded.exports;
}
const model=load("src/lib/email-composition.ts"),renderer=load("src/lib/email-renderer.ts");
assert.equal(model.brandedEmailSubject("Χάρηκα για την επικοινωνία","wedding"),"Vasilis Moumkas Wedding Photography — Χάρηκα για την επικοινωνία");
assert.equal(model.brandedEmailSubject(model.brandedEmailSubject("Hello","baptism"),"baptism"),"Vasilis Moumkas Baptism Photography — Hello");
const approved=load("src/lib/approved-email-layout.ts");
const designs=load("src/lib/email-design-samples.ts");
const testLayouts=load("src/lib/email-test-layout.ts");
const source000={id:"000",locale:"el",eventType:"wedding",name:"Original 000",subject:"Original subject",bodyText:"First paragraph.\n\nSecond paragraph.\n\nThird paragraph.",headerImage:"/vm_img/first.jpg",isActive:true,version:7};
const test010=testLayouts.buildTestEmailLayout(source000,[{src:"/vm_img/first.jpg",alt:"First photo"},{src:"/vm_img/second.jpg",alt:"Second photo"},{src:"/vm_img/third.jpg",alt:"Third photo"}]);
assert.equal(approved.approvedEmailLayout({...source000,id:"001"}).destination,"offer");
for(const id of ["002","003"]){const short=approved.approvedEmailLayout({...source000,id});assert.equal(short.showHeaderImage,false);assert.equal(short.style,"editorial");assert.equal(short.introduction,source000.bodyText)}
assert.equal(test010.id,"010");assert.equal(test010.isActive,false);assert.equal(test010.version,0);assert.equal(source000.id,"000");assert.equal(source000.version,7);
const test010Body=model.readEmailComposition(test010.bodyText);assert.equal(test010Body.introduction,"First paragraph.");assert.equal(test010Body.sections[1].text,"Second paragraph.");assert.equal(test010Body.sections[3].text,"Third paragraph.");
for(const locale of ["el","en"])for(const event of ["wedding","baptism"]){
  const basic=designs.basicEmailDesign(locale,event,"001");
  const body=model.resolveEmailBody(model.serializeEmailComposition(basic),designs.emailDesignSamples(locale,event));
  model.assertResolvedEmail("Design sample",body);
  assert.match(renderer.renderEmailDocument(body,{locale,offerUrl:"https://example.invalid/offer/sample"}),/max-width:600px/);
}
const base=model.initialEmailComposition("A personal introduction.","el","001");
base.title="Για τη βάπτιση της Σοφίας";base.greeting="Καλησπέρα Γιάννη,";
base.introduction='Hello **friend**.\n\n[Gallery](https://example.invalid/gallery?a=1&b=2)\n\n## Details\n\n- First\n- Second\n\n<script>alert(1)</script>';
const encoded=model.serializeEmailComposition(base);
const crlf=encoded.replace("VM_EMAIL_V1\n","VM_EMAIL_V1\r\n");
assert.deepEqual(model.readEmailComposition(crlf),model.readEmailComposition(encoded));
assert.deepEqual(model.readEmailComposition(encoded.replace("VM_EMAIL_V1\n","VM_EMAIL_V1\\n")),model.readEmailComposition(encoded));
const emptyWrapper=model.initialEmailComposition("","el","000");
const nested=model.serializeEmailComposition({...emptyWrapper,introduction:crlf});
assert.deepEqual(model.readEmailComposition(nested),model.readEmailComposition(encoded));
assert.throws(()=>model.readEmailComposition(model.serializeEmailComposition({...emptyWrapper,title:"Do not discard this edit",introduction:crlf})));
assert.throws(()=>model.readEmailComposition("VM_EMAIL_V9\n{}"));
assert.throws(()=>model.assertRenderedEmail({subject:"Test",html:"<p>VM_EMAIL_V1 JSON</p>",text:""}));
const legacyEnvelope=JSON.parse(encoded.slice(model.compositionPrefix.length));delete legacyEnvelope.sections;
assert.deepEqual(model.readEmailComposition(model.compositionPrefix+JSON.stringify(legacyEnvelope)).sections,[]);
const sections=[
  {id:"photo",type:"image",image:"/vm_img/photo.jpg",alt:"A family together"},
  {id:"words",type:"text",title:"A personal story",text:"Paragraph **one**.\n\nParagraph two."},
  {id:"columns",type:"columns",image:"/vm_img/portrait.jpg",alt:"An outdoor portrait",title:"Natural light",text:"Gentle guidance.",imageSide:"left"},
  {id:"cta",type:"button",label:"Open connected offer",destination:"offer",url:""},
];
const sectionBody=model.serializeEmailComposition({...base,sections});
model.assertResolvedEmail("Subject",sectionBody);
model.assertEmailSectionImages(sectionBody,[{src:"/vm_img/photo.jpg"},{src:"/vm_img/portrait.jpg"}]);
assert.throws(()=>model.assertEmailSectionImages(sectionBody,[]));
assert.throws(()=>model.assertResolvedEmail("Subject",model.serializeEmailComposition({...base,sections:[{...sections[0],alt:""}]})));
assert.throws(()=>model.serializeEmailComposition({...base,sections:[sections[0],sections[0]]}));
assert.throws(()=>model.serializeEmailComposition({...base,sections:[{...sections[0],image:"/vm_img/../secret.png"}]}));
assert.throws(()=>model.serializeEmailComposition({...base,sections:[{...sections[3],url:"javascript:alert(1)"}]}));
const moved=model.moveEmailSection(sections,"words",-1);assert.equal(moved[0].id,"words");assert.equal(sections[0].id,"photo");assert.equal(model.moveEmailSection(sections,"photo",-1),sections);
const duplicated=[...moved,{...moved[0],id:"duplicate"}];assert.equal(model.readEmailComposition(model.serializeEmailComposition({...base,sections:duplicated})).sections.length,5);
const removed=duplicated.filter(section=>section.id!=="words");assert.equal(removed.length,4);assert.equal(removed.at(-1).id,"duplicate");
assert.equal(model.newEmailSection("columns","new").imageSide,"left");
const options={locale:"el",siteUrl:"https://example.invalid",offerUrl:"https://example.invalid/offer/connected",headerImageUrl:"/photo.jpg"};
const html=renderer.renderEmailDocument(encoded,options),text=renderer.renderEmailText(encoded,options);
assert.equal(renderer.renderEmailDocument(crlf,options),html);assert.equal(renderer.renderEmailDocument(nested,options),html);
model.assertRenderedEmail({subject:"Test",html,text});
const sectionHtml=renderer.renderEmailDocument(sectionBody,options),sectionText=renderer.renderEmailText(sectionBody,options);
assert.ok(sectionHtml.indexOf('alt="A family together"')<sectionHtml.indexOf("A personal story"));
assert.ok(sectionHtml.indexOf("A personal story")<sectionHtml.indexOf('alt="An outdoor portrait"'));
assert.match(sectionHtml,/vm-column\{display:block!important;width:100%!important/);
assert.match(sectionHtml,/width="47%"/);assert.match(sectionHtml,/href="https:\/\/example.invalid\/offer\/connected"/);
assert.match(sectionText,/A family together/);assert.match(sectionText,/Natural light/);assert.doesNotMatch(sectionText,/VM_EMAIL_V1/);
const sectionSnapshot=JSON.parse(JSON.stringify({body:sectionBody}));assert.equal(renderer.renderEmailDocument(sectionSnapshot.body,options),sectionHtml);
const localSectionHtml=renderer.renderEmailDocument(sectionBody,{...options,assetBaseUrl:"http://localhost:3000"});assert.match(localSectionHtml,/http:\/\/localhost:3000\/vm_img\/photo.jpg/);
assert.match(html,/max-width:600px/);assert.match(html,/padding:28px 22px/);assert.match(html,/<strong>friend<\/strong>/);assert.match(html,/<ul /);
assert.match(html,/href="https:\/\/example.invalid\/offer\/connected"/);assert.match(text,/https:\/\/example.invalid\/offer\/connected/);
assert.match(html,/&lt;script&gt;/);assert.doesNotMatch(html,/<script>/);assert.doesNotMatch(html,/Βιντεοσκόπηση|Μια ολοκληρωμένη/);
const editorial=model.serializeEmailComposition({...base,style:"editorial",closing:"Με εκτίμηση,\nΒασίλης Μούμκας",sections:[{id:"signature-test",type:"text",title:"",text:"Final paragraph.\n\nΒασίλης Μούμκας"}],gallery:{...base.gallery,enabled:true,url:"https://example.invalid/gallery"}});
const editorialHtml=renderer.renderEmailDocument(editorial,options);
assert.doesNotMatch(editorialHtml,/Βασίλης Μούμκας|Fine Art Photographer/);
assert.match(editorialHtml,/Με εκτίμηση/);assert.match(editorialHtml,/width="350"/);
assert.match(editorialHtml,/border-radius:4px/);assert.match(editorialHtml,/letter-spacing:1.5px/);
assert.match(editorialHtml,/bgcolor="#292724"/);assert.match(editorialHtml,/email-social-instagram.png/);assert.match(editorialHtml,/email-social-pinterest.png/);
assert.match(editorialHtml,/href="tel:\+306972218775"/);assert.match(editorialHtml,/href="mailto:vasilis.moumkas@gmail.com"/);
assert.match(editorialHtml,/class="vm-footer-contact"/);assert.match(editorialHtml,/bgcolor="#FFFFC4"/);
assert.match(editorialHtml,/name="color-scheme" content="light"/);assert.match(editorialHtml,/bgcolor="#F5F3EF"/);
for(const tag of editorialHtml.matchAll(/<table\b([^>]*)>/g)){assert.match(tag[1],/border="0"/);assert.match(tag[1],/border:0!important/)}
assert.match(editorialHtml,/border:0!important;padding:32px 24px/);
assert.match(editorialHtml,/padding:32px 24px/);assert.match(editorialHtml,/padding:0 24px/);assert.doesNotMatch(editorialHtml,/linear-gradient/);
const inlineAssets=load("src/lib/email-inline-assets.ts");
const embedded=await inlineAssets.inlineEmailBrandAssets(editorialHtml);
assert.equal(embedded.attachments.length,3);assert.match(embedded.html,/src="cid:vm-signature@vasilismoumkas.com"/);
assert.match(embedded.html,/src="cid:vm-instagram@vasilismoumkas.com"/);assert.match(embedded.html,/src="cid:vm-pinterest@vasilismoumkas.com"/);
assert.ok(embedded.attachments.find(item=>item.filename==="vasilis-moumkas-logo-mail-signature.png").content.equals(readFileSync("public/vm_img/Offer/vasilis-moumkas-logo-mail-signature.png")));
assert.equal((await inlineAssets.inlineEmailBrandAssets('<img src="https://example.invalid/private/file.png">')).attachments.length,0);
const missingBrand=load("src/lib/email-inline-assets.ts",{"node:fs/promises":{readFile:async()=>{throw Error("Missing")}}});
await assert.rejects(missingBrand.inlineEmailBrandAssets(editorialHtml),/Email branding file missing/);
const mimeMessage=await nativeRequire("nodemailer").createTransport({streamTransport:true,buffer:true,newline:"unix"}).sendMail({from:"studio@example.invalid",to:"owner@example.invalid",subject:"Offline MIME verification",html:embedded.html,text:"Plain text",attachments:embedded.attachments});
assert.match(mimeMessage.message.toString(),/Content-ID: <vm-signature@vasilismoumkas.com>/);assert.match(mimeMessage.message.toString(),/Content-Type: image\/png/);
assert.ok(editorialHtml.indexOf("vasilis-moumkas-logo-mail-signature.png")<editorialHtml.indexOf('href="tel:+306972218775"'));
assert.ok(editorialHtml.indexOf('href="tel:+306972218775"')<editorialHtml.indexOf("email-social-instagram.png"));
assert.doesNotMatch(editorialHtml,/padding:28px 0 18px/);
assert.match(html,/Fine Art Photographer/);assert.doesNotMatch(html,/email-social-instagram.png/);
assert.doesNotMatch(text,/VM_EMAIL_V1|"enabled"/);assert.match(html,/height:auto/);assert.match(html,/vm_img\/Offer\/vasilis-moumkas-logo-mail-signature.png/);
assert.throws(()=>model.readEmailComposition(model.compositionPrefix+'{"version":99}'));
assert.throws(()=>model.serializeEmailComposition({...base,gallery:{...base.gallery,enabled:true,url:"javascript:alert(1)"}}));
assert.throws(()=>model.assertResolvedEmail("Subject",encoded.replace("A personal introduction.","{{parents_names}}" ).replace("Hello **friend**.","{{parents_names}}")));
assert.throws(()=>model.assertCompositionDestination(encoded,false,true));
const name='Γιάννης "Example"';const templated=model.serializeEmailComposition({...base,greeting:"{{first_name}}"});
assert.equal(model.readEmailComposition(model.resolveEmailBody(templated,{first_name:name})).greeting,name);
assert.match(model.localizedEmailDate("2027-05-16","el"),/16 Μαΐου 2027/);
const enabled=model.serializeEmailComposition({...base,gallery:{...base.gallery,enabled:true,url:"https://example.invalid/story"},video:{...base.video,enabled:true,servicesUrl:"http://example.invalid/services",samplesUrl:"https://example.invalid/video"}});
model.assertResolvedEmail("Subject",enabled);assert.match(renderer.renderEmailDocument(enabled,options),/example.invalid\/video/);
assert.match(renderer.renderEmailDocument("Existing legacy text",{locale:"en"}),/Existing legacy text/);
const templates=load("src/lib/email-templates.ts",{"@/lib/database":{getDatabase:()=>{throw Error("Unexpected database access");}},"@/lib/email-renderer":renderer},{NEXT_PUBLIC_SITE_URL:"https://example.invalid"});
const template={id:"001",eventType:"baptism",locale:"el",bodyText:templated,subject:"Για {{first_name}}",headerImage:"/photo.jpg"};
const rendered=templates.renderTemplate(template,{first_name:name,offer_url:options.offerUrl});
assert.match(rendered.text,/Γιάννης "Example"/);assert.match(rendered.text,/offer\/connected/);
const edited=templates.renderEditedEmail("Subject",encoded,"el",{offer_url:options.offerUrl,email_header_image:"/photo.jpg"});
assert.equal(edited.html,html);assert.equal(edited.text,text);
const snapshot=JSON.parse(JSON.stringify({subject:"Subject",bodyText:encoded,headerImage:"/photo.jpg"}));
assert.equal(templates.renderEditedEmail(snapshot.subject,snapshot.bodyText,"el",{offer_url:options.offerUrl,email_header_image:snapshot.headerImage}).html,html);
const financials=load("src/lib/client-email-financials.ts");
const financial=financials.withClientFinancialParagraph({...template,id:"005",bodyText:model.serializeEmailComposition({...base,introduction:"Introduction\n\nΜε εκτίμηση,"}),allowedPlaceholders:[]});
assert.ok(model.readEmailComposition(financial.bodyText));assert.match(model.readEmailComposition(financial.bodyText).introduction,/deposit_percent/);
let authenticated=false,sends=0;
const mocks={
  "@/lib/email-inline-assets":load("src/lib/email-inline-assets.ts"),
  "@/lib/admin-auth":{requireAdmin:async()=>{if(!authenticated)throw Error("Unauthorized");}},
  "@/lib/clients":{getClient:async()=>({id:"client",leadId:"lead",eventType:"baptism"})},
  "@/lib/leads":{getLead:async()=>({id:"lead",eventType:"baptism"})},
  "@/lib/offers":{getLatestOfferForLead:async()=>({slug:"connected"})},
  "@/lib/client-portals":{getPortalForLead:async()=>null},
  "@/lib/portfolio":{listPortfolioEmailImages:async()=>[{src:"/photo.jpg"}]},
  "@/lib/email-templates":{getEmailTemplate:async()=>({id:"001",isActive:true,locale:"el"}),renderEditedEmail:(subject,body,locale,values)=>({subject,html:renderer.renderEmailDocument(body,{locale,siteUrl:"https://example.invalid",headerImageUrl:values.email_header_image,offerUrl:values.offer_url}),text:renderer.renderEmailText(body,{locale,offerUrl:values.offer_url})})},
  "@/lib/email-delivery":{smtpConfigured:()=>true,getSmtpTransport:()=>({sendMail:async input=>{sends++;assert.equal(input.to,"owner@example.invalid");assert.match(input.subject,/^\[TEST/);assert.match(input.html,/offer\/connected/);}})},
  "@/lib/email-composition":model,
};
const action=load("src/app/admin/email-templates/composer-actions.ts",mocks,{NEXT_PUBLIC_SITE_URL:"https://example.invalid",INTERNAL_NOTIFICATION_EMAIL:"owner@example.invalid",SMTP_FROM_EMAIL:"studio@example.invalid"});
const form=new FormData();for(const[key,value]of Object.entries({entityField:"clientId",clientId:"1729e44c-8ecf-488f-9222-063d80806d74",templateId:"001",locale:"el",subject:"Subject",bodyText:encoded,headerImage:"/photo.jpg"}))form.set(key,value);
assert.equal((await action.sendComposerTestAction({},form)).success,false);assert.equal(sends,0);
authenticated=true;assert.equal((await action.sendComposerTestAction({},form)).success,true);assert.equal(sends,1);
form.set("headerImage","https://unapproved.invalid/photo.jpg");assert.equal((await action.sendComposerTestAction({},form)).success,false);assert.equal(sends,1);
let designTest;
const designActions=load("src/app/admin/email-templates/actions.ts",{
  "@/lib/email-composition":model,
  "next/cache":{revalidatePath:()=>{}},
  "@/lib/admin-auth":mocks["@/lib/admin-auth"],
  "@/lib/email-delivery":{smtpConfigured:()=>true,sendTrackedEmail:async input=>{designTest=input;return{success:true};}},
  "@/lib/email-templates":{getEmailTemplate:async()=>({...template,bodyText:"Old saved body"}),renderTemplate:templates.renderTemplate,updateEmailTemplate:async()=>{throw Error("Unexpected template write");}},
  "@/lib/email-design-samples":designs,
  "@/lib/portfolio":mocks["@/lib/portfolio"],
});
const unsaved=new FormData();for(const[key,value]of Object.entries({id:"001",eventType:"baptism",locale:"el",recipient:"owner@example.invalid",subject:"Unsaved subject",bodyText:model.serializeEmailComposition({...base,title:"Unsaved design title"}),headerImage:"/photo.jpg"}))unsaved.set(key,value);
assert.equal((await designActions.testSendAction({},unsaved)).success,true);
assert.match(designTest.html,/Unsaved design title/);assert.match(designTest.subject,/Unsaved subject/);assert.equal(designTest.clientId,undefined);assert.equal(designTest.leadId,undefined);assert.equal(designTest.offerId,undefined);
const writes=[];let committed=false,released=false;
const testStorage=load("src/lib/email-templates.ts",{"@/lib/database":{getDatabase:()=>({getConnection:async()=>({beginTransaction:async()=>{},execute:async(sql,params)=>writes.push({sql,params}),commit:async()=>{committed=true},rollback:async()=>{throw Error("Unexpected rollback")},release:()=>{released=true}})})},"@/lib/email-renderer":renderer});
await testStorage.saveTestEmailLayout("wedding","el",{subject:test010.subject,bodyText:test010.bodyText,headerImage:test010.headerImage});
assert.equal(writes.length,2);assert.ok(writes.every(write=>write.sql.includes("'010'")));assert.ok(writes.every(write=>!write.sql.includes("'000'")));assert.match(writes[1].sql,/is_active=0/);assert.ok(committed&&released);
mkdirSync("artifacts/verification/email-composer-2026-10-31",{recursive:true});
let stored=null,before=null,draftUpdates=0;
const draftConnection={beginTransaction:async()=>{before=stored?structuredClone(stored):null},execute:async(sql,params)=>{if(sql.startsWith("INSERT IGNORE")&&!stored)stored=JSON.parse(params[1]);if(sql.startsWith("UPDATE")){stored=JSON.parse(params[0]);draftUpdates++}},query:async()=>[stored?[{value_json:JSON.stringify(stored)}]:[]],commit:async()=>{},rollback:async()=>{stored=before},release:()=>{}};
const draftLibrary=load("src/lib/email-drafts.ts",{"@/lib/database":{getDatabase:()=>({getConnection:async()=>draftConnection,query:draftConnection.query})}});
const draftPayload={subject:"Draft subject",content:base,image:"/photo.jpg"};
assert.equal((await draftLibrary.readEmailDraft("test-key")).revision,0);
assert.equal((await draftLibrary.writeEmailDraft("test-key",draftPayload,0)).revision,1);
await assert.rejects(draftLibrary.writeEmailDraft("test-key",{...draftPayload,subject:"Stale device"},0),/DRAFT_CONFLICT/);
assert.equal(stored.draft.subject,"Draft subject");assert.equal(draftUpdates,1);
await draftLibrary.writeEmailDraft("test-key",{...draftPayload,subject:"Other device"},1);
await assert.rejects(draftLibrary.writeEmailDraft("test-key",null,1),/DRAFT_CONFLICT/);assert.equal(stored.draft.subject,"Other device");
await draftLibrary.writeEmailDraft("test-key",null,2);assert.equal(stored.draft,null);assert.equal(stored.revision,3);
let draftActionWrites=0;authenticated=false;
const draftActions=load("src/app/admin/email-templates/draft-actions.ts",{"@/lib/admin-auth":mocks["@/lib/admin-auth"],"@/lib/clients":mocks["@/lib/clients"],"@/lib/leads":mocks["@/lib/leads"],"@/lib/email-templates":{getEmailTemplate:async()=>({isActive:true})},"@/lib/email-drafts":{emailDraftSchema:draftLibrary.emailDraftSchema,readEmailDraft:async()=>({revision:0,draft:null}),writeEmailDraft:async()=>{draftActionWrites++;return{revision:1,draft:draftPayload}}}});
const scope={entityField:"clientId",entityId:"1729e44c-8ecf-488f-9222-063d80806d74",templateId:"001",locale:"el"};
assert.equal((await draftActions.saveEmailDraftAction({scope,draft:draftPayload,expectedRevision:0})).success,false);assert.equal(draftActionWrites,0);
authenticated=true;assert.equal((await draftActions.saveEmailDraftAction({scope,draft:draftPayload,expectedRevision:0})).success,true);assert.equal(draftActionWrites,1);
const blockedDelivery=load("src/lib/email-delivery.ts",{"@/lib/database":{getDatabase:()=>{throw Error("Unexpected database access before payload check")}}});
await assert.rejects(blockedDelivery.sendTrackedEmail({subject:"Bad",html:"VM_EMAIL_V1 JSON",text:"",templateId:"001",recipient:"owner@example.invalid"}),/Delivery blocked/);
const collectionRows=["001","002"].map(id=>({id,event_type:"wedding",locale:"el",name:"Approved template",purpose:"",subject:"Approved subject",body_text:"Approved personal text.",body_html:"",header_image:"/photo.jpg",allowed_placeholders:[],trigger_description:"Existing trigger",is_active:1,version:3,updated_at:"2026-10-31T00:00:00Z"}));
const collectionWrites=[];let collectionRollbacks=0;
const collectionStorage=load("src/lib/email-templates.ts",{"@/lib/database":{getDatabase:()=>({getConnection:async()=>({beginTransaction:async()=>{},query:async()=>[collectionRows],execute:async(sql,params)=>collectionWrites.push({sql,params}),commit:async()=>{},rollback:async()=>{collectionRollbacks++},release:()=>{}})})},"@/lib/email-renderer":renderer});
await assert.rejects(collectionStorage.applyEmailCollectionStyle("wedding","el",[{id:"001",version:2},{id:"002",version:3}]),/changed/);assert.equal(collectionWrites.length,0);assert.equal(collectionRollbacks,1);
assert.equal(await collectionStorage.applyEmailCollectionStyle("wedding","el",[{id:"001",version:3},{id:"002",version:3}]),2);
assert.ok(collectionWrites.every(write=>!/(?:SET|,)\s*(?:subject|header_image|is_active|trigger_description)=/.test(write.sql)));
assert.equal(model.readEmailComposition(collectionWrites[1].params[0]).showHeaderImage,false);assert.equal(collectionRows[1].is_active,1);assert.equal(collectionRows[1].body_text,"Approved personal text.");
console.log("PASS - CRLF and empty nested designs recover; malformed designs/raw internal payloads cannot be sent. Server drafts reject stale writes and require authentication.");
writeFileSync("artifacts/verification/email-composer-2026-10-31/offline-preview.html",html);
console.log("PASS - safe structured/legacy rendering, optional sections, labeled links, localized dates, quote-safe variables, connected CTA and plain text.");
console.log("PASS - owner-only test requires authentication and approved image; no tracked deliveries, database, workflow, network or real email used.");
