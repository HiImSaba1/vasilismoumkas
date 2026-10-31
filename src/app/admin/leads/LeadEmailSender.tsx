"use client";
import type { PortfolioEmailImage } from "@/lib/portfolio";
import { EditableEmailComposer } from "@/components/admin/EditableEmailComposer";
import type { EmailTemplate } from "@/lib/email-templates";
import { sendLeadTemplateAction } from "./actions";

export function LeadEmailSender({leadId,email,templates,values,smtpReady,initialTemplateId="001",headerImageOverride,images,offer}:{leadId:string;email:string|null;templates:EmailTemplate[];values:Record<string,string>;smtpReady:boolean;initialTemplateId?:string;headerImageOverride?:string;images?:PortfolioEmailImage[];offer?:{slug:string;status:string}|null}){
  const recipient=email?.trim()||null;
  return <>{offer&&<div className="mb-5 grid gap-3 border-2 border-blue-500 bg-blue-50 p-4 sm:grid-cols-[1fr_auto] sm:items-center"><div><p className="text-[10px] font-semibold uppercase tracking-[.14em] text-blue-900">Template 001 will send this exact offer</p><p className="mt-1 break-all text-sm text-ink-black">{offer.slug}</p><p className="mt-1 text-[10px] uppercase text-ink-black/55">Status now · {offer.status}{offer.status==="draft"?" · becomes sent after successful email delivery":""}</p></div><a href={`/offer/${offer.slug}`} target="_blank" className="bg-ink-black px-4 py-3 text-center text-[10px] uppercase text-white">Check offer →</a></div>}<EditableEmailComposer action={sendLeadTemplateAction} entityField="id" entityId={leadId} recipient={recipient} templates={templates} values={values} smtpReady={smtpReady} initialTemplateId={initialTemplateId} headerImageOverride={headerImageOverride} images={images}/></>;
}
