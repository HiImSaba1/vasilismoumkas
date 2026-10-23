"use client";
import { useActionState, useState } from "react";
import type { InternalLinkOption } from "@/components/admin/ContentFields";
import { saveRedirectsAction } from "./actions";
export function RedirectForm({ rules, links, version, workspaceVersion }: { rules: { from: string; to: string }[]; links: InternalLinkOption[]; version: string; workspaceVersion: string }) {
  const [rows,setRows] = useState(rules);
  const [state,action,pending] = useActionState(saveRedirectsAction,{success:false,message:""});
  return <form action={action} className="grid gap-4" data-admin-locale-isolated="true"><input type="hidden" name="version" value={version}/><input type="hidden" name="workspaceVersion" value={workspaceVersion}/>{rows.map((row,index) => <div key={index} className="flex flex-wrap gap-3"><input name="from" value={row.from} placeholder="/legacy/old-public-path" className="border p-3" onChange={event => setRows(rows.map((item,i) => i===index?{...item,from:event.target.value}:item))}/><select name="to" className="border p-3" value={row.to} onChange={event => setRows(rows.map((item,i) => i===index?{...item,to:event.target.value}:item))}>{links.map(link=><option key={link.href} value={link.href}>{link.label}</option>)}</select><button type="button" className="underline" onClick={()=>setRows(rows.filter((_,i)=>i!==index))}>Remove</button></div>)}<button type="button" onClick={()=>setRows([...rows,{from:"",to:"/"}])} className="w-fit border px-4 py-2">Add redirect</button>{state.message&&<p role="status">{state.message}</p>}<button disabled={pending} className="w-fit bg-ink-black px-5 py-3 text-white">Save reviewed redirects</button></form>;
}
