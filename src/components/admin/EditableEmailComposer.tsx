"use client";

import { useActionState,useMemo,useState } from "react";
import type { EmailTemplate } from "@/lib/email-templates";
import { renderEmailDocument } from "@/lib/email-renderer";

export type EmailComposerState={success:boolean;message:string;deliveryId?:string};
type ComposerAction=(state:EmailComposerState,formData:FormData)=>Promise<EmailComposerState>;
type SourceLink={label:string;value:string};

const initialState:EmailComposerState={success:false,message:""};
const replaceValues=(value:string,values:Record<string,string>)=>value.replace(/{{\s*([a-z0-9_]+)\s*}}/gi,(_match,key)=>values[key]||`[MISSING: ${key}]`);

export function EditableEmailComposer({action,entityField,entityId,recipient,templates,values,smtpReady,initialTemplateId="001",sources=[],headerImageOverride}:{action:ComposerAction;entityField:"id"|"clientId";entityId:string;recipient:string|null;templates:EmailTemplate[];values:Record<string,string>;smtpReady:boolean;initialTemplateId?:string;sources?:SourceLink[];headerImageOverride?:string}){
  const fallback=templates.some(item=>item.id===initialTemplateId)?initialTemplateId:(templates[0]?.id??"");
  const[selected,setSelected]=useState(fallback);
  const[attempt,setAttempt]=useState(0);
  const template=templates.find(item=>item.id===selected);
  if(!template)return <p className="text-sm text-red-700">No active email template is available for this client.</p>;
  return <ComposerAttempt key={`${template.eventType}-${template.locale}-${selected}-${attempt}`} action={action} entityField={entityField} entityId={entityId} recipient={recipient} template={template} templates={templates} values={values} smtpReady={smtpReady} selected={selected} onSelect={setSelected} sources={sources} headerImageOverride={selected===initialTemplateId?headerImageOverride:undefined} onSendAgain={()=>{if(window.confirm("Send another copy of this email? The previous delivery will remain in Email History."))setAttempt(value=>value+1)}}/>;
}

function ComposerAttempt({action,entityField,entityId,recipient,template,templates,values,smtpReady,selected,onSelect,sources,headerImageOverride,onSendAgain}:{action:ComposerAction;entityField:"id"|"clientId";entityId:string;recipient:string|null;template:EmailTemplate;templates:EmailTemplate[];values:Record<string,string>;smtpReady:boolean;selected:string;onSelect:(value:string)=>void;sources:SourceLink[];headerImageOverride?:string;onSendAgain:()=>void}){
  const[state,formAction,pending]=useActionState(action,initialState);
  const initialSubject=replaceValues(template.subject,values);
  const initialBody=replaceValues(template.bodyText,values);
  const[subject,setSubject]=useState(initialSubject);
  const[body,setBody]=useState(initialBody);
  const headerImageUrl=headerImageOverride!==undefined?(headerImageOverride||process.env.NEXT_PUBLIC_EMAIL_HEADER_IMAGE_URL):(template.headerImage||process.env.NEXT_PUBLIC_EMAIL_HEADER_IMAGE_URL);
  const document=useMemo(()=>renderEmailDocument(body,{locale:template.locale,siteUrl:process.env.NEXT_PUBLIC_SITE_URL,headerImageUrl,offerUrl:values.offer_url,portalUrl:values.portal_url,galleryUrl:values.wedding_gallery_url||values.baptism_gallery_url||values.recent_gallery_url}),[body,headerImageUrl,template.locale,values]);
  const unavailable=!recipient||!smtpReady;
  return <form action={formAction} onSubmit={(event)=>{const input=event.currentTarget.elements.namedItem("idempotencyKey") as HTMLInputElement|null;if(input&&!input.value)input.value=crypto.randomUUID()}} className="grid gap-5">
    <input type="hidden" name={entityField} value={entityId}/>
    <input type="hidden" name="idempotencyKey" defaultValue=""/>
    <input type="hidden" name="locale" value={template.locale}/>
    <label className="grid gap-2 text-[10px] uppercase tracking-[0.14em]">Email template<select name="templateId" value={selected} onChange={event=>onSelect(event.target.value)} disabled={pending||state.success} className="border border-ink-black/20 bg-transparent px-4 py-3 text-sm  disabled:opacity-50">{templates.map(item=><option key={`${item.id}-${item.eventType}-${item.locale}`} value={item.id}>Template {item.id} · {item.name}</option>)}</select></label>
    {sources.length>0&&<div className="grid gap-3 md:grid-cols-2">{sources.map(source=><div key={source.label} className="border border-ink-black/10 bg-white/60 p-3"><p className="text-[12px]  uppercase tracking-[0.14em] text-ink-black/45">{source.label}</p><p className="mt-1 break-all text-sm ">{source.value||"Not available"}</p></div>)}</div>}
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="grid content-start gap-4">
        <label className="grid gap-2 text-[10px] uppercase tracking-[0.14em]">Recipient<input name="recipient" type="email" required value={recipient??""} readOnly data-recipient-ready={recipient?"true":"false"} className="border border-ink-black/20 bg-white px-4 py-3 text-sm normal-case read-only:text-ink-black/60"/><span className={`text-[12px]  normal-case tracking-normal ${recipient?"text-green-800":"text-red-700"}`}>{recipient?"Automatically inherited from this lead or client.":"No email is connected to this record."}</span></label>
        <label className="grid gap-2 text-[10px] uppercase tracking-[0.14em]">Subject<input name="subject" required maxLength={500} value={subject} onChange={event=>setSubject(event.target.value)} disabled={pending||state.success} className="border border-ink-black/20 bg-white px-4 py-3 text-sm normal-case disabled:opacity-60"/></label>
        <label className="grid gap-2 text-[10px] uppercase tracking-[0.14em]">Email content<textarea name="bodyText" required maxLength={50000} rows={20} value={body} onChange={event=>setBody(event.target.value)} disabled={pending||state.success} className="resize-y border border-ink-black/20 bg-white p-4 text-sm leading-relaxed normal-case disabled:opacity-60"/></label>
      </div>
      <div className="min-w-0 border border-ink-black/15 bg-white p-4"><p className="text-[10px] uppercase tracking-[0.14em]">Final HTML preview · same renderer as SMTP</p><p className="mt-3 border-b border-ink-black/10 pb-3 text-sm"><span className="text-ink-black/40">Subject · </span>{subject}</p><iframe title="Final email preview" sandbox="" srcDoc={document} className="mt-3 min-h-[620px] w-full bg-white"/></div>
    </div>
    <div className="flex flex-wrap items-center gap-3"><button disabled={unavailable||pending||state.success} className="flex min-w-44 items-center justify-center gap-2 bg-ink-black px-5 py-3 text-[10px] uppercase text-white disabled:cursor-not-allowed disabled:opacity-45">{pending&&<span aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-white/35 border-t-white"/>}{pending?"Sending…":state.success?"Sent ✓":"Send to client"}</button>{state.success&&<button type="button" onClick={onSendAgain} className="border border-amber-600 px-4 py-3 text-[10px] uppercase text-amber-900 hover:bg-amber-100">Send again</button>}<span aria-live="polite" role="status" className={`text-sm  ${state.success?"text-green-800":"text-red-700"}`}>{state.message}</span></div>
    {!recipient&&<p className="text-sm  text-red-700">Add an email address before sending.</p>}{!smtpReady&&<p className="text-sm  text-red-700">SMTP is not available. Check Settings &amp; Health.</p>}
  </form>;
}
