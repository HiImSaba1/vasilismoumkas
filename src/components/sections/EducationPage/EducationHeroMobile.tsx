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


const EducationHeroMobile = () => {
  const {hero}=useEducationContent();
  const KEYWORDS=hero.keywords;
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const descRef = useRef<HTMLSpanElement>(null);
  const visualWrapperRef = useRef<HTMLDivElement>(null);

  const mounted=useEducationMounted();
  const { isFirstVisit } = useInitialLoad();
  const mainEntranceDelay = isFirstVisit ? 0.2 : 0.6;

  const sequenceIndex = useRef(0);
  const activeSplits = useRef<Map<HTMLElement, SplitText>>(new Map());

  useGSAP(
    () => {
      if (!mounted || !headlineRef.current) return;

      const headlineItems = Array.from(headlineRef.current.children) as HTMLElement[];

      headlineItems.forEach((el) => {
        const key = el.getAttribute("data-key") as keyof typeof KEYWORDS;
        el.textContent = KEYWORDS[key][0];
      });

      // Fix: Use words,chars to prevent awkward line breaks mid-word
      const splitHeadline = new SplitText(headlineItems, { type: "words,chars" });
      const splitLabel = new SplitText(labelRef.current!, { type: "words,chars" });
      const splitDesc = new SplitText(descRef.current!, { type: "words,chars" });

      activeSplits.current.set(headlineRef.current!, splitHeadline);
      activeSplits.current.set(labelRef.current!, splitLabel);
      activeSplits.current.set(descRef.current!, splitDesc);

      const wrapChars = (chars: Element[]) => {
        chars.forEach((char) => {
          const wrapper = document.createElement("div");
          wrapper.style.cssText = "display:inline-block; overflow:hidden; vertical-align:top;";
          char.parentNode?.insertBefore(wrapper, char);
          wrapper.appendChild(char);
        });
      };

      wrapChars(splitHeadline.chars);
      wrapChars(splitLabel.chars);
      wrapChars(splitDesc.chars);

      gsap.set(visualWrapperRef.current, { scale: 1.1, opacity: 0 });
      gsap.set([...splitHeadline.chars, ...splitLabel.chars, ...splitDesc.chars], {
        y: "115%",
        rotationX: -80,
      });

      const mainTl = gsap.timeline({ delay: mainEntranceDelay });

      mainTl
        .to(visualWrapperRef.current, {
          opacity: 1,
          scale: 1,
          duration: 1.8,
          ease: "expo.out",
        })
        .to(
          splitHeadline.chars,
          {
            y: "0%",
            rotationX: 0,
            duration: 1.4,
            stagger: 0.015,
            ease: "power3.out",
          },
          "-=1.4"
        )
        .to(
          [splitLabel.chars, splitDesc.chars],
          {
            y: "0%",
            rotationX: 0,
            duration: 1,
            stagger: 0.008,
            ease: "power3.out",
          },
          "-=0.8"
        );

      const loopTl = gsap.timeline({ repeat: -1, delay: 4 });

      loopTl.add(() => {
        sequenceIndex.current = (sequenceIndex.current + 1) % 4;
        headlineItems.forEach((el) => {
          const prev = activeSplits.current.get(el);
          if (prev) prev.revert();
          const key = el.getAttribute("data-key") as keyof typeof KEYWORDS;
          el.textContent = KEYWORDS[key][sequenceIndex.current];
          const newSplit = new SplitText(el, { type: "words,chars" });
          activeSplits.current.set(el, newSplit);
          wrapChars(newSplit.chars);
          gsap.set(newSplit.chars, { y: "110%", rotationX: -90 });
          gsap.to(newSplit.chars, {
            y: "0%",
            rotationX: 0,
            duration: 1,
            stagger: 0.04,
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
      className="relative w-full h-dvh overflow-hidden flex flex-col justify-between py-16 px-1 bg-off-white"
    >
      {/* FULL SCREEN BACKGROUND IMAGE LAYER */}
      <div
        ref={visualWrapperRef}
        className="absolute inset-0 z-10 opacity-0 pointer-events-none"
      >
        <div className="relative w-full h-full">
          <ParallaxImage
            src={hero.mobileImage.src}
            alt={hero.mobileImage.alt}
            fill={true}
            className="w-full h-full object-cover grayscale-[0.2]"
          />
          {/* OFF-WHITE/40 OVERLAY */}
          <div className="absolute inset-0 bg-ink-black/30 z-20" />
        </div>
      </div>

      {/* 1. TOP TITLES - z-30 to stay above image */}
      <div className="grow flex items-center justify-center relative z-30">
        <span
          ref={headlineRef}
          className="flex flex-col w-full text-soft-yellow text-[clamp(40px,16vw,45px)] leading-[1.2] uppercase tracking-[-0.03em] text-center"
        >
          {/* white-space: nowrap prevents mid-word snapping */}
          <span data-key="photography" className="block whitespace-nowrap"></span>
          <span data-key="sessions" className="block whitespace-nowrap"></span>
          <span data-key="oneOnOne" className="block whitespace-nowrap"></span>
          <span data-key="bill" className="block whitespace-nowrap"></span>
          <span data-key="seminar" className="block whitespace-nowrap"></span>
        </span>
      </div>

      {/* 2. MIDDLE LABEL */}
      <div className="w-full text-center relative z-30 mb-4">
        <span
          ref={labelRef}
          className="text-[10px] uppercase tracking-[0.2em] text-off-white/90 block whitespace-nowrap"
        >
          {hero.label}
        </span>
      </div>

      {/* 3. BOTTOM DESCRIPTION */}
      <div className="w-full text-center relative z-30 pb-4">
        <span
          ref={descRef}
          className="block text-[14px] leading-tight text-soft-yellow uppercase max-w-[90%] mx-auto"
        >
          {hero.introduction.split("\n").map((line,index)=><React.Fragment key={index}>{index>0&&<br/>}{line}</React.Fragment>)}
        </span>
      </div>
    </section>
  );
};

export default EducationHeroMobile;