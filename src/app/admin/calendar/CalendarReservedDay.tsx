"use client";

import { useEffect,useRef,useState,type ReactNode } from "react";
import Link from "next/link";
import type { CalendarBooking,CalendarLeadInterest } from "@/lib/admin-calendar";

type Phase="closed"|"open"|"closing";

export function CalendarReservedDay({day,date,bookings,interests,isToday}:{day:number;date:string;bookings:CalendarBooking[];interests:CalendarLeadInterest[];isToday:boolean}){
  const[phase,setPhase]=useState<Phase>("closed");
  const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const clearTimer=()=>{if(timer.current){clearTimeout(timer.current);timer.current=null}};
  const openTooltip=()=>{clearTimer();setPhase("open")};
  const closeTooltip=()=>{clearTimer();setPhase("closing");timer.current=setTimeout(()=>setPhase("closed"),260)};
  useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current)},[]);
  const visible=phase!=="closed";
  const confirmed=bookings.some(item=>item.bookingStatus==="confirmed");
  const primaryBooking=bookings[0],primaryInterest=interests[0];
  const href=primaryBooking?`/admin/clients/${primaryBooking.id}`:primaryInterest?`/admin/leads/${primaryInterest.id}`:null;
  const total=bookings.length+interests.length;
  const label=total?`${date} has ${bookings.length} client booking${bookings.length===1?"":"s"} and ${interests.length} interested lead${interests.length===1?"":"s"}`:`${date} is available`;
  const eventTypes=new Set([...bookings.map(item=>item.eventType),...interests.map(item=>item.eventType)]);
  const eventTone=eventTypes.size>1?"bg-[linear-gradient(135deg,#b91c1c_0_50%,#facc15_50%_100%)] text-white":eventTypes.has("wedding")?"bg-red-700 text-white hover:bg-red-800":"bg-yellow-300 text-ink-black hover:bg-yellow-400";
  const recordState=bookings.length?(confirmed?"ring-2 ring-inset ring-green-300":"ring-2 ring-inset ring-blue-300"):interests.length?"border-2 border-dashed border-ink-black/45":"";
  const tone=total?`${eventTone} ${recordState}`:isToday?"border border-ink-black bg-soft-yellow text-ink-black":"border border-transparent bg-white text-ink-black/65 hover:border-ink-black/25 hover:bg-[#f7f3e9]";
  const eventCode=[eventTypes.has("wedding")?"W":"",eventTypes.has("baptism")?"B":""].filter(Boolean).join("+");
  const handlers={onMouseEnter:openTooltip,onMouseLeave:closeTooltip,onFocus:openTooltip,onBlur:closeTooltip};
  const content=<><span className="flex flex-col items-center leading-none"><span>{day}</span>{eventCode&&<span className="mt-1 text-[7px] font-semibold tracking-[.08em] opacity-80">{eventCode}</span>}</span>{total>1&&<span className="absolute right-0 top-0 grid size-4 translate-x-1/3 -translate-y-1/3 place-items-center rounded-full bg-amber-300 text-[8px] font-semibold text-ink-black ring-2 ring-white">{total}</span>}<CalendarDateTooltip phase={phase} date={date} bookings={bookings} interests={interests}/></>;
  const classes=`relative grid aspect-square min-h-8 place-items-center overflow-visible text-[10px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-black sm:text-sm  ${tone} ${visible?"z-[90]":"z-0"}`;
  return href?<Link href={href} aria-label={label} className={classes} {...handlers}>{content}</Link>:<button type="button" aria-label={label} className={classes} {...handlers}>{content}</button>;
}

function CalendarDateTooltip({phase,date,bookings,interests}:{phase:Phase;date:string;bookings:CalendarBooking[];interests:CalendarLeadInterest[]}){
  const total=bookings.length+interests.length;
  return <span role="tooltip" aria-hidden={phase==="closed"} className={`pointer-events-none absolute bottom-[calc(100%+.55rem)] left-1/2 z-[100] w-max min-w-48 max-w-72 -translate-x-1/2 bg-ink-black px-4 py-3 text-left text-white shadow-2xl ${phase==="open"?"opacity-100 transition-none":"opacity-0 transition-opacity duration-300 ease-out"}`}>
    <strong className="block text-sm font-medium uppercase leading-tight">{total?date:"Available · "+date}</strong>
    {!total&&<span className="mt-2 block text-sm leading-snug text-white/75">No client or active lead is recorded for this date.</span>}
    {bookings.length>0&&<TooltipGroup title={`Clients · ${bookings.length}`}>{bookings.map(item=><span key={item.id} className="mt-2 block text-sm  leading-snug"><strong className="font-medium">{item.coupleNames}</strong><span className={`ml-2 inline-block px-1.5 py-0.5 text-[12px]  uppercase ${item.eventType==="wedding"?"bg-red-700 text-white":"bg-yellow-300 text-ink-black"}`}>{item.eventType}</span><span className={`ml-1 inline-block px-1.5 py-0.5 text-[12px]  uppercase ${item.bookingStatus==="confirmed"?"bg-green-600":"bg-blue-600"}`}>{item.bookingStatus==="confirmed"?"reserved":"upcoming"}</span></span>)}</TooltipGroup>}
    {interests.length>0&&<TooltipGroup title={`Interested leads · ${interests.length}`}>{interests.map(item=><span key={item.id} className="mt-2 block text-sm  leading-snug"><strong className="font-medium">{item.coupleNames}</strong><span className={`ml-2 inline-block px-1.5 py-0.5 text-[12px]  uppercase ${item.eventType==="wedding"?"bg-red-700 text-white":"bg-yellow-300 text-ink-black"}`}>{item.eventType}</span><span className="ml-1 inline-block border border-white/40 px-1.5 py-0.5 text-[12px]  uppercase text-white">{item.status}</span></span>)}</TooltipGroup>}
    <span aria-hidden="true" className="absolute left-1/2 top-full size-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-ink-black"/>
  </span>;
}

function TooltipGroup({title,children}:{title:string;children:ReactNode}){return <span className="mt-3 block border-t border-white/20 pt-2"><span className="block text-[10px] uppercase tracking-[.1em] text-white/55">{title}</span>{children}</span>}
