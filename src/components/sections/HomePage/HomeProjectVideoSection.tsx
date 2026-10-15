"use client";

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
    <section id="home-video-curtain" ref={containerRef} className="mx-auto w-full max-w-full overflow-hidden bg-off-white px-2 md:px-[5%]">
      <div className="flex w-full flex-col items-center gap-12 py-16 text-center md:py-24">
        <RevealAnimation>
          <p className="w-full text-sm md:text-md uppercase tracking-widest leading-[1.15] text-ink-black">
            {content.eyebrow}
          </p>
        </RevealAnimation>
        <RevealAnimation>
          <span className="block w-full text-xl md:text-2xl leading-[1.2] tracking-tight text-ink-black">
            {content.title}
          </span>
        </RevealAnimation>

        <div className="flex justify-center">
          <CTAButton href={content.buttonHref}>{content.buttonLabel}</CTAButton>
        </div>
      </div>
      <div className="w-full pb-14 md:pb-24">
        <div
          ref={videoWrapperRef}
          className="relative w-full aspect-video overflow-hidden origin-top bg-off-white"
        >
          <iframe
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
