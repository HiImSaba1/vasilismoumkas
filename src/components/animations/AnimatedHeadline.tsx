"use client";

import React, { useRef, useMemo, FC } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";
import AnimatedBorder from "./AnimatedBorder";

gsap.registerPlugin(SplitText);


// Keep the existing entrance and looping choreography; all frames use the approved wording.
const KEYWORDS = {
  part1: ["EDITORIAL", "EDITORIAL", "EDITORIAL", "EDITORIAL"],
  part2: ["WEDDING", "WEDDING", "WEDDING", "WEDDING"],
  part3: ["PHOTOGRAPHY", "PHOTOGRAPHY", "PHOTOGRAPHY", "PHOTOGRAPHY"],
  part4: ["ACROSS", "ACROSS", "ACROSS", "ACROSS"],
  part5: ["GREECE & ITALY", "GREECE & ITALY", "GREECE & ITALY", "GREECE & ITALY"],
};

interface AnimatedHeadlineProps {
  animationDelay: number;
  isMobile?: boolean;
  headlineParts?: string[];
}

const AnimatedHeadline: FC<AnimatedHeadlineProps> = ({
  animationDelay,
  isMobile = false, headlineParts,
}) => {
  const keywords=useMemo(()=>Object.fromEntries(Object.entries(KEYWORDS).map(([key,values],index)=>[key,Array(4).fill(headlineParts?.[index]??values[0])])) as typeof KEYWORDS,[headlineParts]);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const sequenceIndex = useRef(0);
  const activeSplits = useRef<Map<HTMLElement, SplitText>>(new Map());

  useGSAP(() => {
    if (!textRef.current) return;

    const wrapElements = (elements: Element[]) => {
      elements.forEach((el) => {
        const wrapper = document.createElement("div");
        wrapper.style.cssText = "display:inline-block; overflow:hidden; vertical-align:top;";
        el.parentNode?.insertBefore(wrapper, el);
        wrapper.appendChild(el);
      });
    };

    const initSplit = () => {
      if (!textRef.current) return;

      // 1. INITIAL ENTRANCE
      const initialSplit = new SplitText(textRef.current, {
        type: "words,chars",
        wordsClass: "headline-word",
        charsClass: "split-char",
      });

      initialSplit.words.forEach(word => {
        if (word instanceof HTMLElement) {
          word.style.display = "inline-block";
          word.style.whiteSpace = "nowrap";
        }
      });
      const chars = initialSplit.chars;
      const shuffled = [...chars].sort(() => Math.random() - 0.5);

      gsap.set(chars, { yPercent: 120, opacity: 0 });
      gsap.set(textRef.current, { opacity: 1 });

      gsap.to(shuffled, {
        yPercent: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.02,
        ease: "expo.out",
        delay: animationDelay,
        onComplete: () => {
          initialSplit.revert();
          startSwapLoop();
        }
      });
    };

    const startSwapLoop = () => {
      const swappableElements = containerRef.current?.querySelectorAll("[data-key]") as NodeListOf<HTMLElement>;
      
      const loopTl = gsap.timeline({ repeat: -1, delay: 2.5 });

      loopTl.add(() => {
        // Increment index based on the length of our keyword arrays (3)
        sequenceIndex.current = (sequenceIndex.current + 1) % 4;

        swappableElements.forEach((el) => {
          const prev = activeSplits.current.get(el);
          if (prev) prev.revert();

          const key = el.getAttribute("data-key") as keyof typeof KEYWORDS;
          el.textContent = keywords[key][sequenceIndex.current];

          const newSplit = new SplitText(el, { type: "words,chars", wordsClass: "headline-word" });
          newSplit.words.forEach(word => {
            if (word instanceof HTMLElement) {
              word.style.display = "inline-block";
              word.style.whiteSpace = "nowrap";
            }
          });
          activeSplits.current.set(el, newSplit);
          
          wrapElements(newSplit.chars);

          gsap.set(newSplit.chars, { yPercent: 110 });
          gsap.to(newSplit.chars, {
            yPercent: 0,
            duration: 1.4,
            stagger: 0.05,
            ease: "expo.out",
          });
        });
      });

      loopTl.set({}, {}, "+=4.2");
    };

    if (document.fonts.status === 'loaded') {
      initSplit();
    } else {
      document.fonts.ready.then(initSplit);
    }

    return () => {
      activeSplits.current.forEach((split) => split.revert());
    };
  }, { 
    dependencies: [animationDelay, isMobile, keywords],
    scope: containerRef, 
    revertOnUpdate: true 
  });

  return (
    <div ref={containerRef} className="w-full relative overflow-hidden">
      <span
        ref={textRef}
        suppressHydrationWarning
        className={`block w-full uppercase text-center opacity-0 whitespace-normal tracking-tighter ${
          isMobile 
            ? "text-[clamp(32px,6.4vw,40px)] pb-4 px-1"
            : "text-[clamp(48px,8vw,80px)] py-6"
        }`}
        style={{ 
          lineHeight: "1", 
          fontFamily: "var(--font-karena)", 
          fontWeight: "400",
          willChange: "transform, opacity",
        }}
      >
        {isMobile ? (
          <>
            <span className="whitespace-nowrap"><span data-key="part1">{keywords.part1[0]}</span> <span data-key="part2">{keywords.part2[0]}</span></span><br />
            <span className="whitespace-nowrap" data-key="part3">{keywords.part3[0]}</span><br />
            <span><span data-key="part4">{keywords.part4[0]}</span> <span data-key="part5">{keywords.part5[0]}</span></span>
          </>
        ) : (
          <>
            <span data-key="part1">{keywords.part1[0]}</span> <span data-key="part2">{keywords.part2[0]}</span> <br />
            <span data-key="part3">{keywords.part3[0]}</span> <span data-key="part4">{keywords.part4[0]}</span> <span data-key="part5">{keywords.part5[0]}</span>
          </>
        )}
      </span>

      <AnimatedBorder 
        origin="right" 
        duration={1.2} 
        delay={animationDelay - 0.2} 
        className="bg-ink-black" 
      />
    </div>
  );
};

export default AnimatedHeadline;
