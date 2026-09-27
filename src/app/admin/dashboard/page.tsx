"use client";
import { Suspense,useState } from "react";
import { ArrowRight,Baby,CalendarDays,Heart } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { AdminHelp } from "@/components/admin/AdminHelp";
import BaptismAdminDashboard from "./BaptismDashboard";
import TimelineDashboard from "./TimelineDashboard";
import WeddingAdminDashboard from "./WeddingDashboard";
type View="wedding"|"baptism"|"timeline";
function Builder(){
  const searchParams=useSearchParams();
  const requested=searchParams.get("type");
  const valid=requested==="wedding"||requested==="baptism"||requested==="timeline";
  const[view,setView]=useState<View|null>(valid?requested:null);
  const requestedLang:"gr"|"en"=searchParams.get("lang")==="gr"?"gr":"en";
  const initialLead=searchParams.get("lead")?{id:searchParams.get("lead")!,names:searchParams.get("names")??"",email:searchParams.get("email")??"",date:searchParams.get("date")??"",location:searchParams.get("location")??"",lang:requestedLang}:undefined;
  const choose=(next:View)=>{setView(next);const url=new URL(window.location.href);url.searchParams.set("type",next);window.history.replaceState({},"",url)};
  const back=()=>{setView(null);const url=new URL(window.location.href);url.searchParams.delete("type");url.searchParams.delete("timeline");window.history.replaceState({},"",url)};
  if(view==="wedding")return <WeddingAdminDashboard onBack={back} initialLead={initialLead}/>;
  if(view==="baptism")return <BaptismAdminDashboard onBack={back} initialLead={initialLead}/>;
  if(view==="timeline")return <TimelineDashboard onBack={back} editSlug={searchParams.get("timeline")??undefined}/>;
  return <Selection choose={choose}/>;
}
function Selection({choose}:{choose:(view:View)=>void}){return <main className="px-5 py-10 sm:px-8 lg:px-10 lg:py-14"><p className="text-[10px] uppercase tracking-[0.2em] text-ink-black/45">Guided proposal builder · Step 01</p><h1 className="mt-3 max-w-4xl text-[clamp(3.5rem,7vw,7rem)] font-light uppercase leading-[.88] tracking-[-0.055em]">What are you creating?</h1><p className="mt-5 max-w-2xl text-sm leading-relaxed text-ink-black/55">Choose the event first. The admin loads the correct collections and logistics fields for that proposal.</p><section className="mt-10 grid gap-4 lg:grid-cols-2"><PathCard icon={Heart} title="Wedding offer" eyebrow="Three collections" copy="Essential, Most Popular and Full Wedding Experience, followed by couple, date, location and planner details." action={()=>choose("wedding")} help="Use this only for wedding photography proposals. When opened from a lead, known couple information is carried into the logistics step."/><PathCard icon={Baby} title="Baptism offer" eyebrow="Two collections" copy="Essential and Signature baptism coverage, followed by child/family, date, church/location and planner details." action={()=>choose("baptism")} help="Use this for christening or baptism inquiries. Its pricing and deliverables stay separate from wedding collections."/></section><section className="mt-8 border-t border-ink-black/20 pt-6"><button onClick={()=>choose("timeline")} className="flex w-full items-center justify-between border border-ink-black/20 bg-[#f7f3e9] p-5 text-left"><span className="flex items-center gap-4"><CalendarDays className="size-5"/><span><span className="block text-[10px] uppercase tracking-[0.16em] text-ink-black/45">Separate client tool</span><span className="mt-1 block text-xl uppercase">Create wedding timeline</span></span></span><ArrowRight className="size-5"/></button></section></main>}
function PathCard({icon:Icon,title,eyebrow,copy,action,help}:{icon:typeof Heart;title:string;eyebrow:string;copy:string;action:()=>void;help:string}){return <article className="group flex min-h-72 flex-col border border-ink-black/20 bg-[#f7f3e9] p-6 transition-colors hover:border-ink-black"><div className="flex justify-between"><Icon className="size-6"/><AdminHelp label={`Help choosing ${title}`}>{help}</AdminHelp></div><div className="mt-auto pt-16"><p className="text-[10px] uppercase tracking-[0.16em] opacity-50">{eyebrow}</p><h2 className="mt-2 text-4xl font-light uppercase tracking-[-0.04em]">{title}</h2><p className="mt-3 max-w-md text-sm leading-relaxed text-ink-black/60">{copy}</p><button type="button" onClick={action} className="mt-6 flex items-center gap-2 bg-ink-black px-5 py-3 text-[10px] uppercase text-white">Start this wizard <ArrowRight className="size-4 transition-transform group-hover:translate-x-1"/></button></div></article>}
export default function AdminDashboardPage(){return <Suspense fallback={<main className="p-10">Loading offer builder…</main>}><Builder/></Suspense>}
