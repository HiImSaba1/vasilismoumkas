"use client";
import { useState,type ChangeEvent } from "react";

type Dimensions={name:string;width:number;height:number};
async function measure(file:File):Promise<Dimensions>{
  if(typeof createImageBitmap==="function"){
    const bitmap=await createImageBitmap(file);
    const value={name:file.name,width:bitmap.width,height:bitmap.height};
    bitmap.close();
    return value;
  }
  const url=URL.createObjectURL(file);
  try{
    return await new Promise<Dimensions>((resolve,reject)=>{
      const image=new Image();
      image.onload=()=>resolve({name:file.name,width:image.naturalWidth,height:image.naturalHeight});
      image.onerror=()=>reject(new Error(`Unable to read ${file.name}`));
      image.src=url;
    });
  }finally{
    URL.revokeObjectURL(url);
  }
}

export function PortfolioGalleryInput(){
  const[dimensions,setDimensions]=useState<Dimensions[]>([]);
  const[reading,setReading]=useState(false);
  const handleChange=async(event:ChangeEvent<HTMLInputElement>)=>{
    const files=[...event.currentTarget.files??[]];
    setReading(true);
    try{
      setDimensions(await Promise.all(files.map(measure)));
    }finally{
      setReading(false);
    }
  };
  return <label className="grid gap-2 text-sm  uppercase">Add gallery images · max 50 total · 400 KB each
    <input name="gallery" type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" className="border border-ink-black/20 p-3" onChange={handleChange}/>
    <input type="hidden" name="galleryDimensions" value={JSON.stringify(dimensions)}/>
    <span aria-live="polite" className="text-[10px] normal-case text-ink-black/50">{reading?"Reading image dimensions…":dimensions.length?`${dimensions.length} images ready with their original dimensions.`:"Portrait, landscape and square dimensions will be preserved."}</span>
  </label>;
}
