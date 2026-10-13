"use client";

import React, { useSyncExternalStore } from "react";
import HomeHeroDesktop from "./HomeHeroDesktop";
import HomeHeroMobile from "./HomeHeroMobile";
import type {HomepageSettings} from "@/lib/homepage-settings";

export default function HomeHero({content}:{content:HomepageSettings["hero"]}) {
  const isClient=useSyncExternalStore(()=>()=>{},()=>true,()=>false);
  const isDesktop=useSyncExternalStore(callback=>{const media=window.matchMedia("(min-width: 1024px)");media.addEventListener("change",callback);return()=>media.removeEventListener("change",callback)},()=>window.matchMedia("(min-width: 1024px)").matches,()=>true);

  if (!isClient) return <div className="h-dvh bg-white" />;

  return (
    <div className="relative w-full overflow-hidden">
      {isDesktop ? <HomeHeroDesktop content={content}/> : <HomeHeroMobile content={content}/>}
    </div>
  );
}
