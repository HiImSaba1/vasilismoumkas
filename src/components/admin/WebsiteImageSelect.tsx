"use client";
import {useState} from "react";
import type {PortfolioEmailImage} from "@/lib/portfolio";
import SeoImage from "@/components/ui/SeoImage";
export function WebsiteImageSelect({name,label,value,images}:{name:string;label:string;value:string;images:PortfolioEmailImage[]}){
  const[selected,setSelected]=useState(value);
  return <label className="grid gap-2 text-[11px] uppercase tracking-[.12em] text-ink-black/65">
    {label}
    <select name={name} value={selected} onChange={event=>setSelected(event.target.value)} className="min-w-0 border border-ink-black/20 bg-white px-3 py-3 text-sm normal-case">
      {!images.some(image=>image.src===selected)&&<option value={selected}>{selected}</option>}
      {images.map(image=><option key={image.src} value={image.src}>{image.projectTitle} · {image.alt}</option>)}
    </select>
    <span className="relative block aspect-[16/9] max-w-md overflow-hidden bg-ink-black/5"><SeoImage src={selected} alt="Selected website content" fill className="object-contain" sizes="448px"/></span>
  </label>
}
