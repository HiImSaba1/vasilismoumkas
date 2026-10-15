"use client";

import {useState,type DragEvent} from "react";
import type {Photo} from "@/app/(site)/data/ProjectsData";

export function PortfolioImageReorder({photos,title}:{photos:Photo[];title:string}){
  const[items,setItems]=useState(photos);
  const[dragged,setDragged]=useState<number|null>(null);
  const move=(from:number,to:number)=>{
    if(from===to||to<0||to>=items.length)return;
    setItems(current=>{const next=[...current];const[item]=next.splice(from,1);if(!item)return current;next.splice(to,0,item);return next});
  };
  const drop=(event:DragEvent<HTMLDivElement>,to:number)=>{event.preventDefault();if(dragged!==null)move(dragged,to);setDragged(null)};

  return <section className="grid gap-3">
    <input type="hidden" name="existingPhotos" value={JSON.stringify(items)}/>
    <div>
      <p className="text-sm uppercase tracking-[0.14em]">Gallery order</p>
      <p className="mt-1 text-sm text-ink-black/50">Drag images into position, or use the arrow buttons for an exact manual order. Save the project to publish the order.</p>
    </div>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
      {items.map((photo,index)=><div key={photo.src} draggable onDragStart={()=>setDragged(index)} onDragEnd={()=>setDragged(null)} onDragOver={event=>event.preventDefault()} onDrop={event=>drop(event,index)} className={`border bg-white p-1 ${dragged===index?"border-ink-black opacity-50":"border-ink-black/15"}`}>
        <div className="relative cursor-grab active:cursor-grabbing">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo.src} alt={photo.alt||title} className="aspect-square w-full object-cover"/>
          <span className="absolute left-1 top-1 bg-ink-black px-2 py-1 text-[10px] text-white">{index+1}</span>
        </div>
        <div className="mt-1 grid grid-cols-2 gap-1">
          <button type="button" onClick={()=>move(index,index-1)} disabled={index===0} aria-label={`Move image ${index+1} earlier`} className="border border-ink-black/15 py-2 text-xs disabled:opacity-25">←</button>
          <button type="button" onClick={()=>move(index,index+1)} disabled={index===items.length-1} aria-label={`Move image ${index+1} later`} className="border border-ink-black/15 py-2 text-xs disabled:opacity-25">→</button>
        </div>
        <label className="mt-1 flex items-center gap-2 bg-black/75 p-2 text-[10px] uppercase text-white"><input name="removePhoto" value={photo.src} type="checkbox"/>Remove</label>
        <p className="break-all px-1 py-2 text-[10px] leading-snug">{imageTitle(photo.src,photo.alt||`${title} image ${index+1}`)}</p>
      </div>)}
    </div>
  </section>;
}

function imageTitle(src:string,fallback:string){const filename=src.split("?")[0]?.split("/").filter(Boolean).at(-1)??src;let visible=filename;try{visible=decodeURIComponent(filename)}catch{}return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.[a-z0-9]+$/i.test(visible)?fallback:visible}
