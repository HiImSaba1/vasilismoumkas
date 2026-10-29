"use client";

import React, { useRef } from "react";
import {useEducationMounted} from "./useEducationViewport";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import {useEducationContent} from "@/providers/EducationContentContext";
import { useInitialLoad } from "@/providers/InitialLoadContext";
import ParallaxImage from "@/components/animations/ParallaxImage";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

const EducationCTADesktop = () => {
  const {closing}=useEducationContent();
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const imgElementRef = useRef<HTMLImageElement>(null);

  const titleRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const descRef = useRef<HTMLSpanElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  const hasMounted=useEducationMounted();
  const { isFirstVisit } = useInitialLoad();
  const mainEntranceDelay = isFirstVisit ? 0.2 : 0.6;

  useGSAP(
    () => {
      if (
        !hasMounted ||
        !titleRef.current ||
        !descRef.current ||
        !labelRef.current
      )
        return;

      // 1. Split Text into words
      const splitLabel = new SplitText(labelRef.current, { type: "words" });
      const splitTitle = new SplitText(titleRef.current, { type: "words" });
      const splitPara = new SplitText(descRef.current, { type: "words" });

      // 2. Create the overflow hidden wrappers
      [splitLabel, splitTitle, splitPara].forEach((split) => {
        split.words.forEach((word) => {
          const wrapper = document.createElement("div");
          wrapper.style.cssText =
            "display:inline-block; overflow:hidden; vertical-align:top;";
          word.parentNode?.insertBefore(wrapper, word);
          wrapper.appendChild(word);
        });
      });

      // 3. Set Initial States for Entrance
      gsap.set([splitLabel.words, splitTitle.words, splitPara.words], {
        y: "105%",
      });
      gsap.set(buttonRef.current, { opacity: 0, y: 20 });

      // --- ENTRANCE TIMELINE ---
      const entranceTl = gsap.timeline({ delay: mainEntranceDelay });

      entranceTl
        .to(splitLabel.words, {
          y: "0%",
          duration: 0.6,
          stagger: 0.1,
          ease: "power4.out",
        })
        .to(
          splitTitle.words,
          {
            y: "0%",
            duration: 0.8,
            stagger: 0.12,
            ease: "power2.out",
          },
          "-=0.4",
        )
        .to(
          splitPara.words,
          {
            y: "0%",
            duration: 0.6,
            stagger: 0.02,
            ease: "power4.out",
          },
          "-=0.6",
        )
        .to(
          buttonRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
          },
          "-=0.4",
        );

      // --- SCROLL ANIMATION ---
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=100%",
          scrub: true,
          pin: true,
          anticipatePin: 1,
        },
      });

      scrollTl.fromTo(
        imageContainerRef.current,
        { width: "40%", height: "60vh" },
        { width: "100%", height: "100vh", ease: "none" },
        0,
      );

      scrollTl.fromTo(
        imgElementRef.current,
        { scale: 1.4 },
        { scale: 1, ease: "none" },
        0,
      );

      return () => {
        splitLabel.revert();
        splitTitle.revert();
        splitPara.revert();
      };
    },
    { scope: sectionRef, dependencies: [hasMounted, isFirstVisit] },
  );

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-screen bg-off-white overflow-hidden"
    >
      <div className="absolute inset-0 z-20 pointer-events-none flex items-center px-4 md:px-10">
        <div className="grid grid-cols-12 w-full items-start gap-4">
          <div className="col-span-12 md:col-span-7 pointer-events-auto">
            <span
              ref={titleRef}
              className="text-[clamp(40px,10vw,70px)] lg:text-[clamp(98px,12vw,100px)] leading-[0.85] font-light uppercase tracking-tighter text-ink-black block"
            >
              {closing.titleLines.map((line,index)=><React.Fragment key={index}>{index>0&&<br/>}{line}</React.Fragment>)}
            </span>
          </div>
          <div className="col-span-12 md:col-span-5 pointer-events-auto flex flex-col justify-between h-full ">
            <div className="space-y-2 mb-4">
              <span
                ref={labelRef}
                className="text-[16px] uppercase tracking-widest text-ink-black/80 block border-b border-ink-black/80 w-max"
              >
                {closing.label}
              </span>
              <span
                ref={descRef}
                className="text-lg md:text-4xl leading-tight text-ink-black uppercase block max-w-xl"
              >
                {closing.description}
              </span>
            </div>

          </div>
        </div>
      </div>

      {/* Scaling Image Container */}
      <div className="relative w-full h-full flex items-center justify-center z-10">
  <div
    ref={imageContainerRef}
    className="relative overflow-hidden will-change-[width,height] flex items-center justify-center"
  >
    <ParallaxImage 
      src={closing.desktopImage.src}
      alt={closing.desktopImage.alt}
      className="w-full h-full" 
      sizes="80vw"
    />
    
    <div className="absolute inset-0 bg-off-white/30 pointer-events-none" />
  </div>
</div>
    </section>
  );
};

export default EducationCTADesktop;
