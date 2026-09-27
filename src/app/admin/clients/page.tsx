import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CollapsibleAdminCard } from "@/components/admin/CollapsibleAdminCard";
import { DeleteJourneyButton } from "@/components/admin/DeleteJourneyButton";
import { statusClass } from "@/lib/admin-status";
import { listClients } from "@/lib/clients";
import { getClientWorkflow } from "@/lib/client-workflow";
import { deleteClientAction } from "./actions";

const monthKey=(value:string)=>value.slice(0,7);
const monthLabel=(key:string)=>new Date(`${key}-01T12:00:00`).toLocaleDateString("en-GB",{month:"long",year:"numeric"});

export default async function ClientsPage(){
  const clients=[...(await listClients())].sort((a,b)=>new Date(b.updatedAt).getTime()-new Date(a.updatedAt).getTime());
  const workflows=new Map(await Promise.all(clients.filter(client=>client.leadId).map(async client=>[client.id,await getClientWorkflow(client.leadId!)] as const)));
  const monthly=[...clients.reduce((groups,client)=>{const key=monthKey(client.updatedAt);groups.set(key,[...(groups.get(key)??[]),client]);return groups},new Map<string,typeof clients>())];
  const renderClient=(client:(typeof clients)[number])=>{const workflow=workflows.get(client.id);const complete=Boolean(workflow?.isComplete);return <CollapsibleAdminCard key={client.id} workspaceHref={`/admin/clients/${client.id}`} title={client.coupleNames} subtitle={`${client.email??"No email"} · ${client.eventDate??"Date pending"}`} className={complete?"border-green-700 bg-green-50":statusClass(client.bookingStatus??client.journeyStage)} badges={<><span className="border border-current/20 px-2 py-1 text-[12px]  uppercase">{client.journeyStage}</span><span className="border border-current/20 px-2 py-1 text-[12px]  uppercase">{client.bookingStatus??"pending"}</span>{workflow&&<span className={`px-2 py-1 text-[12px]  uppercase ${complete?"bg-green-700 text-white":"bg-white/70"}`}>{complete?"Completed ✓":`${workflow.completedCount}/${workflow.totalCount} steps`}</span>}</>}><div className="grid gap-5 md:grid-cols-[1fr_.8fr_auto]"><div><p className="text-[12px]  uppercase opacity-45">Workflow</p><p className="mt-2 text-sm">{complete?"Every required step is complete.":"Open the client workspace to continue the next orange step."}</p></div><div className="text-sm  leading-relaxed"><p>{client.eventDate??"Date pending"}</p><p>{client.ceremonyLocation??"Ceremony pending"}</p><p>Questionnaire · {client.questionnaireStatus??"not sent"}</p></div><div className="flex min-w-40 flex-col gap-2"><Link href={`/admin/clients/${client.id}#workflow`} className="bg-ink-black px-4 py-3 text-center text-[10px] uppercase text-white">Open workflow →</Link><DeleteJourneyButton id={client.id} name={client.coupleNames} action={deleteClientAction} label="Delete client"/></div></div></CollapsibleAdminCard>};
  return <main className="px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
    <AdminPageHeader eyebrow="Accepted couples / workspace" title="Clients" description="Click a client card to open the complete job workspace. Current workflow progress remains visible here."/>
    <p className="mt-5 text-sm  uppercase tracking-[.16em]">Client workspace · {clients.length}</p>
    <section className="mt-3 grid gap-4" data-monthly-client-groups>{monthly.map(([month,records],index)=><details key={month} open={index===0} className="group/month border border-ink-black/15 bg-[#f7f3e9]"><summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-2 transition-colors hover:bg-ink-black hover:text-white"><div><p className="text-[8px] uppercase leading-none tracking-[.15em] opacity-55">Clients · recently updated first</p><span className="mt-0.5 block text-2xl font-light uppercase leading-none">{monthLabel(month)}</span></div><div className="flex items-center gap-3"><span className="text-[10px] uppercase">{records.length} records</span><span className="text-lg transition-transform group-open/month:rotate-45">+</span></div></summary><div className="grid gap-3 border-t border-ink-black/10 p-3">{records.map(renderClient)}</div></details>)}{!clients.length&&<div className="border border-dashed border-ink-black/25 py-16 text-center text-sm">No clients yet. Accepting an offer creates the first client.</div>}</section>
  </main>;
}
