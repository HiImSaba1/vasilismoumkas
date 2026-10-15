"use client";

import RevealAnimation from "@/components/animations/RevealAnimation";
import AnimatedBorder from "@/components/animations/AnimatedBorder";
import ProjectCard from "@/components/sections/Projects/ProjectCard";
import Link from "next/link";
import type {HomepageSettings} from "@/lib/homepage-settings";

const fallbackEditorial:HomepageSettings["featuredEditorial"]={eyebrow:"Selected stories",title:"Love, light & legacy",subtitle:"Three celebrations shaped by place, emotion and the quiet beauty found between the defining moments.",items:[{title:"Documenting love",subtitle:"Honest gestures and modern romance, preserved with an editorial sensitivity."},{title:"Following light",subtitle:"Celebrations shaped by landscape, atmosphere and the unmistakable light of Greece."},{title:"Creating legacy",subtitle:"Timeless photographs that hold the feeling of the day long after it has passed."}]};

export default function AboutSplitSectionMain({cards,editorial=fallbackEditorial}:{cards:HomepageSettings["featuredCards"];editorial?:HomepageSettings["featuredEditorial"]}) {
  return <section className="relative min-h-full w-full bg-off-white px-4 pb-[30px] pt-[30px] md:pb-[9vh] lg:px-8">
    <div className="absolute left-0 top-0 w-full px-4 lg:px-8"><AnimatedBorder origin="left" duration={1.8} className="bg-ink-black/70"/></div>
    <header className="mx-auto flex w-full max-w-[1280px] flex-col gap-5 py-18 md:max-w-4xl md:items-center md:text-center">
      <RevealAnimation><span className="block text-[16px] uppercase tracking-[0.18em] text-ink-black/55">{editorial.eyebrow}</span></RevealAnimation>
      <RevealAnimation><span className="block text-[clamp(2.2rem,6vw,6.5rem)] uppercase leading-[0.88] tracking-[-0.055em] text-ink-black">{editorial.title}</span></RevealAnimation>
      <RevealAnimation><p className="max-w-2xl text-md leading-relaxed text-ink-black/65 md:text-xl">{editorial.subtitle}</p></RevealAnimation>
    </header>

    <div className="mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-x-8 gap-y-20 md:grid-cols-2 md:grid-rows-2 md:gap-x-14 md:gap-y-0">
      {cards.map((card,index)=>{
        const copy=editorial.items[index];
        const placement=index===0?"md:col-start-1 md:row-start-1":index===1?"md:col-start-2 md:row-start-1 md:pt-[30vh]":"md:col-start-1 md:row-start-2";
        return <article key={card.href} className={placement}>
          <div className="flex flex-col justify-end pb-8 md:pb-10">
            <RevealAnimation><span className="text-[14px] uppercase tracking-[0.2em] text-ink-black/45">0{index+1}</span></RevealAnimation>
            <RevealAnimation><span className="mt-2 block max-w-xl text-[clamp(1.35rem,2.2vw,2.65rem)] uppercase leading-[0.98] tracking-[-0.035em] text-ink-black">{copy.title}</span></RevealAnimation>
            <RevealAnimation><p className="my-4 max-w-md text-sm leading-relaxed text-ink-black/60 md:text-xl">{copy.subtitle}</p></RevealAnimation>
            <RevealAnimation><Link href={card.href} className="mt-5 inline-flex w-fit border-b border-ink-black/45 pb-1 text-[16px] uppercase tracking-[0.16em] text-ink-black transition-opacity hover:opacity-55">View story &#8599;</Link></RevealAnimation>
          </div>
          <ProjectCard project={{title:card.title,location:card.subtitle,thumbnail:card.image,href:card.href,alt:card.alt}} index={index} hoverOverlay={false} portrait/>
        </article>;
      })}
    </div>
  </section>;
}
