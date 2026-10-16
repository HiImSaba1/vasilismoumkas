"use client";
import {useEffect,useRef} from "react";
import {usePathname,useRouter} from "next/navigation";
import gsap from "gsap";
const EVENT="custom-page-transition";
const pageName=(path:string)=>path==="/"?"HOME":path.split("/").filter(Boolean).at(-1)?.toUpperCase().replace(/-/g," ")||"";
export default function PageTransitionProvider({children}:{children:React.ReactNode}){
 const router=useRouter(),pathname=usePathname();const blocksRoot=useRef<HTMLDivElement>(null),overlay=useRef<HTMLDivElement>(null),text=useRef<HTMLDivElement>(null),blocks=useRef<HTMLDivElement[]>([]),busy=useRef(false);
 useEffect(()=>{const root=blocksRoot.current;if(!root)return;root.replaceChildren();blocks.current=Array.from({length:6},()=>{const node=document.createElement("div");node.className="transition-block";root.appendChild(node);return node});gsap.set(overlay.current,{opacity:0});gsap.set(blocks.current,{scaleX:1,transformOrigin:"right"});gsap.to(blocks.current,{scaleX:0,duration:.4,stagger:.02,ease:"power2.out",onComplete:()=>{busy.current=false}});
 const cover=(url:string)=>{if(busy.current)return;busy.current=true;if(text.current)text.current.textContent=pageName(url);gsap.timeline({onComplete:()=>router.push(url,{scroll:false})}).to(blocks.current,{scaleX:1,duration:.4,stagger:.02,ease:"power2.in",transformOrigin:"left"}).to(overlay.current,{opacity:1,duration:.1}).fromTo(text.current,{opacity:1,xPercent:100},{xPercent:0,duration:.25,ease:"power2.out"},"<").to(text.current,{xPercent:100,duration:.4,ease:"power2.in"},"+=.6")};
 const click=(event:Event)=>{const anchor=event.currentTarget as HTMLAnchorElement,url=new URL(anchor.href).pathname;if(url!==pathname){event.preventDefault();cover(url)}};const links=document.querySelectorAll<HTMLAnchorElement>('a[href^="/"]');links.forEach(link=>link.addEventListener("click",click));const custom=(event:Event)=>{const url=(event as CustomEvent<{url:string}>).detail?.url;if(url&&url!==pathname)cover(url)};window.addEventListener(EVENT,custom);return()=>{links.forEach(link=>link.removeEventListener("click",click));window.removeEventListener(EVENT,custom)}},[pathname,router]);
 return <>{children}<div ref={blocksRoot} aria-hidden="true" className="transition-overlay pointer-events-none fixed left-0 top-0 z-99999 flex h-full w-full"/><div ref={overlay} aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-100000 flex h-full w-full items-center justify-center opacity-0"><div className="overflow-hidden"><div ref={text} className="transition-text-overlay text-ink-black"/></div></div></>;
}
