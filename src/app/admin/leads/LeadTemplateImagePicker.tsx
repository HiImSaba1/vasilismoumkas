"use client";
import { useActionState,useEffect,useState } from "react";
import { EmailHeaderImagePicker } from "@/components/admin/EmailHeaderImagePicker";
import type { EmailTemplate } from "@/lib/email-templates";
import type { PortfolioEmailImage } from "@/lib/portfolio";
import { updateLeadTemplateHeaderImageAction } from "./actions";

const initial:{success:boolean;message:string;headerImage?:string}={success:false,message:""};
export function LeadTemplateImagePicker({leadId,template,images,onSavedImageChange}:{leadId:string;template:EmailTemplate;images:PortfolioEmailImage[];onSavedImageChange?:(image:string)=>void}){
  const[selected,setSelected]=useState(template.headerImage??"");const[state,action,pending]=useActionState(updateLeadTemplateHeaderImageAction,initial);
  useEffect(()=>{if(state.success&&state.headerImage!==undefined)onSavedImageChange?.(state.headerImage)},[onSavedImageChange,state.headerImage,state.success]);
  return <details open className="mb-5 border border-ink-black/15 bg-white"><summary className="cursor-pointer px-4 py-3 text-[10px] font-semibold uppercase">Change Template {template.id} header image +</summary><form action={action} className="grid gap-4 border-t border-ink-black/10 p-4"><input type="hidden" name="leadId" value={leadId}/><input type="hidden" name="templateId" value={template.id}/><input type="hidden" name="headerImage" value={selected}/><EmailHeaderImagePicker value={selected} onChange={setSelected} images={images} context={`Saved for Template ${template.id} · ${template.eventType} · ${template.locale.toUpperCase()}, using the same setting as Email Templates.`}/><div className="flex flex-wrap items-center gap-3"><button disabled={pending} className="bg-ink-black px-4 py-3 text-[10px] uppercase text-soft-yellow">{pending?"Saving…":"Use image in this template"}</button>{state.message&&<p className={`text-sm  ${state.success?"text-green-800":"text-red-700"}`}>{state.message}</p>}</div></form></details>;
}
