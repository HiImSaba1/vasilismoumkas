"use client";
import { useActionState,useMemo,useState } from "react";
import type { EmailTemplate } from "@/lib/email-templates";
import type { PortfolioEmailImage } from "@/lib/portfolio";
import { renderEmailDocument } from "@/lib/email-renderer";
import { brandedEmailSubject,assertResolvedEmail,resolveEmailBody,initialEmailComposition,localizedEmailDate,serializeEmailComposition,type EmailComposition } from "@/lib/email-composition";
import {useServerEmailDraft} from "./useServerEmailDraft";
import {useEmailPreviewOrigin} from "./useEmailPreviewOrigin";
import { EmailCompositionFields } from "./EmailCompositionFields";
import { EmailHeaderImagePicker } from "./EmailHeaderImagePicker";
import { sendComposerTestAction } from "@/app/admin/email-templates/composer-actions";
export type EmailComposerState={success:boolean;message:string;deliveryId?:string};
type Draft={subject:string;content:EmailComposition;image:string};
type Props={action:(state:EmailComposerState,formData:FormData)=>Promise<EmailComposerState>;entityField:"id"|"clientId";entityId:string;recipient:string|null;templates:EmailTemplate[];values:Record<string,string>;smtpReady:boolean;initialTemplateId?:string;sources?:{label:string;value:string}[];headerImageOverride?:string;images?:PortfolioEmailImage[]};
const initial={success:false,message:""};
const replace=(text:string,values:Record<string,string>)=>text.replace(/{{\s*([a-z0-9_]+)\s*}}/gi,(_match,key)=>values[key]||`[MISSING: ${key}]`);
export function StructuredEmailComposer(props:Props){
  const[selected,setSelected]=useState(props.templates.some(item=>item.id===props.initialTemplateId)?props.initialTemplateId!:props.templates[0]?.id??"");
  const[carry,setCarry]=useState<Draft|null>(null);
  const[attempt,setAttempt]=useState(0);
  const template=props.templates.find(item=>item.id===selected);
  if(!template)return <p>No active email template is available.</p>;
  return <Attempt key={`${template.eventType}-${template.locale}-${selected}-${attempt}`} {...props} template={template} selected={selected} carry={carry} onAgain={draft=>{setCarry(draft);setAttempt(value=>value+1)}} onSelect={(id,draft)=>{setCarry(draft);setSelected(id)}}/>;
}
function Attempt({action,entityField,entityId,recipient,templates,values,smtpReady,template,selected,onSelect,onAgain,carry,images=[],sources=[],headerImageOverride}:Props&{template:EmailTemplate;selected:string;carry:Draft|null;onSelect:(id:string,draft:Draft|null)=>void;onAgain:(draft:Draft)=>void}){
  const previewOrigin=useEmailPreviewOrigin();
  const[state,formAction,pending]=useActionState(action,initial);
  const[testState,testAction,testing]=useActionState(sendComposerTestAction,initial);
  const resolved={...values,event_date:localizedEmailDate(values.event_date??"",template.locale),wedding_date:localizedEmailDate(values.wedding_date??"",template.locale)};
  const[subject,setSubject]=useState(carry?.subject??brandedEmailSubject(replace(template.subject,resolved),template.eventType));
  const[content,setContent]=useState(()=>carry?.content??initialEmailComposition(resolveEmailBody(template.bodyText,resolved),template.locale,selected));
  const[image,setImage]=useState(carry?.image??headerImageOverride??template.headerImage??process.env.NEXT_PUBLIC_EMAIL_HEADER_IMAGE_URL??"");
  const[changeTo,setChangeTo]=useState(""),[mobile,setMobile]=useState(false),[error,setError]=useState("");
  const draftScope=useMemo(()=>({entityField,entityId,templateId:selected,locale:template.locale}),[entityField,entityId,selected,template.locale]);
  const currentDraft=useMemo(()=>({subject,content,image}),[subject,content,image]);
  const{ready,status}=useServerEmailDraft({scope:draftScope,eventType:template.eventType,draft:currentDraft,carry:Boolean(carry),completed:state.success,restore:saved=>{setSubject(saved.subject);setContent(initialEmailComposition(serializeEmailComposition(saved.content),template.locale,selected));setImage(saved.image)}});
  const outgoingSubject=brandedEmailSubject(subject,template.eventType);
  const body=useMemo(()=>{try{return serializeEmailComposition(content)}catch{return ""}},[content]);
  const preview=useMemo(()=>{try{return renderEmailDocument(body,{locale:template.locale,siteUrl:process.env.NEXT_PUBLIC_SITE_URL,assetBaseUrl:previewOrigin,headerImageUrl:image,offerUrl:values.offer_url,portalUrl:values.portal_url})}catch{return "<p>Correct invalid links to preview.</p>"}},[body,template.locale,image,values.offer_url,values.portal_url,previewOrigin]);
  const busy=pending||testing||state.success||!ready;
  const hidden=<><input type="hidden" name="subject" value={outgoingSubject}/><input type="hidden" name={entityField} value={entityId}/><input type="hidden" name="entityField" value={entityField}/><input type="hidden" name="templateId" value={selected}/><input type="hidden" name="locale" value={template.locale}/><input type="hidden" name="eventType" value={template.eventType}/><input type="hidden" name="bodyText" value={body}/><input type="hidden" name="headerImage" value={image}/></>;
  return <div className="grid gap-5">
    <label className="grid gap-2 text-sm">Email template<select value={selected} disabled={busy} onChange={event=>setChangeTo(event.target.value)} className="border bg-white p-3">{templates.map(item=><option key={item.id} value={item.id}>Template {item.id} · {item.eventType} · {item.locale.toUpperCase()} · {item.name}</option>)}</select></label>
    {changeTo&&<div role="dialog" aria-label="Change template" className="grid gap-3 border-2 border-amber-600 bg-white p-5"><p>Change template without losing your text?</p><div className="flex flex-wrap gap-3"><button type="button" onClick={()=>onSelect(changeTo,{subject,content,image})} className="border px-4 py-3">Keep my text</button><button type="button" onClick={()=>onSelect(changeTo,null)} className="border px-4 py-3">Load template / saved draft</button><button type="button" onClick={()=>setChangeTo("")} className="border px-4 py-3">Cancel</button></div></div>}
    <p role="status" className="text-sm text-ink-black/60">{status}</p>
    {state.success&&<button type="button" className="justify-self-start border border-amber-600 px-4 py-3" onClick={()=>{if(window.confirm("Prepare another copy? The previous delivery stays in history."))onAgain({subject,content,image})}}>Prepare another email</button>}
    <form action={formAction} onSubmit={event=>{try{if(!body)throw new Error("Correct invalid links.");assertResolvedEmail(outgoingSubject,body);if(content.destination!=="none"&&!(content.destination==="offer"?values.offer_url:values.portal_url))throw new Error("Connect the offer or portal first.");const submitter=(event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement|null;if(!window.confirm(`Confirm ${submitter?.value==="schedule"?"schedule":"send"}\nTo: ${recipient}\nSubject: ${outgoingSubject}\nTemplate: ${selected} · ${template.eventType} · ${template.locale}\nOffer: ${values.offer_url||"None"}`)){event.preventDefault();return}const key=event.currentTarget.elements.namedItem("idempotencyKey") as HTMLInputElement;if(!key.value)key.value=crypto.randomUUID();setError("")}catch(caught){event.preventDefault();setError(caught instanceof Error?caught.message:"Invalid email.")}}} className="grid gap-5">
      {hidden}<input type="hidden" name="idempotencyKey" defaultValue=""/>
      <div className="grid gap-5 xl:grid-cols-2"><div className="grid content-start gap-4">
        <label className="grid gap-2 text-sm">Recipient<input name="recipient" type="email" value={recipient??""} readOnly required className="border bg-white p-3"/></label>
        <label className="grid gap-2 text-sm">Subject<input required maxLength={500} disabled={busy} value={subject} onChange={event=>setSubject(event.target.value)} className="border bg-white p-3"/></label>
        <EmailCompositionFields value={content} onChange={setContent} disabled={busy} images={images}/>
        <fieldset disabled={busy}><details><summary className="cursor-pointer border p-3">Use photo in this email only · Template {selected}</summary><EmailHeaderImagePicker value={image} onChange={next=>{setImage(next);const photo=images.find(item=>item.src===next);if(photo)setContent({...content,imageAlt:photo.alt})}} images={images} context={`This email only · ${selected} · ${template.eventType} · ${template.locale.toUpperCase()}. Saved template defaults and other clients are not changed.`}/></details></fieldset>
      </div><div className="min-w-0 border bg-white p-3"><div className="flex gap-3"><button type="button" onClick={()=>setMobile(false)} className="border px-3 py-2">Desktop</button><button type="button" onClick={()=>setMobile(true)} className="border px-3 py-2">Mobile</button></div><div className="mt-3 overflow-auto bg-[#F5F3EF]"><iframe title="Final email preview" sandbox="" srcDoc={preview} style={{width:mobile?390:"100%",maxWidth:"100%"}} className="mx-auto min-h-[750px] bg-white"/></div></div></div>
      <div className="break-words border p-4 text-sm"><p>Template {selected} · {template.eventType} · {template.locale.toUpperCase()}</p><p>Connected offer: {values.offer_url||"None"}</p>{sources.map(source=><p key={source.label}>{source.label}: {source.value||"None"}</p>)}</div>
      <div className="flex flex-wrap items-end gap-3"><label className="grid gap-2 text-sm">Schedule · Europe/Athens<input type="datetime-local" name="scheduledFor" className="border p-3"/></label><button disabled={busy||!recipient||!smtpReady} name="deliveryAction" value="schedule" className="border px-5 py-3 disabled:opacity-40">Schedule</button><button disabled={busy||!recipient||!smtpReady} name="deliveryAction" value="send" className="bg-ink-black px-5 py-3 text-white disabled:opacity-40">{pending?"Working…":"Send now"}</button></div>
      <p role="status" className={state.success?"text-green-800":"text-red-700"}>{error||state.message}</p>
    </form>
    <form action={testAction} className="flex flex-wrap items-center gap-3 border-t pt-4">{hidden}<button disabled={busy||!smtpReady} className="border px-5 py-3 disabled:opacity-40">{testing?"Sending test…":"Send test to me"}</button><span role="status" className="text-sm">{testState.message||"Configured owner mailbox only. No offer status or follow-up change."}</span></form>
    <a href="/admin/email-templates" className="justify-self-start border px-4 py-3 text-sm">Edit saved template defaults separately →</a>
  </div>;
}
