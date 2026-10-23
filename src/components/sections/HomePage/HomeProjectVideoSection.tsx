"use client";

import {InlineContent} from "@/components/ui/InlineContent";
import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CTAButton from "@/components/ui/CTAButton";
import RevealAnimation from "@/components/animations/RevealAnimation";
import type {HomepageSettings} from "@/lib/homepage-settings";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const HomeProjectVideoSection = ({content}:{content:HomepageSettings["story"]}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoWrapperRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!videoWrapperRef.current) return;

      gsap.fromTo(
        videoWrapperRef.current,
        {
          scale: 0.5,
        },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 70%",
            end: "bottom 40%",
            scrub: 1,
          },
        },
      );
    },
    { scope: containerRef },
  );

  return (
    <section id="home-video-curtain" ref={containerRef} className="mx-auto flex w-full max-w-full flex-col justify-center overflow-hidden bg-off-white px-5 md:min-h-screen md:px-[5%]">
      <div data-home-personal-intro className="flex w-full flex-col content-center items-center justify-center gap-8 md:gap-12 py-[30px] text-center md:py-24">
        <RevealAnimation>
          <p className="w-full text-sm md:text-md uppercase tracking-widest leading-[1.15] text-ink-black">
            {content.eyebrow}
          </p>
        </RevealAnimation>
        <div className="grid w-full gap-5 md:gap-4">
          {content.title.split(/\n\s*\n/).map((paragraph,index)=><RevealAnimation key={index} responsive><p className="home-intro-paragraph mx-auto w-full max-w-6xl whitespace-normal text-[16px] font-extralight leading-[1.65] tracking-normal text-ink-black md:whitespace-pre-wrap md:text-xl md:font-light md:leading-[1.2] md:tracking-tight">{<InlineContent text={paragraph}/>}</p></RevealAnimation>)}
        </div>

        <div className="flex justify-center">
          <CTAButton href={content.buttonHref}><span className="inline-flex items-center gap-2">{content.buttonLabel.replace(/\s*[↗→➜➡\uFE0F\uFE0E]+\s*$/u, "")}<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 19 19 5M5 5h14v14"/></svg></span></CTAButton>
        </div>
      </div>
      <div className="w-full pb-12">
        <div
          ref={videoWrapperRef}
          className="relative w-full aspect-video overflow-hidden origin-top bg-off-white"
        >
          <iframe
            loading="lazy"
            src={content.videoUrl}
            className="absolute top-1/2 left-1/2 w-[105%] h-[105%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-100"
            style={{ border: "none", backgroundColor: "#000" }}
            allow="autoplay; fullscreen; picture-in-picture"
            title="Vasilis Moumkas Cinematic Wedding Story"
          ></iframe>
        </div>
      </div>
    </section>
  );
};

export default HomeProjectVideoSection;
