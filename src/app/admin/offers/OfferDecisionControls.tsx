"use client";

import { useActionState,useState } from "react";
import { acceptOfferAction, type AcceptOfferState, rejectOfferAction } from "./actions";

const initialAcceptState:AcceptOfferState={status:"idle",message:""};

export function OfferDecisionControls({slug,name,email,packages}:{slug:string;name:string;email:string;packages:string[]}){
  const [fields,setFields]=useState({name,email,packageName:packages[0]??"",confirmDateConflict:false,dateConflictReason:""});
  const[decision,setDecision]=useState<"accept"|"reject"|null>(null);
  const[acceptState,acceptAction,acceptPending]=useActionState(acceptOfferAction,initialAcceptState);
  if(decision==="accept")return <form action={acceptAction} className="col-span-2 grid gap-3 border border-green-300 bg-green-50 p-3">
    <input type="hidden" name="slug" value={slug}/>
    <p className="text-sm  text-green-950">Use this when the couple accepted by phone, message or email. Confirming creates the client workspace, portal and booking documents, then moves the workflow to Step 004.</p>
    <input name="name" required value={fields.name} onChange={event=>setFields({...fields,name:event.target.value})} placeholder="Client names" className="border border-green-300 bg-white px-3 py-2 text-sm "/>
    <input name="email" type="email" required value={fields.email} onChange={event=>setFields({...fields,email:event.target.value})} placeholder="Client email" className="border border-green-300 bg-white px-3 py-2 text-sm "/>
    {packages.length>0&&<select name="packageName" value={fields.packageName} onChange={event=>setFields({...fields,packageName:event.target.value})} className="border border-green-300 bg-white px-3 py-2 text-sm  uppercase">{packages.map(item=><option key={item} value={item}>{item}</option>)}</select>}
    <details className="border border-orange-300 p-3 text-sm"><summary>Additional booking on an already booked date</summary><p className="mt-2">Only confirm after checking photographer availability. Existing bookings remain unchanged. No email is sent by manual acceptance.</p><label className="mt-3 flex gap-2"><input type="checkbox" name="confirmDateConflict" checked={fields.confirmDateConflict} onChange={event=>setFields({...fields,confirmDateConflict:event.target.checked})}/> I explicitly confirm capacity for this additional booking.</label><textarea name="dateConflictReason" value={fields.dateConflictReason} onChange={event=>setFields({...fields,dateConflictReason:event.target.value})} required={fields.confirmDateConflict} minLength={fields.confirmDateConflict?10:undefined} maxLength={1000} placeholder="Reason and confirmed coverage arrangements" className="mt-3 w-full border p-2"/></details>
    {acceptState.message&&<p role="status" className={`border px-3 py-2 text-sm ${acceptState.status==="error"?"border-red-300 bg-red-50 text-red-950":"border-green-300 bg-white text-green-950"}`}>{acceptState.message}</p>}
    <div className="flex gap-2"><button disabled={acceptPending} className="bg-green-800 px-3 py-2 text-[10px] uppercase text-white disabled:cursor-wait disabled:opacity-60">{acceptPending?"Accepting…":"Confirm accepted"}</button><button type="button" disabled={acceptPending} onClick={()=>setDecision(null)} className="border border-green-300 px-3 py-2 text-[10px] uppercase">Cancel</button></div>
  </form>;
  if(decision==="reject")return <form action={rejectOfferAction} className="col-span-2 border border-red-300 bg-red-50 p-3">
    <input type="hidden" name="slug" value={slug}/><p className="mb-3 text-sm  text-red-950">Mark this offer as rejected and close its public workflow? The history will be preserved.</p>
    <div className="flex gap-2"><button className="bg-red-800 px-3 py-2 text-[10px] uppercase text-white">Confirm rejected</button><button type="button" onClick={()=>setDecision(null)} className="border border-red-300 px-3 py-2 text-[10px] uppercase">Cancel</button></div>
  </form>;
  return <><button type="button" onClick={()=>setDecision("accept")} className="h-full w-full border border-green-700 px-3 py-3 text-[10px] uppercase text-green-800">Mark accepted</button><button type="button" onClick={()=>setDecision("reject")} className="h-full w-full border border-red-300 px-3 py-3 text-[10px] uppercase text-red-800">Mark rejected</button></>;
}
