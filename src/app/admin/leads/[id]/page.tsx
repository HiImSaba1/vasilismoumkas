import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClientWorkflowSection } from "@/components/admin/ClientWorkflowSection";
import { EmailHistory } from "@/components/admin/EmailHistory";
import { listClientPortals } from "@/lib/client-portals";
import { getClientWorkflow } from "@/lib/client-workflow";
import { listLeadEmailDeliveries,smtpConfigured } from "@/lib/email-delivery";
import { listAllEmailTemplates } from "@/lib/email-templates";
import { listLeadBookingDocuments } from "@/lib/lead-booking-documents";
import { personalizedLeadTemplates } from "@/lib/lead-email-template-scope";
import { listNativeLeadDocuments } from "@/lib/lead-native-documents";
import { getLead,getLeadActivity } from "@/lib/leads";
import { getLatestOfferForLead } from "@/lib/offers";
import { listPortfolioEmailImages } from "@/lib/portfolio";
import { LeadWorkflowWizard } from "../LeadWorkflowWizard";
import { updateLeadDetailsAction } from "./actions";

export default async function LeadPage({params}:{params:Promise<{id:string}>}){
  const{id}=await params;
  const[lead,activity,deliveries,offer,allTemplates,bookingRecords,nativeRecords,portals,workflow,emailImages]=await Promise.all([getLead(id),getLeadActivity(id),listLeadEmailDeliveries(id),getLatestOfferForLead(id),listAllEmailTemplates(),listLeadBookingDocuments(),listNativeLeadDocuments(),listClientPortals(),getClientWorkflow(id),listPortfolioEmailImages()]);
  if(!lead)notFound();
  const offerQuery=new URLSearchParams({lead:lead.id,names:lead.coupleNames,email:lead.email??"",date:lead.eventDate??"",location:lead.receptionLocation??lead.ceremonyLocation??"",type:lead.eventType,lang:lead.workflowLocale==="el"?"gr":"en"});
  const booking=bookingRecords.find(item=>item.leadId===lead.id)??null;
  const nativeDocuments=nativeRecords.filter(item=>item.leadId===lead.id);
  const portal=portals.find(item=>item.leadId===lead.id)??null;
  const templates=personalizedLeadTemplates(allTemplates,lead,offer,portal);
  const nextKey=workflow?.currentStep?.key??"001";
  const initialTemplateId=templates.some(item=>item.id===nextKey)?nextKey:"001";
  const initialWizardStep=!lead.workflowLocale?1:nextKey==="000"?0:nextKey==="001"?2:["005","006","007"].includes(nextKey)?4:nextKey==="job-accepted"?5:3;
  const guidedWizard=<LeadWorkflowWizard lead={lead} offer={offer} documents={booking} nativeDocuments={nativeDocuments} templates={templates} emailImages={emailImages} smtpReady={smtpConfigured()} initialStep={initialWizardStep} initialTemplateId={initialTemplateId} triggerLabel="Open 6-step guided wizard →" triggerClassName="border-2 border-ink-black bg-soft-yellow px-5 py-4 text-center text-sm  font-semibold uppercase text-ink-black transition-colors hover:bg-ink-black hover:text-soft-yellow"/>;
  return <main className="admin-record-workspace px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
    <header className="border-b border-ink-black/20 pb-6"><div className="flex flex-wrap items-center justify-between gap-3"><Link href="/admin/leads" className="text-[10px] uppercase tracking-[.14em] text-ink-black/55">← All leads</Link><span className="bg-pink-100 px-3 py-1.5 text-[10px] font-semibold uppercase text-pink-900">Lead · {lead.status.replaceAll("-"," ")}</span></div><div className="mt-5 flex flex-wrap items-end justify-between gap-5"><div><p className="text-[10px] uppercase tracking-[.18em] text-ink-black/45">Lead workspace</p><h1 className="mt-2 break-words text-[clamp(2.25rem,5vw,4.75rem)] font-light uppercase leading-[.92] tracking-[-.045em]">{lead.coupleNames}</h1><p className="mt-4 text-sm text-ink-black/55">{lead.eventType} · {lead.eventDate??"Date pending"} · {lead.receptionLocation??lead.ceremonyLocation??"Location pending"}</p></div><div className="flex flex-wrap gap-2">{guidedWizard}{!offer&&<Link href={`/admin/dashboard?${offerQuery}`} className="bg-ink-black px-5 py-4 text-center text-sm  font-semibold uppercase text-soft-yellow transition-colors hover:bg-soft-yellow hover:text-ink-black">Create prefilled offer →</Link>}</div></div></header>
    <div className="mt-6 grid items-start gap-5 xl:grid-cols-[minmax(0,3fr)_minmax(20rem,2fr)]">
      <ClientWorkflowSection leadId={lead.id}/>
      <aside className="grid gap-4 xl:sticky xl:top-6">
        <section className="border border-ink-black/20 bg-[#f7f3e9] p-5"><div><p className="text-[10px] uppercase tracking-[.16em] text-ink-black/45">Lead at a glance</p><h2 className="mt-2 text-2xl font-light uppercase">Contact & event</h2></div><dl className="mt-5 grid gap-3 text-sm"><Row label="Email" value={lead.email??"No email"}/><Row label="Phone" value={lead.phone??"No phone"}/><Row label="Main shoot" value={lead.eventDate??"Date pending"}/><Row label="Source" value={lead.source??"Direct"}/><Row label="Workflow" value={`${lead.eventType} · ${lead.workflowLocale?.toUpperCase()??"Language pending"}`}/></dl></section>
        {offer&&<section className={`border-l-4 p-5 ${offer.status==="accepted"?"border-green-600 bg-green-50":"border-blue-500 bg-blue-50"}`}><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[.16em]">Connected offer · {offer.status}</p><h2 className="mt-1 font-light uppercase">{offer.status==="accepted"?"Offer accepted ✓":"Offer already created"}</h2><p className="mt-2 text-sm  opacity-60">The original proposal remains connected to this lead and its delivery history.</p></div><span className="bg-white/70 px-2 py-1 text-[12px]  uppercase">{offer.language}</span></div><div className="mt-4 flex flex-wrap gap-2"><Link target="_blank" href={`/offer/${offer.slug}`} className="bg-ink-black px-4 py-3 text-[10px] uppercase text-white">{offer.status==="accepted"?"View accepted offer":"View offer"}</Link>{offer.status!=="accepted"&&<Link href="/admin/offers" className="border border-ink-black/25 px-4 py-3 text-[10px] font-semibold uppercase">Revise offer →</Link>}</div></section>}
        <details className="group border border-ink-black/20 bg-white" open><summary className="flex cursor-pointer list-none items-center justify-between p-5"><div><p className="text-[12px]  uppercase tracking-[.16em] opacity-45">Keep the record current</p><h2 className="mt-1 text-xl font-light uppercase">Edit lead details</h2></div><span className="text-xl transition-transform group-open:rotate-45">+</span></summary><form action={updateLeadDetailsAction} className="grid gap-4 border-t border-ink-black/10 bg-[#f7f3e9] p-5 sm:grid-cols-2"><input type="hidden" name="id" value={lead.id}/><Field label="Couple / family names" name="coupleNames" value={lead.coupleNames}/><Field label="Email" name="email" value={lead.email??""} type="email"/><Field label="Phone" name="phone" value={lead.phone??""}/><Field label="Event date" name="eventDate" value={lead.eventDate??""} type="date"/><Field label="Ceremony location" name="ceremonyLocation" value={lead.ceremonyLocation??""}/><Field label="Reception location" name="receptionLocation" value={lead.receptionLocation??""}/><Field label="Guest count" name="guestCount" value={lead.guestCount?String(lead.guestCount):""} type="number"/><Field label="Source" name="source" value={lead.source??""}/><label className="grid gap-1 text-[12px]  uppercase tracking-[.14em] text-ink-black/50 sm:col-span-2">Internal notes<textarea name="notes" defaultValue={lead.notes??""} rows={5} className="border border-ink-black/20 bg-white p-3 text-sm normal-case tracking-normal text-ink-black"/></label><button className="bg-ink-black px-5 py-3 text-sm  uppercase text-white sm:col-span-2">Save lead details</button></form></details>
        <RecordSection title="Activity" count={activity.length}>{activity.map(item=><div key={item.id} className="border-t border-ink-black/10 py-3 first:border-0"><p className="text-sm">{item.summary}</p><p className="mt-1 text-[12px]  uppercase text-ink-black/40">{item.eventType} · {new Date(item.createdAt).toLocaleString("en-GB")}</p></div>)}{!activity.length&&<p className="text-sm text-ink-black/40">No activity yet.</p>}</RecordSection>
        <RecordSection title="Sent mail" count={deliveries.length}><EmailHistory deliveries={deliveries}/></RecordSection>
      </aside>
    </div>
  </main>;
}
function RecordSection({title,count,children}:{title:string;count:number;children:ReactNode}){return <details className="group border border-ink-black/20 bg-white"><summary className="flex cursor-pointer list-none items-center justify-between p-5"><h2 className="text-xl font-light uppercase">{title} · {count}</h2><span className="text-xl transition-transform group-open:rotate-45">+</span></summary><div className="border-t border-ink-black/10 p-5">{children}</div></details>}
function Row({label,value}:{label:string;value:string}){return <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-3 border-t border-ink-black/10 pt-3 first:border-0 first:pt-0"><dt className="text-[12px]  uppercase text-ink-black/45">{label}</dt><dd className="break-words">{value}</dd></div>}
function Field({label,name,value,type="text"}:{label:string;name:string;value:string;type?:string}){return <label className="grid min-w-0 gap-1 text-[12px]  uppercase tracking-[.14em] text-ink-black/50">{label}<input name={name} defaultValue={value} type={type} className="min-w-0 border border-ink-black/20 bg-white px-3 py-3 text-sm normal-case tracking-normal text-ink-black"/></label>}
