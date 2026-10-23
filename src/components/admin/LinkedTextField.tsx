"use client";
import { useRef, useState } from "react";
import type { InternalLinkOption } from "./ContentFields";
export function LinkedTextField({ label, value, onChange, links }: { label: string; value: string; onChange: (value: string) => void; links: InternalLinkOption[] }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [href,setHref] = useState("/contact");
  return <label className="grid gap-2 text-xs uppercase">{label}<textarea ref={ref} className="w-full border border-ink-black/20 bg-white p-3 text-sm normal-case" rows={value.length > 180 ? 5 : 2} maxLength={6000} value={value} onChange={event=>onChange(event.target.value)}/>
    <span className="flex flex-wrap gap-2"><select aria-label="Internal link destination" value={href} onChange={event=>setHref(event.target.value)} className="max-w-full border p-2 text-xs normal-case">{links.map(link=><option key={link.href} value={link.href}>{link.label}</option>)}</select><button type="button" className="border px-3 py-2 text-xs" onClick={()=>{const start=ref.current?.selectionStart??value.length;const end=ref.current?.selectionEnd??start;const text=value.slice(start,end)||links.find(link=>link.href===href)?.label||"Read more";onChange(value.slice(0,start)+`[${text}](${href})`+value.slice(end));ref.current?.focus();}}>Insert link at selection</button></span>
    <span className="text-[10px] normal-case opacity-60">Select words to link, then choose a public page. Only supported paragraph fields render inline links.</span>
  </label>;
}
