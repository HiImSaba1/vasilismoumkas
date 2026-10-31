"use client";
import { useRef } from "react";
import type { EmailComposition } from "@/lib/email-composition";
import type {PortfolioEmailImage} from "@/lib/portfolio";
import {EmailSectionBuilder} from "./EmailSectionBuilder";

export function EmailCompositionFields({value,onChange,disabled=false,images=[]}:{value:EmailComposition;onChange:(value:EmailComposition)=>void;disabled?:boolean;images?:PortfolioEmailImage[]}) {
  const introduction=useRef<HTMLTextAreaElement>(null);
  const field=(label:string,current:string,update:(next:string)=>void,multiline=false)=><label className="grid gap-2 text-sm">{label}{multiline?<textarea disabled={disabled} rows={5} maxLength={12000} value={current} onChange={event=>update(event.target.value)} className="w-full border border-ink-black/20 bg-white p-3"/>:<input disabled={disabled} maxLength={1500} value={current} onChange={event=>update(event.target.value)} className="w-full border border-ink-black/20 bg-white p-3"/>}</label>;
  const set=<K extends keyof EmailComposition>(key:K,next:EmailComposition[K])=>onChange({...value,[key]:next});
  function link(){const area=introduction.current;if(!area)return;const start=area.selectionStart,end=area.selectionEnd;if(start===end){window.alert("Select the phrase in the introduction first.");return}const url=window.prompt("Link URL (https://…)");if(!url)return;try{const parsed=new URL(url);if(!["https:","http:"].includes(parsed.protocol))throw new Error();set("introduction",`${value.introduction.slice(0,start)}[${value.introduction.slice(start,end)}](${url})${value.introduction.slice(end)}`)}catch{window.alert("Enter a complete http(s) URL.")}}
  return <fieldset disabled={disabled} className="grid min-w-0 gap-4">
    {field("Email title",value.title,next=>set("title",next))}
    <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={value.showHeaderImage} onChange={event=>set("showHeaderImage",event.target.checked)}/>Show main photo (turn off for a short follow-up)</label>
    {field("Personal salutation (separate from job name)",value.greeting,next=>set("greeting",next))}
    <label className="grid gap-2 text-sm">Personal introduction<textarea ref={introduction} rows={10} maxLength={12000} value={value.introduction} onChange={event=>set("introduction",event.target.value)} className="w-full border border-ink-black/20 bg-white p-3"/></label>
    <button type="button" onClick={link} className="justify-self-start border border-ink-black/30 px-4 py-2 text-sm">Add link to selected phrase</button>
    <p className="text-sm text-ink-black/60">Formatting: blank line = paragraph · **bold** · ## Heading · - list item. Links appear as their label in the email.</p>
    <EmailSectionBuilder sections={value.sections} onChange={sections=>set("sections",sections)} images={images} disabled={disabled}/>
    {field("Main button label",value.buttonLabel,next=>set("buttonLabel",next))}
    <label className="grid gap-2 text-sm">Main button destination<select value={value.destination} onChange={event=>set("destination",event.target.value as EmailComposition["destination"])} className="border border-ink-black/20 bg-white p-3"><option value="offer">Connected offer (automatic)</option><option value="portal">Connected client portal (automatic)</option><option value="none">No main button</option></select></label>
    {field("Photo description / alt",value.imageAlt,next=>set("imageAlt",next))}
    <label className="flex gap-3 text-sm"><input type="checkbox" checked={value.gallery.enabled} onChange={event=>set("gallery",{...value.gallery,enabled:event.target.checked})}/>Include photographic gallery</label>
    {value.gallery.enabled&&<div className="grid gap-3 border border-ink-black/15 p-4">{field("Gallery title",value.gallery.title,next=>set("gallery",{...value.gallery,title:next}))}{field("Gallery text",value.gallery.text,next=>set("gallery",{...value.gallery,text:next}),true)}{field("Gallery link label",value.gallery.label,next=>set("gallery",{...value.gallery,label:next}))}{field("Gallery URL",value.gallery.url,next=>set("gallery",{...value.gallery,url:next}))}</div>}
    <label className="flex gap-3 text-sm"><input type="checkbox" checked={value.video.enabled} onChange={event=>set("video",{...value.video,enabled:event.target.checked})}/>Include video services</label>
    {value.video.enabled&&<div className="grid gap-3 border border-ink-black/15 p-4">{field("Video title",value.video.title,next=>set("video",{...value.video,title:next}))}{field("Video text",value.video.text,next=>set("video",{...value.video,text:next}),true)}{field("Services link label",value.video.servicesLabel,next=>set("video",{...value.video,servicesLabel:next}))}{field("Services URL",value.video.servicesUrl,next=>set("video",{...value.video,servicesUrl:next}))}{field("Samples link label",value.video.samplesLabel,next=>set("video",{...value.video,samplesLabel:next}))}{field("Samples URL",value.video.samplesUrl,next=>set("video",{...value.video,samplesUrl:next}))}{field("Video disclaimer",value.video.disclaimer,next=>set("video",{...value.video,disclaimer:next}),true)}</div>}
    {field("Closing",value.closing,next=>set("closing",next),true)}
    <p className="text-sm text-ink-black/60">Saved signature: Vasilis Moumkas · Fine Art Photographer · telephone, email, website and social links. Photos retain their natural proportions.</p>
  </fieldset>;
}
