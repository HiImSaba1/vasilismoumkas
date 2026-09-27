"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { AdminHelp } from "@/components/admin/AdminHelp";

function initialServices(value?:unknown){
  if(Array.isArray(value))return value.map(String).map(item=>item.trim()).filter(Boolean);
  if(typeof value==="string")return value.split(/\r?\n/).map(item=>item.replace(/^\s*[-•]\s*/,"").trim()).filter(Boolean);
  return[];
}

export function OfferServiceList({name,lang="en",initial}:{name:string;lang?:"en"|"gr";initial?:unknown}){
  const[services,setServices]=useState(()=>initialServices(initial));
  const add=()=>setServices(items=>[...items,""]);
  const update=(index:number,value:string)=>setServices(items=>items.map((item,itemIndex)=>itemIndex===index?value:item));
  const remove=(index:number)=>setServices(items=>items.filter((_item,itemIndex)=>itemIndex!==index));
  const greek=lang==="gr";
  return <div className="anim-input flex flex-col gap-2">
    <div className="flex items-center justify-between gap-3">
      <label className="text-[1rem] uppercase text-ink-black/70 lg:text-[1.2rem]">
        {greek?"Περιλαμβάνεται Επίσης ":"Also Included "}
        <AdminHelp>{greek?"Προσθέστε κάθε επιπλέον υπηρεσία ξεχωριστά. Μπορείτε να την επεξεργαστείτε ή να τη διαγράψετε πριν δημιουργήσετε την προσφορά.":"Add each extra service separately. You can edit or delete it before generating the offer."}</AdminHelp>
      </label>
      <button type="button" onClick={add} className="flex shrink-0 items-center gap-2 border border-ink-black/30 px-3 py-2 text-[10px] uppercase transition-colors hover:bg-ink-black hover:text-white"><Plus className="size-3.5"/>{greek?"Προσθηκη":"Add service"}</button>
    </div>
    <div className="grid gap-2">
      {services.map((service,index)=><div key={index} className="flex items-center gap-2 border border-ink-black/20 bg-white/50 p-2">
        <span className="text-sm text-ink-black/45">−</span>
        <input name={name} value={service} onChange={event=>update(index,event.target.value)} placeholder={greek?"Γράψτε την υπηρεσία":"Write the service"} className="min-w-0 flex-1 bg-transparent py-1 text-base outline-none"/>
        <button type="button" onClick={()=>remove(index)} aria-label={greek?"Διαγραφη υπηρεσιας":"Delete service"} className="border border-red-300 p-2 text-red-800 transition-colors hover:bg-red-800 hover:text-white"><Trash2 className="size-3.5"/></button>
      </div>)}
      {!services.length&&<p className="border border-dashed border-ink-black/20 px-3 py-4 text-sm  text-ink-black/45">{greek?"Δεν έχουν προστεθεί επιπλέον υπηρεσίες.":"No Also Included  added."}</p>}
    </div>
  </div>;
}
