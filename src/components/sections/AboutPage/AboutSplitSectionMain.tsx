"use client";

import RevealAnimation from "@/components/animations/RevealAnimation";
import AnimatedBorder from "@/components/animations/AnimatedBorder";
import ProjectCard from "@/components/sections/Projects/ProjectCard";
import CTAButton from "@/components/ui/CTAButton";
import type {HomepageSettings} from "@/lib/homepage-settings";

const fallbackEditorial:HomepageSettings["featuredEditorial"]={eyebrow:"Selected stories",title:"Love, light & legacy",subtitle:"Three celebrations shaped by place, emotion and the quiet beauty found between the defining moments.",items:[{title:"Documenting love",subtitle:"Honest gestures and modern romance, preserved with an editorial sensitivity."},{title:"Following light",subtitle:"Celebrations shaped by landscape, atmosphere and the unmistakable light of Greece."},{title:"Creating legacy",subtitle:"Timeless photographs that hold the feeling of the day long after it has passed."}]};

export default function AboutSplitSectionMain({cards,editorial=fallbackEditorial}:{cards:HomepageSettings["featuredCards"];editorial?:HomepageSettings["featuredEditorial"]}) {
  return <section className="relative min-h-full w-full bg-off-white px-4 pb-[30px] pt-[30px] md:pb-[9vh] lg:px-8">
    <div className="absolute left-0 top-0 w-full px-4 lg:px-8"><AnimatedBorder origin="left" duration={1.8} className="bg-ink-black/70"/></div>
    <header className="mx-auto flex w-full max-w-[1280px] flex-col items-center py-18 text-center md:max-w-4xl">
      <RevealAnimation><span className="block w-full text-center text-[16px] uppercase tracking-[0.18em] text-ink-black/55">{editorial.eyebrow}</span></RevealAnimation>
      <RevealAnimation><h2 className="mt-5 mb-0 block w-full text-center text-[clamp(2.2rem,6vw,6.5rem)] uppercase leading-[0.88] tracking-[-0.055em] text-ink-black">{editorial.title}</h2></RevealAnimation>
      <RevealAnimation><p className="mt-2.5 max-w-2xl text-center text-md leading-relaxed text-ink-black/65 md:text-xl">{editorial.subtitle}</p></RevealAnimation>
    </header>

    <div className="mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2 md:grid-rows-2 md:gap-x-14 md:gap-y-0">
      {cards.map((card,index)=>{
        const copy=editorial.items[index];
        const placement=index===0?"md:col-start-1 md:row-start-1":index===1?"md:col-start-2 md:row-start-1 md:pt-[30vh]":"md:col-start-1 md:row-start-2";
        return <article key={card.href} className={placement}>
          <div className="mx-4 flex flex-col items-center justify-end pb-8 text-center md:mx-0 md:items-start md:pb-10 md:text-left">
            <div className="relative flex w-full items-start justify-center md:block">
              <RevealAnimation><span className="absolute left-0 top-1 pr-8 text-[14px] uppercase tracking-[0.2em] text-ink-black/45 md:static md:pr-0">0{index+1}</span></RevealAnimation>
              <RevealAnimation><h3 className="m-0 block max-w-[calc(100%-6rem)] text-center text-[clamp(1.35rem,2.2vw,2.65rem)] uppercase leading-[0.98] tracking-[-0.035em] text-ink-black md:mt-2 md:max-w-xl md:text-left">{copy.title}</h3></RevealAnimation>
            </div>
            <RevealAnimation><p className="my-3 max-w-md text-center text-sm leading-relaxed text-ink-black/60 md:my-4 md:text-left md:text-xl">{copy.subtitle}</p></RevealAnimation>
            <RevealAnimation><CTAButton href={card.href} className="mt-2 md:mt-4" aria-label={`${card.ctaLabel}: ${card.title}, ${card.subtitle}`}>{card.ctaLabel}</CTAButton></RevealAnimation>
          </div>
          <ProjectCard project={{title:card.title,location:card.subtitle,thumbnail:card.image,href:card.href,alt:card.alt,caption:card.caption}} index={index} hoverOverlay={false} portrait/>
        </article>;
      })}
    </div>
  </section>;
}
