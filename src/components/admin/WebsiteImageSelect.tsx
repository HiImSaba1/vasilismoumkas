"use client";
import {useMemo,useState} from "react";
import type {PortfolioEmailImage} from "@/lib/portfolio";
import SeoImage from "@/components/ui/SeoImage";
export function WebsiteImageSelect({name,label,value,images}:{name:string;label:string;value:string;images:PortfolioEmailImage[]}){
  const[selected,setSelected]=useState(value);
  const[search,setSearch]=useState("");
  const filtered=useMemo(()=>{const query=search.trim().toLowerCase();return(query?images.filter(image=>`${image.projectTitle} ${image.alt} ${image.searchableText}`.toLowerCase().includes(query)):images).slice(0,60)},[images,search]);
  return <fieldset className="grid gap-2 text-[11px] uppercase tracking-[.12em] text-ink-black/65"><legend>{label}</legend>
    <select name={name} value={selected} onChange={event=>setSelected(event.target.value)} className="min-w-0 border border-ink-black/20 bg-white px-3 py-3 text-sm normal-case">
      {!images.some(image=>image.src===selected)&&<option value={selected}>{selected}</option>}
      {images.map(image=><option key={image.src} value={image.src}>{image.projectTitle} · {image.alt}</option>)}
    </select>
    <span className="relative block aspect-[16/9] max-w-md overflow-hidden bg-ink-black/5"><SeoImage src={selected} alt="Selected website content" fill className="object-contain" sizes="448px"/></span>
    <details className="normal-case"><summary className="cursor-pointer border border-ink-black/20 px-3 py-2 text-xs uppercase">Browse thumbnails</summary><div className="mt-2 grid gap-2"><input value={search} onChange={event=>setSearch(event.target.value)} placeholder="Search project, filename or alt" className="border border-ink-black/20 px-3 py-2 text-sm"/><div className="grid max-h-80 grid-cols-3 gap-2 overflow-y-auto md:grid-cols-4">{filtered.map(image=><button key={image.src} type="button" onClick={()=>setSelected(image.src)} aria-pressed={selected===image.src} className={`grid gap-1 border p-1 text-left ${selected===image.src?"border-ink-black bg-soft-yellow":"border-ink-black/10"}`}><span className="relative aspect-square overflow-hidden"><SeoImage src={image.src} alt="" fill className="object-cover" sizes="120px"/></span><span className="line-clamp-2 text-[10px]">{image.projectTitle} · {image.alt}</span></button>)}</div></div></details>
  </fieldset>
}
