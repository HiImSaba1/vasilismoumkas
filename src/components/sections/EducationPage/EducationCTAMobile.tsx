"use client";

import React, { useRef, useState, useEffect } from "react";
import CTAButton from "@/components/ui/CTAButton";
import ParallaxImage from "@/components/animations/ParallaxImage";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { useInitialLoad } from "@/providers/InitialLoadContext";

if (typeof window !== "undefined") {
  gsap.registerPlugin(SplitText);
}

const EducationCTAMobile = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const descRef = useRef<HTMLSpanElement>(null);
  const visualWrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  const [hasMounted, setHasMounted] = useState(false);
  const { isFirstVisit } = useInitialLoad();
  const mainEntranceDelay = isFirstVisit ? 0.2 : 0.6;

  useEffect(() => {
    setHasMounted(true);
  }, []);

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

      // 2. Create the overflow hidden wrappers for each word
      [splitLabel, splitTitle, splitPara].forEach((split) => {
        split.words.forEach((word) => {
          const wrapper = document.createElement("div");
          wrapper.style.cssText =
            "display:inline-block; overflow:hidden; vertical-align:top;";
          word.parentNode?.insertBefore(wrapper, word);
          wrapper.appendChild(word);
        });
      });

      // 3. Set Initial States
      gsap.set([splitLabel.words, splitTitle.words, splitPara.words], {
        y: "105%",
      });
      gsap.set(visualWrapperRef.current, { scale: 1.05, opacity: 0 });
      gsap.set(buttonRef.current, { opacity: 0, y: 20 });

      const tl = gsap.timeline({ delay: mainEntranceDelay });

      // 4. Animation Sequence
      tl.to(visualWrapperRef.current, {
        opacity: 1,
        scale: 1,
        duration: 1.2,
        ease: "power3.out",
      })
        .to(
          splitLabel.words,
          {
            y: "0%",
            duration: 0.6,
            stagger: 0.1,
            ease: "power4.out",
          },
          "-=0.8",
        )
        .to(
          splitTitle.words,
          {
            y: "0%",
            duration: 0.8,
            stagger: 0.12,
            ease: "power2.out",
          },
          "-=0.7",
        )
        .to(
          splitPara.words,
          {
            y: "0%",
            duration: 0.6,
            stagger: 0.02,
            ease: "power4.out",
          },
          "-=0.8",
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

      return () => {
        splitLabel.revert();
        splitTitle.revert();
        splitPara.revert();
      };
    },
    { scope: containerRef, dependencies: [hasMounted, isFirstVisit] },
  );

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-screen bg-off-white px-4 pt-20 flex flex-col justify-center gap-10"
    >
      {/* 1. Elevate Title */}
      <div className="w-full">
        <span
          ref={titleRef}
          className="text-[65px] leading-[0.9] font-light uppercase tracking-tighter text-ink-black block"
        >
          Elevate your <br />
          Artistry & <br />
          Business.
        </span>
      </div>
      {/* 3. Text & 4. Button Container */}
      <div className="flex flex-col gap-8 text-left">
        <div className="space-y-4">
          <span
            ref={labelRef}
            className="text-[14px] uppercase tracking-widest text-ink-black/60 block border-b border-ink-black/30 w-max pb-1"
          >
            Mentorship
          </span>
          <span
            ref={descRef}
            className="block text-xl leading-tight text-ink-black uppercase max-w-75"
          >
            One-on-One education for the modern photographer by Vasilis Moumkas.
          </span>
        </div>
      </div>
      {/* 2. Visual Wrapper (Image) */}
      <div
        ref={visualWrapperRef}
        className="relative w-full aspect-square overflow-hidden shadow-sm"
      >
        <ParallaxImage
          src="/vm_img/Projects/Eirini_Fotis/vasilis_moumkas_eirini_fotis_7.webp"
          alt="Education with Vasilis Moumkas"
          className="w-full h-full object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-ink-black/5 pointer-events-none" />
      </div>
    </section>
  );
};

export default EducationCTAMobile;
