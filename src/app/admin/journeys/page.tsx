import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CollapsibleAdminCard } from "@/components/admin/CollapsibleAdminCard";
import { listJourneyDashboardItems, type JourneyDashboardItem, type JourneyGroup } from "@/lib/journey-dashboard";

const groups:{key:JourneyGroup;title:string;copy:string;color:string;empty:string}[]=[
  {key:"do-now",title:"Do now",copy:"Required actions that are ready for the administrator.",color:"border-red-600 bg-red-50",empty:"No required action needs attention."},
  {key:"do-next",title:"Do next",copy:"Conditional follow-ups and the next useful actions.",color:"border-orange-500 bg-orange-50",empty:"No conditional action is waiting."},
  {key:"waiting",title:"Waiting for client",copy:"The studio has completed its action and is waiting for the couple.",color:"border-blue-600 bg-blue-50",empty:"No journey is waiting for a client response."},
  {key:"completed",title:"Completed",copy:"Every required step in these journeys is finished.",color:"border-green-700 bg-green-50",empty:"No journey is fully completed yet."},
];

function JourneyCard({item,color}:{item:JourneyDashboardItem;color:string}){
  const workspace=item.clientId?`/admin/clients/${item.clientId}#workflow`:`/admin/leads/${item.leadId}`;
  return <CollapsibleAdminCard title={item.coupleNames} subtitle={`${item.email??"No email"} · ${item.eventDate??"Date pending"}`} className={color} badges={<><span className="border border-current/20 px-2 py-1 text-[12px]  uppercase">{item.eventType}</span><span className="border border-current/20 px-2 py-1 text-[12px]  uppercase">{item.completedCount}/{item.totalCount} <span>steps</span></span>{item.currentStep&&<span className="bg-white/70 px-2 py-1 text-[12px]  uppercase"><span>Step</span> {item.currentStep.number}</span>}</>}>
    <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
      <div><p className="text-[12px]  uppercase tracking-[.16em] opacity-50">What happens next</p><p className="mt-2 text-lg font-medium uppercase">{item.instruction}</p><p className="mt-2 text-sm  opacity-60">{item.group==="waiting"?"No action is required until the couple responds.":item.group==="completed"?"This record remains available for history and reference.":"Use the primary button to continue the correct workflow step."}</p></div>
      <div className="flex min-w-48 flex-col gap-2"><Link href={item.actionHref} target={item.actionHref.startsWith("/portal/")?"_blank":undefined} className="bg-ink-black px-4 py-3 text-center text-[10px] uppercase text-white">{item.actionLabel} →</Link>{item.actionHref!==workspace&&<Link href={workspace} className="border border-current/20 px-4 py-3 text-center text-[10px] uppercase">Open full journey</Link>}</div>
    </div>
  </CollapsibleAdminCard>
}

export default async function JourneyDashboardPage({searchParams}:{searchParams:Promise<{event?:string}>}){
  const event=(await searchParams).event;
  const all=await listJourneyDashboardItems();
  const items=event==="wedding"||event==="baptism"?all.filter(item=>item.eventType===event):all;
  const counts=Object.fromEntries(groups.map(group=>[group.key,items.filter(item=>item.group===group.key).length]));
  return <main className="px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
    <AdminPageHeader eyebrow="Daily client operations" title="Journey Dashboard" description="Start here every day. Every lead or client appears once, under the exact action state that needs attention."/>
    <nav className="mt-7 flex flex-wrap gap-2"><Link href="/admin/journeys" className={`border px-4 py-3 text-[10px] uppercase ${!event?"bg-ink-black text-white":"border-ink-black/20"}`}><span>All journeys</span> · {all.length}</Link><Link href="/admin/journeys?event=wedding" className={`border px-4 py-3 text-[10px] uppercase ${event==="wedding"?"bg-ink-black text-white":"border-ink-black/20"}`}>Weddings</Link><Link href="/admin/journeys?event=baptism" className={`border px-4 py-3 text-[10px] uppercase ${event==="baptism"?"bg-ink-black text-white":"border-ink-black/20"}`}>Baptisms</Link></nav>
    <section className="mt-7 grid grid-cols-2 border-l border-t border-ink-black/20 xl:grid-cols-4">{groups.map(group=><a key={group.key} href={`#${group.key}`} className="border-b border-r border-ink-black/20 bg-[#f7f3e9] p-5 transition-colors hover:bg-ink-black hover:text-white"><p className="text-[10px] uppercase tracking-[.16em] opacity-55">{group.title}</p><p className="mt-4 text-5xl font-light">{counts[group.key]}</p></a>)}</section>
    <div className="mt-10 grid gap-12">{groups.map(group=>{const groupItems=items.filter(item=>item.group===group.key);return <section id={group.key} key={group.key} className="scroll-mt-6"><div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-ink-black/20 pb-4"><div><h2 className="text-3xl font-light uppercase sm:text-4xl">{group.title}</h2><p className="mt-2 text-sm  text-ink-black/55">{group.copy}</p></div><span className="text-sm">{groupItems.length}</span></div><div className="grid gap-3">{groupItems.map(item=><JourneyCard key={item.leadId} item={item} color={group.color}/>)}{!groupItems.length&&<div className="border border-dashed border-ink-black/20 px-5 py-10 text-center text-sm text-ink-black/50">{group.empty}</div>}</div></section>})}</div>
  </main>
}
