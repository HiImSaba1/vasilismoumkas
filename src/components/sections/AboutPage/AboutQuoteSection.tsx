"use client";

import React, { useRef } from "react";
import SeoImage from "@/components/ui/SeoImage";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import AnimatedBorder from "@/components/animations/AnimatedBorder";
import RevealAnimation from "@/components/animations/RevealAnimation";

// Register ScrollTrigger
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

import { aboutVisualDefaults, type PublicPageContent } from "@/lib/public-page-content";
import { HighlightedContent } from "@/components/ui/HighlightedContent";
const AboutQuoteSection = ({content=aboutVisualDefaults}:{content?:PublicPageContent["about"]["visuals"]}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftImgRef = useRef<HTMLDivElement>(null);
  const rightImgRef = useRef<HTMLDivElement>(null);
  const mobileImgRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Select all images we want to animate with the same logic
      const images = [
        leftImgRef.current,
        rightImgRef.current,
        mobileImgRef.current,
      ];

      images.forEach((img) => {
        if (!img) return;

        gsap.fromTo(
          img,
          {
            clipPath: "inset(100% 0% 0% 0%)",
          },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1,
            ease: "expo.inOut",
            scrollTrigger: {
              trigger: img,
              start: "top 90%",
              end: "bottom 20%",
              toggleActions: "play reverse play reverse",
            },
          },
        );
      });
    },
    { scope: containerRef },
  );

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-[85vh] md:min-h-screen py-20 md:my-12 flex flex-col items-center justify-center overflow-hidden"
    >
      <div className="mx-auto px-4 flex flex-col items-center text-center max-w-6xl">
        <div className="mb-10 w-full flex flex-col items-center">
          <AnimatedBorder
            className="bg-ink-black/40"
            origin="center"
            delay={0.2}
          />
        </div>
        {/* QUOTE SECTION */}
        <div className="mb-16">
          <RevealAnimation>
            <h2 style={{margin:0,fontWeight:"inherit",fontFamily:"inherit"}} className="text-2xl md:text-5xl font-karena leading-[1.1] text-ink-black uppercase tracking-tighter block text-balance">
              “<HighlightedContent text={content.quote} phrases={["calm editorial","emotion","timeless beauty.","light","love","soul","breathtaking"]}/>”
            </h2>
          </RevealAnimation>
        </div>
        <div className="w-full max-w-5xl">
          <div className="flex flex-col md:grid md:grid-cols-[1fr_2fr_1fr] items-center justify-items-center gap-8 md:gap-0">
            {/* 1. LEFT IMAGE (Desktop) - Vasilis Portrait */}
            <div className="hidden md:block w-full max-w-65 aspect-3/4 overflow-hidden relative">
              <div ref={leftImgRef} className="relative w-full h-full">
                <SeoImage
                  src={content.portrait} alt={content.portraitAlt}
                  description="vasilis-moumkas-portrait"
                  location="thessaloniki-greece"
                  fill
                  sizes="220px"
                  className="object-cover"
                />{content.portraitCaption&&<span className="absolute inset-x-0 bottom-0 bg-ink-black/60 p-2 text-xs text-white">{content.portraitCaption}</span>}
              </div>
            </div>

            {/* 2. CENTER SIGNATURE */}
            <div className="flex flex-col items-center order-first md:order-0 px-4 md:px-20 w-full">
              {/* MOBILE ONLY TOP BORDER */}
              <div className="w-full mb-8 md:hidden">
                <AnimatedBorder
                  className="bg-ink-black/40"
                  origin="center"
                  delay={0.4}
                />
              </div>

              <div className="flex items-center gap-4 mb-2">
                <AnimatedBorder
                  className="bg-ink-black/70 w-8 md:w-12"
                  origin="right"
                  delay={0.6}
                />
                <RevealAnimation>
                  <span className="text-2xl md:text-3xl lg:text-4xl uppercase tracking-wide text-ink-black font-karena whitespace-nowrap">
                    {content.signature}
                  </span>
                </RevealAnimation>
                <AnimatedBorder
                  className="bg-ink-black/70 w-8 md:w-12"
                  origin="left"
                  delay={0.6}
                />
              </div>
              <RevealAnimation>
                <span className="text-[14px] uppercase opacity-70 tracking-wide  whitespace-nowrap">
                  {content.signatureRole}
                </span>
              </RevealAnimation>

              {/* Mobile Profile Image */}
              <div className="mt-10 md:hidden">
                <div
                  ref={mobileImgRef}
                  className="relative w-48 h-64 overflow-hidden"
                >
                  <SeoImage
                    src={content.portrait} alt={content.portraitAlt}
                    description="vasilis-moumkas-profile"
                    location="thessaloniki-greece"
                    fill
                    sizes="220px"
                    className="object-cover"
                  />{content.portraitCaption&&<span className="absolute inset-x-0 bottom-0 bg-ink-black/60 p-2 text-xs text-white">{content.portraitCaption}</span>}
                </div>
              </div>
            </div>

            {/* 3. RIGHT IMAGE (Desktop) */}
            <div className="hidden md:block w-full max-w-55 aspect-3/4 overflow-hidden relative">
              <div
                ref={rightImgRef}
                className="relative w-full h-full grayscale hover:grayscale-0 transition-all duration-700"
              >
                <SeoImage
                  src={content.cameraPortrait} alt={content.cameraAlt}
                  description="photographer-at-work-editorial-eye"
                  location="greece-italy"
                  fill
                  sizes="180px"
                  className="object-cover"
                />{content.cameraCaption&&<span className="absolute inset-x-0 bottom-0 bg-ink-black/60 p-2 text-xs text-white">{content.cameraCaption}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutQuoteSection;
