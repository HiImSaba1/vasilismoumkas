"use client";
import { useActionState } from "react";
import { createLeadAction } from "./actions";
const field="w-full border-b border-ink-black/25 bg-transparent py-2 text-sm outline-none focus:border-ink-black";
export function LeadCreateForm(){const[state,action,pending]=useActionState(createLeadAction,null);return <form action={action} className="grid gap-5 bg-[#f7f3e9] p-5 md:grid-cols-2 xl:grid-cols-3">
{[["Couple names *","coupleNames","text"],["Email","email","email"],["Phone","phone","text"],["Wedding date","eventDate","date"],["Guest count","guestCount","number"],["Ceremony location","ceremonyLocation","text"],["Reception location","receptionLocation","text"],["Source","source","text"]].map(([label,name,type])=><label key={name} className="text-[10px] uppercase tracking-[0.15em]">{label}<input required={name==="coupleNames"} name={name} type={type} className={`${field} ${type==="date"?"admin-lead-date":""}`}/></label>)}
<label className="text-[10px] uppercase tracking-[0.15em]">Event type<select name="eventType" className={field}><option value="wedding">Wedding</option><option value="baptism">Baptism</option></select></label>
<label className="text-[10px] uppercase tracking-[0.15em] md:col-span-2 xl:col-span-3">Notes<textarea name="notes" rows={3} className={field}/></label>
<div className="flex items-center gap-4 md:col-span-2 xl:col-span-3"><button disabled={pending} className="bg-ink-black px-6 py-3 text-sm  uppercase tracking-[0.14em] text-soft-white disabled:opacity-50">{pending?"Saving…":"Create lead"}</button>{state?.message&&<p className={`text-sm  ${state.success?"text-green-700":"text-red-700"}`}>{state.message}</p>}</div></form>}
