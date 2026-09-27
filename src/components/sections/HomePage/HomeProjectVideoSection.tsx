"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CTAButton from "@/components/ui/CTAButton";
import RevealAnimation from "@/components/animations/RevealAnimation";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const HomeProjectVideoSection = () => {
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
    <section ref={containerRef} className="w-full overflow-hidden">
      <div className="min-h-dvh md:min-h-[90vh] w-full flex flex-col items-center justify-between text-center px-6 py-18">
        <RevealAnimation>
          <p className="text-sm  md:text-sm max-w-sm md:max-w-md uppercase tracking-widest leading-[1.15] text-ink-black">
            Luxury Fine Art Wedding Photography in Greece. For modern souls.
            Quiet. Emotional. Timeless
          </p>
        </RevealAnimation>
        <RevealAnimation>
          <h2 className="h2-responsive w-full md:max-w-180 block">
            For couples who value emotion, elegance, and authenticity. I am
            Vasilis Moumkas, a luxury destination wedding photographer based in
            Thessaloniki, Greece. I document refined celebrations across
            Santorini, Mykonos, Naxos, and Italy from Lake Como and Tuscany to
            the Amalfi Coast. I also specialise in intimate elopements across
            the Greek islands. With a calm, intuitive eye, I transform fleeting
            feelings into timeless artistry. Because these are not just
            photographs, they are your legacy.
          </h2>
        </RevealAnimation>

        <div className="flex justify-center pb-16 md:pb-24">
          <CTAButton href="/about">Learn More</CTAButton>
        </div>
      </div>
      <div className="w-full px-2 md:px-10 pb-14 md:pb-24">
        <div
          ref={videoWrapperRef}
          className="relative w-full aspect-video overflow-hidden origin-top bg-off-white"
        >
          <iframe
            src="https://player.vimeo.com/video/1159684670?h=ac91465937&autoplay=1&muted=1&loop=1&background=1&badge=0&autopause=0&quality=1080p"
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
