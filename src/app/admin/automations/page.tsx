/* eslint-disable react-hooks/purity */
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CollapsibleAdminCard } from "@/components/admin/CollapsibleAdminCard";
import { listAutomationJobs,type AutomationStatus } from "@/lib/automations";
import { statusClass } from "@/lib/admin-status";
import { cancelJobAction,retryJobAction } from "./actions";

const statuses=["scheduled","processing","sent","cancelled","failed"] as const;
const date=(value:string)=>new Date(value).toLocaleString("en-GB",{dateStyle:"medium",timeStyle:"short"});
const actionName=(type:string)=>type==="offer-followup"?"Send offer follow-up":type==="post-event-thank-you"?"Send post-event thank-you":type==="timeline-reminder"?"Remind couple about timeline":type.replaceAll("-"," ");

export default async function Page({searchParams}:{searchParams:Promise<{status?:string}>}){
  const requested=(await searchParams).status;
  const selected=statuses.includes(requested as AutomationStatus)?requested as AutomationStatus:undefined;
  const all=await listAutomationJobs();
  const now=Date.now();
  const visible=selected?all.filter(job=>job.status===selected):all;
  const recentFirst=<T extends {createdAt:string}>(items:T[])=>items.sort((a,b)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime());
  const groups=[
    {title:"Needs attention",tone:"blue",jobs:recentFirst(visible.filter(job=>job.status==="failed"||(job.status==="scheduled"&&new Date(job.scheduledFor).getTime()<=now)))},
    {title:"Waiting to send",tone:"orange",jobs:recentFirst(visible.filter(job=>job.status==="scheduled"&&new Date(job.scheduledFor).getTime()>now))},
    {title:"Sending now",tone:"blue",jobs:recentFirst(visible.filter(job=>job.status==="processing"))},
    {title:"Sent successfully",tone:"green",jobs:recentFirst(visible.filter(job=>job.status==="sent"))},
    {title:"Cancelled",tone:"neutral",jobs:recentFirst(visible.filter(job=>job.status==="cancelled"))},
  ] as const;
  const counts=Object.fromEntries(statuses.map(status=>[status,all.filter(job=>job.status===status).length]));
  const needsAttention=groups[0].jobs.length;
  return <main className="px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
    <AdminPageHeader eyebrow="What sends next" title="Automation Queue" description="Only Templates 002, 003, 007 and 009 are approved for automatic delivery. A preview email lists the next 24 hours before they send."/>
    <section className="mt-7 grid gap-3 sm:grid-cols-3"><Summary tone="orange" value={counts.scheduled} label="Waiting to send" copy="The system will send these at their scheduled time."/><Summary tone="blue" value={needsAttention} label="Needs attention" copy={needsAttention?"Review the blue section below.":"Nothing needs your help right now."}/><Summary tone="green" value={counts.sent} label="Sent successfully" copy="These are complete. No action is needed."/></section>
    <nav className="mt-6 flex flex-wrap gap-2"><Link href="/admin/automations" className={`border px-3 py-2 text-[10px] uppercase ${!selected?"bg-ink-black text-white":"border-ink-black/20"}`}>All · {all.length}</Link>{statuses.map(status=><Link key={status} href={`/admin/automations?status=${status}`} className={`border px-3 py-2 text-[10px] uppercase ${selected===status?"bg-ink-black text-white":"border-ink-black/20"}`}>{status} · {counts[status]}</Link>)}</nav>
    {groups.map(group=><section key={group.title} className="mt-9"><div className={`border-l-4 px-4 py-3 ${group.tone==="blue"?"border-blue-500 bg-blue-50":group.tone==="orange"?"border-orange-400 bg-orange-50":group.tone==="green"?"border-green-500 bg-green-50":"border-ink-black/25 bg-white/50"}`}><h2 className="text-xl font-light uppercase tracking-[-0.02em]">{group.title}</h2><p className="mt-1 text-sm  opacity-55">{group.jobs.length} automation{group.jobs.length===1?"":"s"}</p></div><div className="mt-3 grid gap-3">{group.jobs.map(job=><AutomationCard key={job.id} job={job} now={now}/>)}{!group.jobs.length&&<div className="border border-dashed border-ink-black/20 px-5 py-8 text-sm text-ink-black/45">Nothing in this section.</div>}</div></section>)}
  </main>;
}

function AutomationCard({job,now}:{job:Awaited<ReturnType<typeof listAutomationJobs>>[number];now:number}){const due=job.status==="scheduled"&&new Date(job.scheduledFor).getTime()<=now;const stateTitle=job.status==="failed"||due?"Needs attention":job.status==="scheduled"?"Waiting to send":job.status==="processing"?"Sending now":job.status==="sent"?"Sent successfully":"Cancelled";const instruction=job.status==="failed"?"Fix the error shown below, then press Retry once.":due?"This is due now. The automation runner will send it on its next run.":job.status==="scheduled"?`Nothing to do. It will send on ${date(job.scheduledFor)}.`:job.status==="sent"?"Done. No action is needed.":job.status==="processing"?"Sending now. Wait and refresh shortly.":"Closed. No action is needed.";return <CollapsibleAdminCard title={`Template ${job.templateId??"—"} · ${stateTitle}`} subtitle={`${job.clientName??"Unnamed client"} · ${job.clientEmail??"No client email"} · ${date(job.scheduledFor)}`} className={statusClass(due?"scheduled":job.status)} badges={<span className="border border-current/20 px-3 py-1 text-[10px] font-medium uppercase">{actionName(job.jobType)}</span>}><div className="grid gap-5 lg:grid-cols-[1fr_.8fr_auto]"><div><p className="text-sm font-medium">Next: {instruction}</p>{job.lastError&&<p className="mt-4 border-t border-red-300 pt-3 text-sm  text-red-800">Why it stopped: {job.lastError}</p>}</div><dl className="text-sm "><dt className="text-[12px]  uppercase opacity-50">Client and recipient</dt><dd>{job.clientName??"Unnamed client"} · {job.clientEmail??"No client email"}</dd><dt className="mt-3 text-[12px]  uppercase opacity-50">Scheduled for</dt><dd>{date(job.scheduledFor)}</dd></dl><div className="flex min-w-36 flex-col gap-2">{job.status==="failed"&&<form action={retryJobAction}><input type="hidden" name="id" value={job.id}/><button className="w-full bg-ink-black px-4 py-3 text-[10px] uppercase text-white">Retry once</button></form>}{["scheduled","failed"].includes(job.status)&&<form action={cancelJobAction}><input type="hidden" name="id" value={job.id}/><button className="w-full border border-red-400 px-4 py-3 text-[10px] uppercase text-red-800">Cancel this email</button></form>}</div></div></CollapsibleAdminCard>}
function Summary({tone,value,label,copy}:{tone:"green"|"orange"|"blue";value:number;label:string;copy:string}){const colors={green:"border-green-500 bg-green-50",orange:"border-orange-400 bg-orange-50",blue:"border-blue-500 bg-blue-50"};return <article className={`border-l-4 p-5 ${colors[tone]}`}><p className="text-3xl font-light">{value}</p><p className="mt-1 text-sm  font-medium uppercase">{label}</p><p className="mt-2 text-sm  opacity-60">{copy}</p></article>}
