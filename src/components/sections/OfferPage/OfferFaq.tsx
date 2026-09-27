"use client";

import React, { useRef, useState } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Plus, Minus } from "lucide-react";
import AnimatedBorder from "@/components/animations/AnimatedBorder";
import {
  faqOfferData,
  faqBaptismOfferData,
} from "@/app/(site)/data/FaqOfferData";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

interface FaqItemProps {
  item: { question: string; answer: string; date: string };
  isOpen: boolean;
  onToggle: () => void;
  lang: "en" | "gr";
}

const FaqItem = ({ item, isOpen, onToggle, lang }: FaqItemProps) => {
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
            toggleActions: "play none none none",
            once: true,
          },
        },
      );
    },
    { scope: containerRef, dependencies: [lang] },
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
            className="text-[14px] uppercase tracking-widest text-ink-black/60 group-hover:text-red-500 transition-colors"
          >
            {item.date}
          </span>
          <span className="text-[14px] uppercase flex items-center gap-2 text-ink-black group-hover:text-red-500 transition-colors">
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
            className="text-xl lg:text-2xl leading-[1.1] text-ink-black group-hover:text-off-white transition-colors duration-500"
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
            className="text-md md:text-xl text-ink-black/80 group-hover:text-off-white/90 flex flex-wrap gap-x-[0.3em]"
            style={{ fontFamily: "var(--font-karena)" }}
          >
            {item.answer.split(" ").map((word, i) => (
              <span
                key={i}
                className="inline-block overflow-hidden text-xl leading-none"
              >
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

const translations = {
  en: {
    wedding: {
      title: "The Process & FAQ",
      para: "Choosing your wedding photographer is a once-in-a-lifetime decision an investment in how your story will be remembered. Below you will find the journey we take together and answers to common questions.",
    },
    baptism: {
      title: "The Process & FAQ",
      para: "Documenting your child's christening is a beautiful milestonean investment in preserving your family's history. Below you will find our custom workflow details and answers to common planning questions.",
    },
  },
  gr: {
    wedding: {
      title: "Η Διαδικασία & Συχνές Ερωτήσεις",
      para: "Η επιλογή του φωτογράφου του γάμου σας είναι μια απόφαση ζωής μια επένδυση στο πώς θα θυμάστε την ιστορία σας. Παρακάτω θα βρείτε τη διαδρομή που ακολουθούμε μαζί και απαντήσεις σε συνηθισμένες ερωτήσεις.",
    },
    baptism: {
      title: "Η Διαδικασία & Συχνές Ερωτήσεις",
      para: "Η φωτογράφιση της βάπτισης του παιδιού σας είναι ένας σημαντικός σταθμόςμια επένδυση στη διαφύλαξη της οικογενειακής σας ιστορίας. Παρακάτω θα βρείτε αναλυτικά τη διαδικασία και απαντήσεις σε συνηθισμένες ερωτήσεις.",
    },
  },
};

interface OfferFaqSectionProps {
  lang?: "en" | "gr";
  type?: "wedding" | "baptism";
}

const OfferFaqSection = ({
  lang = "en",
  type = "wedding",
}: OfferFaqSectionProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLHeadingElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);

  const currentSource = type === "baptism" ? faqBaptismOfferData : faqOfferData;
  const data = currentSource[lang];

  const half = Math.ceil(data.length / 2);
  const leftCol = data.slice(0, half);
  const rightCol = data.slice(half);

  const t = translations[lang][type];

  useGSAP(
    () => {
      const splitH = new SplitText(headerRef.current, { type: "words" });

      // FIXED HERE: We split by words instead of lines to ensure perfect CSS layout text wrap rules are preserved
      const splitP = new SplitText(paragraphRef.current, { type: "words" });

      splitH.words.forEach((word) => {
        const wrap = document.createElement("div");
        wrap.style.cssText =
          "display:inline-block; overflow:hidden; vertical-align:top; margin-right: 0.2em;";
        word.parentNode?.insertBefore(wrap, word);
        wrap.appendChild(word);
      });

      // FIXED HERE: Wrap paragraph words smoothly without forcing layout breaking line gaps
      splitP.words.forEach((word) => {
        const wrap = document.createElement("div");
        wrap.style.cssText =
          "display:inline-block; overflow:hidden; vertical-align:top; margin-right: 0.23em;";
        word.parentNode?.insertBefore(wrap, word);
        wrap.appendChild(word);
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
          once: true,
        },
      });

      tl.from(splitH.words, {
        yPercent: 100,
        duration: 1,
        stagger: 0.05,
        ease: "power2.out",
      }).fromTo(
        splitP.words,
        { yPercent: 105, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.006, // Fast, beautiful word stagger mimicking a smooth line transition layout!
          ease: "power3.out",
        },
        "-=0.7",
      );
    },
    { scope: sectionRef, dependencies: [lang, type] },
  );

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-off-white py-20 px-4 md:px-10 z-10"
    >
      <div className="max-w-full mx-auto">
        <div className="mb-16">
          <AnimatedBorder origin="left" className="bg-ink-black/20 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-6">
              <span
                ref={headerRef}
                className="text-[clamp(32px,5vw,70px)] leading-[1.1]  text-ink-black flex flex-wrap"
              >
                {t.title}
              </span>
            </div>
            <div className="lg:col-span-2"></div>
            <div className="lg:col-span-4">
              <div className="overflow-hidden w-full">
                <span
                  ref={paragraphRef}
                  className="text-[13px] md:text-lg leading-tight text-ink-black/80 max-w-md flex flex-wrap"
                >
                  {t.para}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 items-start">
          <div className="flex flex-col">
            {leftCol.map((item, index) => (
              <FaqItem
                key={`${lang}-${type}-left-${index}`}
                item={item}
                lang={lang}
                isOpen={openIndex === index}
                onToggle={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
              />
            ))}
          </div>

          <div className="flex flex-col border-b lg:border-b-0 border-ink-black/10">
            {rightCol.map((item, index) => (
              <FaqItem
                key={`${lang}-${type}-right-${index}`}
                item={item}
                lang={lang}
                isOpen={openIndex === index + half}
                onToggle={() =>
                  setOpenIndex(openIndex === index + half ? null : index + half)
                }
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default OfferFaqSection;
