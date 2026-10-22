"use client";
import { publicCopy } from "@/app/(site)/data/ApprovedPublicCopy";

import React, { useRef, useState } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Plus, Minus } from "lucide-react";
import AnimatedBorder from "@/components/animations/AnimatedBorder";
import { faqAboutData } from "@/app/(site)/data/FaqAboutData";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

interface FaqItemProps {
  item: (typeof faqAboutData)[0];
  isOpen: boolean;
  onToggle: () => void;
}

const FaqItem = ({ item, isOpen, onToggle }: FaqItemProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const questionRef = useRef<HTMLSpanElement>(null);
  const dateRef = useRef<HTMLSpanElement>(null);

  const transitionBase =
    "transition-all duration-500 cubic-bezier(0.215, 0.61, 0.355, 1)";

  useGSAP(
    () => {
      if (!questionRef.current || !dateRef.current) return;
      const splitQ = new SplitText(questionRef.current, { type: "words" });
      const splitD = new SplitText(dateRef.current, { type: "words" });

      [splitQ, splitD].forEach((split) => {
        split.words.forEach((word) => {
          const wrap = document.createElement("div");
          wrap.style.cssText =
            "display:inline-block; overflow:hidden; vertical-align:top;";
          word.parentNode?.insertBefore(wrap, word);
          wrap.appendChild(word);
        });
      });

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
            start: "top 90%",
            toggleActions: "play reverse play reverse",
          },
        },
      );
    },
    { scope: containerRef },
  );

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
          "-=0.2",
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
    { dependencies: [isOpen], scope: containerRef },
  );

  return (
    <div
      ref={containerRef}
      className="group relative w-full border-t border-ink-black/10 overflow-hidden"
    >
      <div
        className={`absolute inset-0 bg-ink-black z-0 -translate-y-[115%] -rotate-2 group-hover:translate-y-0 group-hover:rotate-0 ${transitionBase}`}
      />
      <button
        onClick={onToggle}
        className="relative z-10 w-full flex flex-col items-start pt-6 pb-4 px-4 text-left"
      >
        <div className="w-full flex justify-between items-center mb-2">
          <span
            ref={dateRef}
            className="text-[10px] uppercase tracking-widest text-ink-black/60 group-hover:text-red-500 transition-colors"
          >
            {item.date}
          </span>
          <span className="text-[10px] uppercase flex items-center gap-2 text-ink-black group-hover:text-red-500 transition-colors">
            {isOpen ? (
              <Minus className="w-3 h-3" />
            ) : (
              <Plus className="w-3 h-3" />
            )}
          </span>
        </div>
        <div className="w-full flex justify-between items-end">
          <span
            ref={questionRef}
            className="text-xl md:text-2xl lg:text-3xl leading-[1.1] uppercase tracking-tighter text-ink-black group-hover:text-off-white transition-colors duration-500"
          >
            {item.question}
          </span>
        </div>
      </button>
      <div
        ref={contentRef}
        className="relative z-10 overflow-hidden"
        style={{ height: 0, opacity: 0 }}
      >
        <div className="px-4 pb-8 pt-2">
          <div
            className="text-sm md:text-base leading-relaxed uppercase tracking-tight text-ink-black/80 group-hover:text-off-white/90 flex flex-wrap gap-x-[0.3em]"
            style={{ fontFamily: "var(--font-karena)" }}
          >
            {item.answer.split(" ").map((word, i) => (
              <span key={i} className="inline-block overflow-hidden">
                <span className="faq-word-inner inline-block opacity-0">
                  {word}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const AboutFaqSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLHeadingElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);

  const leftCol = faqAboutData.slice(0, 4);
  const rightCol = faqAboutData.slice(4, 8);

  useGSAP(
    () => {
      const splitH = new SplitText(headerRef.current, { type: "words" });
      const splitP = new SplitText(paragraphRef.current, { type: "lines" });

      [splitH.words, splitP.lines].flat().forEach((el) => {
        const wrap = document.createElement("div");
        wrap.style.cssText =
          "display:block; overflow:hidden; vertical-align:top;";
        el.parentNode?.insertBefore(wrap, el);
        wrap.appendChild(el);
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          toggleActions: "play reverse play reverse",
        },
      });

      tl.from(splitH.words, {
        yPercent: 100,
        duration: 1,
        stagger: 0.05,
        ease: "power2.out",
      }).from(
        splitP.lines,
        {
          yPercent: 105,
          opacity: 0,
          duration: 1,
          stagger: 0.1,
          ease: "power3.out",
        },
        "-=0.6",
      );
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-off-white py-6 px-4 md:px-10 z-10"
    >
      <div className="max-w-full mx-auto">
        {/* Updated 2/3 + 1/3 Header Grid */}
        <div className="mb-16">
          <AnimatedBorder origin="left" className="bg-ink-black/20 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-6">
              <span
                ref={headerRef}
                className="text-[clamp(32px,5vw,75px)] leading-[1.1] font-light uppercase tracking-tighter text-ink-black"
              >
                Common Questions
              </span>
            </div>
            <div className="lg:col-span-6">
              <span
                ref={paragraphRef}
                className="text-[13px] md:text-sm leading-tight uppercase tracking-tight text-ink-black/60 max-w-sm"
              >
                {publicCopy.aboutFaqIntro}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 items-start ">
          <div className="flex flex-col">
            {leftCol.map((item, index) => (
              <FaqItem
                key={index}
                item={item}
                isOpen={openIndex === index}
                onToggle={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
              />
            ))}
          </div>
          <div className="flex flex-col">
            {rightCol.map((item, index) => (
              <FaqItem
                key={index + 4}
                item={item}
                isOpen={openIndex === index + 4}
                onToggle={() =>
                  setOpenIndex(openIndex === index + 4 ? null : index + 4)
                }
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutFaqSection;
