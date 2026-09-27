"use client";

import { useEffect, useRef } from "react";

const removeTonos=(value:string)=>value.normalize("NFD").replace(/[\u0301\u0342]/g,"").normalize("NFC");

export function GreekUppercaseNormalizer({active,children}:{active:boolean;children:React.ReactNode}){
  const rootRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    if(!active||!rootRef.current)return;
    const root=rootRef.current;
    const normalize=()=>{
      const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
      let node:Node|null;
      while((node=walker.nextNode())){
        const element=node.parentElement;
        if(!element||getComputedStyle(element).textTransform!=="uppercase")continue;
        const current=node.nodeValue??"";
        const next=removeTonos(current);
        if(next!==current)node.nodeValue=next;
      }
    };
    normalize();
    const observer=new MutationObserver(normalize);
    observer.observe(root,{subtree:true,childList:true,characterData:true});
    return()=>observer.disconnect();
  },[active]);
  return <div ref={rootRef} lang={active?"el":"en"}>{children}</div>;
}
