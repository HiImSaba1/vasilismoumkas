"use client";

import {useEducationContent} from "@/providers/EducationContentContext";
import React, { useRef } from "react";
import {useEducationMounted} from "./useEducationViewport";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { useInitialLoad } from "@/providers/InitialLoadContext";
import ParallaxImage from "@/components/animations/ParallaxImage";

if (typeof window !== "undefined") {
  gsap.registerPlugin(SplitText);
}


const EducationHeroDesktop = () => {
  const {hero}=useEducationContent();
  const KEYWORDS=hero.keywords;
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const visualWrapperRef = useRef<HTMLDivElement>(null);

  const mounted=useEducationMounted();
  const { isFirstVisit } = useInitialLoad();
  
  // Added + 0.4s delay as requested
  const mainEntranceDelay = (isFirstVisit ? 0.2 : 0.6) + 0.4;

  const sequenceIndex = useRef(0);
  const activeSplits = useRef<Map<HTMLElement, SplitText>>(new Map());

  useGSAP(
    () => {
      if (!mounted || !headlineRef.current || !labelRef.current || !descRef.current) return;

      const headlineItems = Array.from(headlineRef.current.children) as HTMLElement[];

      // INITIAL TEXT
      headlineItems.forEach((el) => {
        const key = el.getAttribute("data-key") as keyof typeof KEYWORDS;
        el.textContent = KEYWORDS[key][0];
      });

      // INITIAL SPLIT
      const splitHeadline = new SplitText(headlineItems, { type: "chars" });
      const splitLabel = new SplitText(labelRef.current, { type: "chars" });
      const splitDesc = new SplitText(descRef.current, { type: "lines" });

      activeSplits.current.set(headlineRef.current, splitHeadline);
      activeSplits.current.set(labelRef.current, splitLabel);
      activeSplits.current.set(descRef.current, splitDesc);

      // WRAPPER
      const wrapElements = (elements: Element[]) => {
        elements.forEach((el) => {
          const wrapper = document.createElement("div");
          wrapper.style.cssText = "display:inline-block; overflow:hidden; vertical-align:top;";
          el.parentNode?.insertBefore(wrapper, el);
          wrapper.appendChild(el);
        });
      };

      wrapElements(splitHeadline.chars);
      wrapElements(splitLabel.chars);
      wrapElements(splitDesc.lines);

      // PREVENT FLICKER: 
      // Set the hidden position and immediately toggle visibility on
      gsap.set(visualWrapperRef.current, { scale: 1.04, opacity: 0 });
      gsap.set(
        [...splitHeadline.chars, ...splitLabel.chars, ...splitDesc.lines],
        { yPercent: 110 }
      );
      
      // Make parents visible now that items are tucked away
      gsap.set([headlineRef.current, labelRef.current, descRef.current], { autoAlpha: 1 });

      // MAIN ENTRANCE
      const mainTl = gsap.timeline({ delay: mainEntranceDelay });

      mainTl
        .to(visualWrapperRef.current, {
          opacity: 1,
          scale: 1,
          duration: 2.2,
          ease: "expo.out",
        })
        .to(
          splitHeadline.chars,
          {
            yPercent: 0,
            duration: 1.6,
            stagger: 0.02,
            ease: "power3.out",
          },
          "-=1.8"
        )
        .to(
          splitLabel.chars,
          {
            yPercent: 0,
            duration: 1.2,
            stagger: 0.015,
            ease: "power3.out",
          },
          "-=1.5"
        )
        .to(
          splitDesc.lines,
          {
            yPercent: 0,
            duration: 1.2,
            stagger: 0.1,
            ease: "power3.out",
          },
          "-=1.3"
        );

      // DYNAMIC LOOP
      const loopTl = gsap.timeline({ repeat: -1, delay: 1.2 });
      loopTl.add(() => {
        sequenceIndex.current = (sequenceIndex.current + 1) % 4;
        headlineItems.forEach((el) => {
          const prev = activeSplits.current.get(el);
          if (prev) prev.revert();
          const key = el.getAttribute("data-key") as keyof typeof KEYWORDS;
          el.textContent = KEYWORDS[key][sequenceIndex.current];
          const newSplit = new SplitText(el, { type: "chars" });
          activeSplits.current.set(el, newSplit);
          wrapElements(newSplit.chars);
          gsap.set(newSplit.chars, { yPercent: 110 });
          gsap.to(newSplit.chars, {
            yPercent: 0,
            duration: 1.2,
            stagger: 0.06,
            ease: "expo.out",
          });
        });
      });
      loopTl.set({}, {}, "+=4");

      return () => {
        activeSplits.current.forEach((split) => split.revert());
      };
    },
    { scope: containerRef, dependencies: [mounted] }
  );

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden flex flex-col justify-between py-16 px-[4%] bg-off-white"
    >
      <div className="grow flex items-center justify-center relative py-2">
        {/* Added opacity-0 to prevent flicker */}
        <span
          ref={headlineRef}
          className="opacity-0 relative z-20 flex flex-col w-full text-ink-black md:text-[clamp(68px,11vw,100px)] lg:text-[clamp(80px,12vw,125px)] leading-[0.9] uppercase tracking-[-0.06em]"
        >
          <div data-key="photography" className="text-left"></div>
          <div data-key="sessions" className="text-center"></div>
          <div data-key="oneOnOne" className="text-right"></div>
          <div data-key="bill" className="text-center"></div>
          <div data-key="seminar" className="text-left"></div>
        </span>

        <div
          ref={visualWrapperRef}
          className="absolute inset-0 z-10 w-full h-full opacity-0 pointer-events-none"
        >
          <div className="absolute left-0 top-30 lg:top-40 w-[12vw] aspect-square overflow-hidden rounded-sm translate-y-[-10%]">
            <ParallaxImage
              src={hero.images[0].src}
              alt={hero.images[0].alt}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30vw] lg:w-[18vw] aspect-square overflow-hidden rounded-sm">
            <ParallaxImage
              src={hero.images[1].src}
              alt={hero.images[1].alt}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute right-0 bottom-0 lg:bottom-6 w-[15vw] lg:w-[12vw] lg:aspect-square overflow-hidden rounded-sm translate-y-[10%]">
            <ParallaxImage
              src={hero.images[2].src}
              alt={hero.images[2].alt}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col gap-4 relative z-20">
        <div className="text-left">
          <span
            ref={labelRef}
            className="opacity-0 inline-block text-sm uppercase tracking-widest text-ink-black/60 font-medium"
          >
            {hero.label}
          </span>
        </div>

        <div className="flex justify-center md:justify-end items-baseline">
          <p
            ref={descRef}
            className="opacity-0 text-center md:text-right text-lg md:text-2xl leading-none text-ink-black uppercase max-w-180 lg:max-w-220"
          >
            {hero.introduction.split("\n").map((line,index)=><React.Fragment key={index}>{index>0&&<br/>}{line}</React.Fragment>)}
          </p>
        </div>
      </div>
    </section>
  );
};

export default EducationHeroDesktop;