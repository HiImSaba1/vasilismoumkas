"use client";
import {useActionState,useState} from "react";
import Link from "next/link";
import {activateClientWorkspaceAction} from "./actions";
export function ClientWorkspaceActivation({leadId}:{leadId:string}){
  const [state,action,pending]=useActionState(activateClientWorkspaceAction,{success:false,message:"",clientId:""});
  const [confirmed,setConfirmed]=useState(false);
  const [reason,setReason]=useState("");
  return <form action={action} className="mt-6 grid gap-4"><input type="hidden" name="id" value={leadId}/><details className="border border-orange-300 p-3 text-sm"><summary>Additional booking on an already booked date</summary><label className="mt-3 flex gap-2"><input type="checkbox" name="confirmDateConflict" checked={confirmed} onChange={event=>setConfirmed(event.target.checked)}/> I checked availability and explicitly confirm this additional booking.</label><textarea name="dateConflictReason" value={reason} onChange={event=>setReason(event.target.value)} required={confirmed} minLength={confirmed?10:undefined} maxLength={1000} placeholder="Reason and confirmed coverage arrangements" className="mt-3 w-full border p-2"/></details>{state.message&&<p role="status" className="border p-3 text-sm">{state.message}</p>}{state.success?<Link href={`/admin/clients/${state.clientId}`} className="underline">Open client workspace →</Link>:<button disabled={pending} className="bg-green-800 px-5 py-4 text-sm uppercase text-white disabled:opacity-50">{pending?"Checking…":"Create or open client workspace →"}</button>}<p className="text-xs opacity-60">This action creates or opens the workspace only. It does not record payments, signatures or sent emails.</p></form>;
}
