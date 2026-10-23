"use client";

import {contentWords} from "@/lib/content-text";
import {InlineContent} from "@/components/ui/InlineContent";
import React, { useRef, useState } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Plus, Minus, ArrowUpRight } from "lucide-react";
import AnimatedBorder from "@/components/animations/AnimatedBorder";
import CTAButton from "@/components/ui/CTAButton";
import { faqData } from "@/app/(site)/data/FaqData";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

interface FaqItemProps {
  item: (typeof faqData)[0];
  isOpen: boolean;
  onToggle: () => void;
}

const FaqItem = ({ item, isOpen, onToggle }: FaqItemProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const questionRef = useRef<HTMLSpanElement>(null);
  const dateRef = useRef<HTMLSpanElement>(null);

  const transitionBase = "transition-all duration-500 cubic-bezier(0.215, 0.61, 0.355, 1)";

  // Intro Animation (Hero Style) - Updated to Replay
  useGSAP(
    () => {
      if (!questionRef.current || !dateRef.current) return;

      const splitQ = new SplitText(questionRef.current, { type: "words" });
      const splitD = new SplitText(dateRef.current, { type: "words" });

      [splitQ, splitD].forEach((split) => {
        split.words.forEach((word) => {
          const wrap = document.createElement("div");
          wrap.style.cssText = "display:inline-block; overflow:hidden; vertical-align:top;";
          word.parentNode?.insertBefore(wrap, word);
          wrap.appendChild(word);
        });
      });

      // Use fromTo with toggleActions for reliable replaying
      gsap.fromTo(
        [splitD.words, splitQ.words],
        { yPercent: 105 },
        {
          yPercent: 0,
          duration: 1,
          stagger: 0.05,
          ease: "power4.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
            toggleActions: "play reverse play reverse", // Replays on scroll up/down
          },
        }
      );
    },
    { scope: containerRef }
  );

  // Accordion Toggle Animation (Stays as is)
  useGSAP(
    () => {
      if (isOpen) {
        const tl = gsap.timeline();
        tl.to(contentRef.current, {
          height: "auto",
          opacity: 1,
          duration: 0.5,
          ease: "power3.inOut",
        }).fromTo(
          gsap.utils.toArray(".faq-word-inner", containerRef.current),
          { yPercent: 100, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.4,
            stagger: 0.008,
            ease: "power3.out",
          },
          "-=0.2"
        );
      } else {
        gsap.to(contentRef.current, {
          height: 0,
          opacity: 0,
          duration: 0.4,
          ease: "power3.inOut",
        });
      }
    },
    { dependencies: [isOpen], scope: containerRef }
  );

  return (
    <div ref={containerRef} className="group relative w-full border-t border-ink-black/10 overflow-hidden">
      <div className={`absolute inset-0 bg-ink-black z-0 -translate-y-[115%] -rotate-2 group-hover:translate-y-0 group-hover:rotate-0 ${transitionBase}`} />
      
      <div className="absolute top-0 left-0 w-full z-20 pointer-events-none">
        <AnimatedBorder origin="left" className="bg-ink-black/80" duration={1.2} />
      </div>

      <button onClick={onToggle} className="relative z-10 w-full flex flex-col items-start pt-6 pb-4 px-2 md:p-6 text-left">
        <div className="w-full flex justify-between items-center mb-3 md:px-2">
          <span ref={dateRef} className="text-[10px] md:text-sm  uppercase tracking-wide transition-colors duration-500 text-ink-black/70 group-hover:text-red-500">
            {item.date}
          </span>
          <span className={`text-[10px] md:text-sm  uppercase tracking-wide flex items-center gap-2 text-ink-black group-hover:text-red-500 ${transitionBase}`}>
            {isOpen ? "Close" : "Read More"}
            {isOpen ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
          </span>
        </div>

        <div className="w-full md:px-2 flex justify-between items-end">
          <span ref={questionRef} className={`text-[clamp(22px,5vw,50px)] leading-[1.1] uppercase tracking-tighter text-ink-black group-hover:text-off-white max-w-[90%] md:max-w-[85%] ${transitionBase}`}>
            {item.question}
          </span>
          <div className="hidden md:block overflow-hidden">
            <ArrowUpRight className={`w-10 h-10 text-red-500 translate-y-[150%] opacity-0 -rotate-190 group-hover:translate-y-0 group-hover:opacity-100 ${transitionBase}`} />
          </div>
        </div>
      </button>

      <div ref={contentRef} className="relative z-10 overflow-hidden bg-transparent" style={{ height: 0, opacity: 0 }}>
        <div className="px-2 md:px-8 pb-10 pt-2">
          <div className="grid grid-cols-12 w-full">
            <div className="col-span-12 lg:col-start-4 lg:col-span-8">
              <div className="text-md md:text-2xl leading-[1.4] uppercase tracking-tight text-ink-black/80 group-hover:text-off-white/90 flex flex-wrap gap-x-[0.3em]" style={{ fontFamily: "var(--font-karena)" }}>
                {contentWords(item.answer).map((word, i) => (
                  <span key={i} className="inline-block overflow-hidden">
                    <span className="faq-word-inner inline-block opacity-0"><InlineContent text={word}/></span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ServicesFaqSection = ({items=faqData,heading="Photography\nProcess & Journey",buttonLabel="Inquire Now",buttonHref="/contact"}:{items?:typeof faqData;heading?:string;buttonLabel?:string;buttonHref?:string}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLHeadingElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const splitH = new SplitText(headerRef.current, { type: "words" });
      const splitB = new SplitText(buttonRef.current, { type: "words" });

      [splitH, splitB].forEach((split) => {
        split.words.forEach((word) => {
          const wrap = document.createElement("div");
          wrap.style.cssText = "display:inline-block; overflow:hidden; vertical-align:top;";
          word.parentNode?.insertBefore(wrap, word);
          wrap.appendChild(word);
        });
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
          toggleActions: "play reverse play reverse",
        },
      });

      tl.from(splitH.words, {
        yPercent: 100,
        duration: 1.1,
        stagger: 0.1,
        ease: "power2.out",
      }).from(
        splitB.words,
        { yPercent: 100, duration: 1, stagger: 0.08, ease: "power2.out" },
        "-=0.4"
      );
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="relative w-full bg-off-white py-24 px-4 z-10">
      <div className="mx-auto max-w-full">
        <div className="grid grid-cols-12 w-full mb-12 items-end gap-6 relative">
          <div className="absolute top-0 left-0 w-full z-20 pointer-events-none">
            <AnimatedBorder origin="left" className="bg-ink-black/80" duration={1.2} />
          </div>
          <div className="col-span-12 lg:col-span-8 pt-10 md:pl-4">
            <h2 ref={headerRef} className="text-[clamp(32px,6vw,70px)] leading-[0.85] font-light uppercase tracking-tighter text-ink-black">
              {heading.split("\n").map((line,i)=><React.Fragment key={i}>{i>0&&<br/>}{line}</React.Fragment>)}
            </h2>
          </div>
          <div ref={buttonRef} className="col-span-12 lg:col-span-4 flex justify-start lg:justify-end pb-4">
            <CTAButton href={buttonHref}>{buttonLabel}</CTAButton>
          </div>
        </div>
        <div className="border-b border-ink-black/80">
          {items.map((item, index) => (
            <FaqItem
              key={index}
              item={item}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesFaqSection;