"use client";

import { useState } from "react";
import { acceptOfferAction, rejectOfferAction } from "./actions";

export function OfferDecisionControls({slug,name,email,packages}:{slug:string;name:string;email:string;packages:string[]}){
  const[decision,setDecision]=useState<"accept"|"reject"|null>(null);
  if(decision==="accept")return <form action={acceptOfferAction} className="col-span-2 grid gap-3 border border-green-300 bg-green-50 p-3">
    <input type="hidden" name="slug" value={slug}/>
    <p className="text-sm  text-green-950">Use this when the couple accepted by phone, message or email. Confirming creates the client workspace, portal and booking documents, then moves the workflow to Step 004.</p>
    <input name="name" required defaultValue={name} placeholder="Client names" className="border border-green-300 bg-white px-3 py-2 text-sm "/>
    <input name="email" type="email" required defaultValue={email} placeholder="Client email" className="border border-green-300 bg-white px-3 py-2 text-sm "/>
    {packages.length>0&&<select name="packageName" defaultValue={packages[0]} className="border border-green-300 bg-white px-3 py-2 text-sm  uppercase">{packages.map(item=><option key={item} value={item}>{item}</option>)}</select>}
    <div className="flex gap-2"><button className="bg-green-800 px-3 py-2 text-[10px] uppercase text-white">Confirm accepted</button><button type="button" onClick={()=>setDecision(null)} className="border border-green-300 px-3 py-2 text-[10px] uppercase">Cancel</button></div>
  </form>;
  if(decision==="reject")return <form action={rejectOfferAction} className="col-span-2 border border-red-300 bg-red-50 p-3">
    <input type="hidden" name="slug" value={slug}/><p className="mb-3 text-sm  text-red-950">Mark this offer as rejected and close its public workflow? The history will be preserved.</p>
    <div className="flex gap-2"><button className="bg-red-800 px-3 py-2 text-[10px] uppercase text-white">Confirm rejected</button><button type="button" onClick={()=>setDecision(null)} className="border border-red-300 px-3 py-2 text-[10px] uppercase">Cancel</button></div>
  </form>;
  return <><button type="button" onClick={()=>setDecision("accept")} className="h-full w-full border border-green-700 px-3 py-3 text-[10px] uppercase text-green-800">Mark accepted</button><button type="button" onClick={()=>setDecision("reject")} className="h-full w-full border border-red-300 px-3 py-3 text-[10px] uppercase text-red-800">Mark rejected</button></>;
}
