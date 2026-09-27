"use client";
import { useActionState,useEffect,useState } from "react";
import { EmailHeaderImagePicker } from "@/components/admin/EmailHeaderImagePicker";
import type { EmailTemplate } from "@/lib/email-templates";
import type { PortfolioEmailImage } from "@/lib/portfolio";
import { getPortfolioEmailImagesAction,testSendAction,updateTemplateAction } from "./actions";

const initial={success:false,message:""};

export function TemplateEditor({template,smtpReady}:{template:EmailTemplate;smtpReady:boolean}){
  const[subject,setSubject]=useState(template.subject);
  const[bodyText,setBodyText]=useState(template.bodyText);
  const[headerImage,setHeaderImage]=useState(template.headerImage??"");
  const[isActive,setIsActive]=useState(template.isActive);
  const[images,setImages]=useState<PortfolioEmailImage[]>([]);
  const[imageError,setImageError]=useState("");
  const[saveState,saveAction,saving]=useActionState(updateTemplateAction,initial);
  const[sendState,sendAction,sending]=useActionState(testSendAction,initial);

  useEffect(()=>{let current=true;getPortfolioEmailImagesAction().then(items=>{if(current)setImages(items)}).catch(error=>{if(current)setImageError(error instanceof Error?error.message:"Unable to load portfolio images.")});return()=>{current=false}},[]);
  const scope=<><input type="hidden" name="id" value={template.id}/><input type="hidden" name="eventType" value={template.eventType}/><input type="hidden" name="locale" value={template.locale}/></>;

  return <div className="grid gap-8">
    <form action={saveAction} className="grid gap-6">
      {scope}<input type="hidden" name="headerImage" value={headerImage}/>
      <label className="grid gap-3 text-[10px] uppercase tracking-[0.14em]">Subject<input name="subject" value={subject} onChange={event=>setSubject(event.target.value)} className="border border-ink-black/20 bg-transparent px-4 py-3 text-sm normal-case tracking-normal"/></label>
      <label className="grid gap-3 text-[10px] uppercase tracking-[0.14em]">Message<textarea name="bodyText" value={bodyText} onChange={event=>setBodyText(event.target.value)} rows={18} className="border border-ink-black/20 bg-transparent px-4 py-3 text-sm leading-relaxed normal-case tracking-normal"/></label>

      <EmailHeaderImagePicker value={headerImage} onChange={setHeaderImage} images={images} imageError={imageError} context={`Saved only for Template ${template.id} · ${template.eventType} · ${template.locale.toUpperCase()}. The default remains available if the selected image is later unavailable.`}/>

      <label className="flex items-center gap-3 text-sm "><input type="checkbox" name="isActive" checked={isActive} onChange={event=>setIsActive(event.target.checked)}/>Active template</label>
      <div className="flex items-center gap-3"><button disabled={saving} className="bg-ink-black px-5 py-3 text-[10px] uppercase text-soft-white disabled:opacity-50">{saving?"Saving…":"Save template"}</button>{saveState.message&&<p className={`text-sm  ${saveState.success?"text-green-800":"text-red-700"}`}>{saveState.message}</p>}</div>
    </form>

    <form action={sendAction} className="border-t border-ink-black/15 pt-7">
      {scope}<p className="text-[10px] uppercase tracking-[0.14em]">Test delivery</p><p className="mt-2 text-sm  text-ink-black/50">Uses safe sample {template.eventType} details in {template.locale.toUpperCase()} and adds [TEST] to the subject.</p>
      <div className="mt-4 flex max-w-xl"><input required type="email" name="recipient" placeholder="your@email.com" disabled={!smtpReady} className="min-w-0 flex-1 border border-ink-black/20 bg-transparent px-4 py-3 text-sm disabled:opacity-50"/><button disabled={!smtpReady||sending} className="bg-soft-yellow px-4 py-3 text-[10px] uppercase disabled:opacity-50">{sending?"Sending…":"Send test"}</button></div>
      {sendState.message&&<p className={`mt-3 text-sm  ${sendState.success?"text-green-800":"text-red-700"}`}>{sendState.message}</p>}
    </form>
  </div>
}
