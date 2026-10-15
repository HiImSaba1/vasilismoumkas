"use client";

import type {ReactNode} from "react";
import {useRef} from "react";
import {useGSAP} from "@gsap/react";
import gsap from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function HomeCurtainTransition({
  featured,
  video,
}:{
  featured:ReactNode;
  video:ReactNode;
}){
  const scrollWrapperRef=useRef<HTMLElement>(null);
  const runwayRef=useRef<HTMLDivElement>(null);
  const featuredTrackRef=useRef<HTMLDivElement>(null);

  useGSAP(()=>{
    const media=gsap.matchMedia();

    media.add("(min-width: 768px)",()=>{
      const wrapper=scrollWrapperRef.current;
      const runway=runwayRef.current;
      const featuredTrack=featuredTrackRef.current;
      if(!wrapper||!runway||!featuredTrack)return;

      const featuredDistance=()=>Math.max(0,featuredTrack.scrollHeight-window.innerHeight+120);
      const syncRunway=()=>{runway.style.height=`${featuredDistance()}px`;};
      syncRunway();

      const movement=gsap.to(featuredTrack,{
        y:()=>-featuredDistance(),
        ease:"none",
        scrollTrigger:{
          id:"home-featured-card-track",
          trigger:wrapper,
          start:"top top",
          end:()=>`+=${featuredDistance()}`,
          scrub:true,
          invalidateOnRefresh:true,
        },
      });

      const observer=new ResizeObserver(()=>{syncRunway();movement.scrollTrigger?.refresh();});
      observer.observe(featuredTrack);
      requestAnimationFrame(()=>{syncRunway();ScrollTrigger.refresh();});
      return()=>observer.disconnect();
    });

    return()=>media.revert();
  },{scope:scrollWrapperRef});

  return <section ref={scrollWrapperRef} className="relative z-[60] w-full bg-off-white">
    <div className="relative z-[60] w-full bg-off-white md:sticky md:top-0 md:h-screen md:overflow-hidden">
      <div ref={featuredTrackRef} className="relative bg-off-white will-change-transform">
        {featured}
      </div>
    </div>
    <div ref={runwayRef} aria-hidden="true" className="hidden md:block" />
    <div className="relative z-[70] bg-off-white md:min-h-screen md:isolate">
      {video}
    </div>
  </section>;
}
