"use client";
import {useActionState,useEffect,useMemo,useState} from "react";
import {useEmailPreviewOrigin} from "@/components/admin/useEmailPreviewOrigin";
import {EmailCompositionFields} from "@/components/admin/EmailCompositionFields";
import {EmailHeaderImagePicker} from "@/components/admin/EmailHeaderImagePicker";
import {brandedEmailSubject,compositionPrefix,resolveEmailBody} from "@/lib/email-composition";
import {approvedEmailLayout} from "@/lib/approved-email-layout";
import {basicEmailDesign,emailDesignSamples} from "@/lib/email-design-samples";
import {renderEmailDocument} from "@/lib/email-renderer";
import type {EmailTemplate} from "@/lib/email-templates";
import type {PortfolioEmailImage} from "@/lib/portfolio";
import {getPortfolioEmailImagesAction,testSendAction,updateTemplateAction} from "./actions";

const initial={success:false,message:""};
const fieldClass="w-full border border-ink-black/20 bg-white p-3 text-base normal-case tracking-normal";
export function TemplateEditor({template,smtpReady}:{template:EmailTemplate;smtpReady:boolean}) {
  const previewOrigin=useEmailPreviewOrigin();
  const[content,setContent]=useState(()=>approvedEmailLayout(template));
  const[subject,setSubject]=useState(brandedEmailSubject(template.subject,template.eventType)),[image,setImage]=useState(template.headerImage??"");
  const[active,setActive]=useState(template.isActive),[mobile,setMobile]=useState(false),[dirty,setDirty]=useState(false);
  const[images,setImages]=useState<PortfolioEmailImage[]>([]),[imageError,setImageError]=useState("");
  const[saveState,saveAction,saving]=useActionState(updateTemplateAction,initial);
  const[testState,testAction,testing]=useActionState(testSendAction,initial);
  useEffect(()=>{let current=true;getPortfolioEmailImagesAction().then(items=>{if(current)setImages(items)}).catch(error=>{if(current)setImageError(error instanceof Error?error.message:"Unable to load images.")});return()=>{current=false}},[]);
  useEffect(()=>{if(!saveState.success)return;const timer=window.setTimeout(()=>setDirty(false),0);return()=>window.clearTimeout(timer)},[saveState]);
  useEffect(()=>{if(!dirty)return;const warn=(event:BeforeUnloadEvent)=>{event.preventDefault();event.returnValue=""};window.addEventListener("beforeunload",warn);return()=>window.removeEventListener("beforeunload",warn)},[dirty]);
  const body=compositionPrefix+JSON.stringify(content);
  const samples=emailDesignSamples(template.locale,template.eventType);
  const preview=useMemo(()=>{try{const values=emailDesignSamples(template.locale,template.eventType);return{html:renderEmailDocument(resolveEmailBody(body,values),{locale:template.locale,siteUrl:process.env.NEXT_PUBLIC_SITE_URL,assetBaseUrl:previewOrigin,headerImageUrl:image,offerUrl:values.offer_url,portalUrl:values.portal_url}),error:""}}catch(error){return{html:"",error:error instanceof Error?error.message:"Check the links in your design."}}},[body,image,template.locale,template.eventType,previewOrigin]);
  const previewSubject=brandedEmailSubject(subject,template.eventType).replace(/{{\s*([a-z0-9_]+)\s*}}/gi,(match,key)=>samples[key as keyof typeof samples]??match);
  const scope=<><input type="hidden" name="id" value={template.id}/><input type="hidden" name="eventType" value={template.eventType}/><input type="hidden" name="locale" value={template.locale}/><input type="hidden" name="subject" value={brandedEmailSubject(subject,template.eventType)}/><input type="hidden" name="bodyText" value={body}/><input type="hidden" name="headerImage" value={image}/></>;
  const changeContent:typeof setContent=value=>{setDirty(true);setContent(value)};
  return <div id="email-template-editor" data-email-design-dirty={dirty?"true":"false"} className="mt-6">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-sm border border-ink-black/15 bg-white p-4"><div><p className="text-sm text-ink-black/60">{template.id==="010"?"TEST ONLY — copied from 000 ·":"Editing saved template ·"} {template.eventType} · {template.locale.toUpperCase()}</p><h2 className="mt-1 text-xl">{template.id} — {template.name}</h2></div><button type="button" disabled={saving||testing} onClick={()=>{if(window.confirm("Load the basic visual design? This replaces the editor text only. Nothing is saved until you click Save template.")){setContent(basicEmailDesign(template.locale,template.eventType,template.id));setDirty(true)}}} className="border border-ink-black px-4 py-3 text-sm hover:bg-soft-yellow">Use basic visual template</button></div>
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <section aria-label="Email design editor" className="min-w-0 border border-ink-black/15 bg-white">
        <div className="border-b bg-[#F5F3EF] p-5"><h3 className="text-xl">1. Design & content</h3><p className="mt-2 text-sm text-ink-black/65">Change a field on the left and see it immediately on the right. Saving updates this shared template for future emails.</p></div>
        <form action={saveAction} onSubmit={event=>{if(!window.confirm(`Save shared Template ${template.id} · ${template.eventType} · ${template.locale}? Future emails will use this design.`))event.preventDefault()}} className="grid gap-5 p-5">
          {scope}<fieldset disabled={saving||testing} className="grid min-w-0 gap-5">
            <label className="grid gap-2 text-sm">Subject line<input required maxLength={500} value={subject} onChange={event=>{setSubject(event.target.value);setDirty(true)}} className={fieldClass}/></label>
            <details className="border border-ink-black/15"><summary className="cursor-pointer bg-[#F5F3EF] p-4 text-base">Main photo — click to change</summary><div className="p-3"><EmailHeaderImagePicker value={image} onChange={next=>{setImage(next);setDirty(true);const photo=images.find(item=>item.src===next);if(photo)setContent({...content,imageAlt:photo.alt})}} images={images} imageError={imageError} context="Select a portfolio photo. The preview updates immediately; Save template makes this the default for future emails."/></div></details>
            <EmailCompositionFields value={content} onChange={changeContent} images={images}/>
            <details className="border border-ink-black/15 p-4"><summary className="cursor-pointer text-sm">Advanced: template variables & status</summary><p className="mt-3 text-sm">Variables are replaced with each customer’s details. The preview uses sample details.</p><div className="mt-3 flex flex-wrap gap-2">{template.allowedPlaceholders.map(item=><code key={item} className="bg-[#F5F3EF] px-2 py-1 text-xs">{`{{${item}}}`}</code>)}</div><label className="mt-4 flex gap-3 text-sm"><input type="checkbox" name="isActive" disabled={template.id==="010"} checked={template.id==="010"?false:active} onChange={event=>{setActive(event.target.checked);setDirty(true)}}/>Active template</label></details>
          </fieldset>
          <div className="sticky bottom-0 -mx-5 -mb-5 border-t bg-white p-5"><div className="flex flex-wrap items-center gap-3"><button disabled={saving||testing||Boolean(preview.error)} className="bg-ink-black px-6 py-3 text-base text-white disabled:opacity-40">{saving?"Saving…":"Save template"}</button><span className="text-sm text-ink-black/60">{dirty?"Unsaved changes":"Shared template · no customer email sent"}</span></div><p role="status" className={`mt-2 text-sm ${saveState.success?"text-green-800":"text-red-700"}`}>{saveState.message}</p></div>
        </form>
      </section>
      <section aria-label="Live email preview" className="min-w-0 border border-ink-black/15 bg-[#F5F3EF] lg:sticky lg:top-5">
        <div className="border-b bg-white p-5"><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-xl">2. Live preview</h3><div className="flex border border-ink-black/20"><button type="button" aria-pressed={!mobile} onClick={()=>setMobile(false)} className={`px-3 py-2 text-sm ${!mobile?"bg-ink-black text-white":""}`}>Desktop</button><button type="button" aria-pressed={mobile} onClick={()=>setMobile(true)} className={`px-3 py-2 text-sm ${mobile?"bg-ink-black text-white":""}`}>Mobile</button></div></div><p className="mt-3 break-words text-sm">Subject: {previewSubject}</p><p className="mt-2 text-sm text-ink-black/55">Sample customer details · proposal buttons use sample links.</p></div>
        {preview.error?<p role="alert" className="p-5 text-sm text-red-700">Check the design links: {preview.error}</p>:<div className="overflow-x-auto p-3"><iframe title="Live template design preview" sandbox="" srcDoc={preview.html} style={{width:mobile?390:"100%",maxWidth:"100%"}} className="mx-auto block h-[75vh] min-h-[540px] bg-white"/></div>}
        <details className="border-t bg-white p-5"><summary className="cursor-pointer text-sm">Send a test of this design</summary><form action={testAction} className="mt-4 grid gap-3">{scope}<p className="text-sm text-ink-black/65">Tests the current editor, including unsaved changes, using sample customer details. No offer status or follow-up changes.</p><label className="grid gap-2 text-sm">Your test email address<input required type="email" name="recipient" placeholder="your@email.com" className={fieldClass}/></label><button disabled={!smtpReady||testing||saving||Boolean(preview.error)} className="justify-self-start border border-ink-black px-4 py-3 text-sm disabled:opacity-40">{testing?"Sending test…":"Send test email"}</button><p role="status" className="text-sm">{testState.message||(!smtpReady?"SMTP is not configured.":"")}</p></form></details>
      </section>
    </div>
  </div>;
}
