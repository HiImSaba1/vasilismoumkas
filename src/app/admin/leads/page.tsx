import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CollapsibleAdminCard } from "@/components/admin/CollapsibleAdminCard";
import { DeleteJourneyButton } from "@/components/admin/DeleteJourneyButton";
import { listAllEmailTemplates } from "@/lib/email-templates";
import { smtpConfigured } from "@/lib/email-delivery";
import { listLeads,type Lead } from "@/lib/leads";
import { listOffers } from "@/lib/offers";
import { listLeadBookingDocuments } from "@/lib/lead-booking-documents";
import { listNativeLeadDocuments } from "@/lib/lead-native-documents";
import { listClientPortals } from "@/lib/client-portals";
import { listDocumentTemplates } from "@/lib/document-templates";
import { statusClass } from "@/lib/admin-status";
import { personalizedLeadTemplates } from "@/lib/lead-email-template-scope";
import { listPortfolioEmailImages } from "@/lib/portfolio";
import { LeadCreateForm } from "./LeadCreateForm";
import { LeadWorkflowWizard } from "./LeadWorkflowWizard";
import { NativeDocumentManager } from "./NativeDocumentManager";
import { completeLeadEventAction,deleteLeadAction,updateLeadStatusAction } from "./actions";

const leadTitle:Record<Lead["status"],string>={new:"Just came in — take a look", "awaiting-information":"Waiting on a few details",qualified:"Looks good — ready for an offer","offer-draft":"Offer is being put together","offer-sent":"Offer is out — waiting for them","follow-up":"Time to follow up",accepted:"They said yes",lost:"Not moving forward",converted:"Booked — client workspace ready",completed:"All wrapped up"};
const leadMonthKey=(lead:Lead)=>lead.updatedAt.slice(0,7);
const leadMonthLabel=(key:string)=>new Date(`${key}-01T12:00:00`).toLocaleDateString("en-GB",{month:"long",year:"numeric"});
export default async function LeadsPage({searchParams}:{searchParams:Promise<{workflowLead?:string;workflowStep?:string}>}){
  const requested=await searchParams;const workflowLead=requested.workflowLead??"";const workflowStep=Math.min(5,Math.max(0,Number(requested.workflowStep??2)||2));
  const[leads,templates,offers,documents,nativeDocuments,portals,documentTemplates,emailImages]=await Promise.all([listLeads(),listAllEmailTemplates(),listOffers(),listLeadBookingDocuments(),listNativeLeadDocuments(),listClientPortals(),listDocumentTemplates(),listPortfolioEmailImages()]);
  const smtpReady=smtpConfigured();
  const sorted=[...leads].sort((a,b)=>new Date(b.updatedAt).getTime()-new Date(a.updatedAt).getTime());
  const offerFor=(lead:Lead)=>offers.find(item=>item.leadId===lead.id)??null;
  const expired=sorted.filter(lead=>offerFor(lead)?.status==="expired");
  const current=sorted.filter(lead=>offerFor(lead)?.status!=="expired");
  const monthly=[...current.reduce((groups,lead)=>{const key=leadMonthKey(lead);groups.set(key,[...(groups.get(key)??[]),lead]);return groups},new Map<string,Lead[]>())];
  const renderLead=(lead:Lead)=>{
    const offer=offerFor(lead);
    const booking=documents.find(item=>item.leadId===lead.id)??null;
    const portal=portals.find(item=>item.leadId===lead.id)??null;
    const leadDocuments=nativeDocuments.filter(item=>item.leadId===lead.id);
    const leadTemplates=personalizedLeadTemplates(templates,lead,offer,portal);
    const missing=[!lead.email&&"email",!lead.eventDate&&"date",!lead.ceremonyLocation&&"ceremony",!lead.receptionLocation&&"reception"].filter(Boolean);
    return <CollapsibleAdminCard key={lead.id} workspaceHref={`/admin/leads/${lead.id}`} defaultOpen={workflowLead===lead.id} title={lead.coupleNames} subtitle={`${leadTitle[lead.status]} · ${lead.email??"No email"} · ${lead.eventDate??"Date not provided"}`} className={statusClass(lead.status)} badges={<><span className="bg-ink-black px-3.5 py-1.5 text-sm  font-medium uppercase text-soft-white">{lead.status.replaceAll("-"," ")}</span><span className="border border-current/20 px-3 py-1.5 text-[11px] font-medium uppercase">{lead.eventType}</span>{offer&&<span className="bg-soft-yellow px-3 py-1.5 text-[11px] font-medium uppercase text-ink-black">Offer · {offer.status}</span>}</>}>
      <div className="grid gap-5 xl:grid-cols-[1.1fr_.8fr_1fr]"><div><p className="text-sm">{lead.email??"No email"}</p><p className="text-sm opacity-55">{lead.phone??"No phone"}</p>{lead.notes&&<p className="mt-4 border-t border-current/10 pt-4 text-sm  opacity-60">{lead.notes}</p>}</div><div className="text-sm  leading-relaxed"><p>{lead.eventDate??"Date not provided"}</p><p className="opacity-60">{lead.ceremonyLocation??"Ceremony pending"}</p><p className="opacity-60">{lead.receptionLocation??"Reception pending"}</p>{missing.length>0&&<p className="mt-3 text-amber-800">Missing: {missing.join(", ")}</p>}</div><div className="flex flex-col gap-2"><LeadWorkflowWizard lead={lead} offer={offer} documents={booking} nativeDocuments={leadDocuments} templates={leadTemplates} emailImages={emailImages} smtpReady={smtpReady} initialOpen={workflowLead===lead.id} initialStep={workflowStep}/><Link href={`/admin/leads/${lead.id}#workflow`} className="border border-ink-black/20 px-4 py-3 text-center text-[10px] uppercase">Open exact workflow</Link>{lead.status!=="completed"&&<form action={completeLeadEventAction}><input type="hidden" name="id" value={lead.id}/><button className="w-full border border-green-500 px-4 py-3 text-[10px] uppercase text-green-800">{lead.eventType==="baptism"?"Baptism completed":"Wedding completed"}</button></form>}{lead.status!=="lost"&&lead.status!=="completed"&&<form action={updateLeadStatusAction}><input type="hidden" name="id" value={lead.id}/><input type="hidden" name="status" value="lost"/><button className="w-full border border-red-400 px-4 py-3 text-[10px] uppercase text-red-800">Mark lead lost</button></form>}<DeleteJourneyButton id={lead.id} name={lead.coupleNames} action={deleteLeadAction} label="Delete lead"/></div></div>
      {booking&&<div className="mt-4 grid gap-2 border-t border-current/10 pt-4 text-[10px] uppercase sm:grid-cols-3"><p>Contract · {booking.contractStatus}</p><p>Questionnaire · {booking.questionnaireStatus}</p><p>Invoice · {booking.invoiceStatus}</p></div>}
      {portal&&<div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]"><a href={`/portal/${portal.slug}`} target="_blank" className="block break-all bg-soft-yellow p-4 text-sm  uppercase text-ink-black">Open private client portal → /portal/{portal.slug}</a><a href={`/portal/${portal.slug}?tab=invoice`} target="_blank" className="border border-ink-black/20 px-5 py-4 text-center text-sm  uppercase">Open invoice →</a></div>}
      <NativeDocumentManager leadId={lead.id} documents={leadDocuments} templates={documentTemplates} lead={lead}/>
    </CollapsibleAdminCard>;
  };
  return <main className="px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
    <AdminPageHeader eyebrow="Inquiries / guided pipeline" title="Leads" description="Lead cards stay compact until opened. Names, stage, event type and offer state always remain visible."/>
    <details className="mt-5 border border-ink-black/20 bg-soft-yellow"><summary className="cursor-pointer px-4 py-3 text-sm  uppercase tracking-[0.16em]">01 · Create a new lead</summary><div className="border-t border-ink-black/15"><LeadCreateForm/></div></details>
    <div className="mt-5 flex justify-between"><p className="text-sm  uppercase tracking-[0.16em]">Pipeline · {leads.length} records</p><p className={`text-[10px] uppercase ${smtpReady?"text-green-800":"text-amber-800"}`}>SMTP · {smtpReady?"Ready":"Disabled"}</p></div>
    <section className="mt-3 grid gap-4" data-monthly-lead-groups>
      {monthly.map(([month,records],index)=><details key={month} open={index===0||records.some(lead=>lead.id===workflowLead)} className="group/month border border-ink-black/15 bg-[#f7f3e9]"><summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-2 transition-colors hover:bg-ink-black hover:text-white"><div><p className="text-[8px] uppercase leading-none tracking-[.15em] opacity-55">Active leads · newest first</p><span className="mt-0.5 block text-2xl font-light uppercase leading-none">{leadMonthLabel(month)}</span></div><div className="flex items-center gap-3"><span className="text-[10px] uppercase">{records.length} records</span><span className="text-lg transition-transform group-open/month:rotate-45">+</span></div></summary><div className="grid gap-3 border-t border-ink-black/10 p-3">{records.map(renderLead)}</div></details>)}
      {expired.length>0&&<details className="group/expired border border-red-200 bg-red-50"><summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-2 transition-colors hover:bg-red-900 hover:text-white"><div><p className="text-[8px] uppercase leading-none tracking-[.15em] opacity-60">Outside the offer validity window · newest first</p><span className="mt-0.5 block text-2xl font-light uppercase leading-none">Expired offers / leads</span></div><div className="flex items-center gap-3"><span className="text-[10px] uppercase">{expired.length} records</span><span className="text-lg transition-transform group-open/expired:rotate-45">+</span></div></summary><div className="grid gap-3 border-t border-red-200 p-3">{expired.map(renderLead)}</div></details>}
      {!leads.length&&<div className="border border-dashed border-ink-black/25 py-16 text-center"><p className="text-sm text-ink-black/50">Create the first lead above to begin the guided workflow.</p></div>}
    </section>
  </main>;
}
