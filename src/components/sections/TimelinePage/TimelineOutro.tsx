// FILE: src/components/sections/TimelinePage/TimelineOutro.tsx
"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import CTAButton from "@/components/ui/CTAButton";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

interface TimelineOutroProps {
  lang: "en" | "gr";
}

export default function TimelineOutro({ lang }: TimelineOutroProps) {
  const containerRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  const calendlyLink =
    lang === "gr"
      ? "https://calendly.com/vasilis-moumkas/online"
      : "https://calendly.com/vasilis-moumkas/online";

  useGSAP(
    () => {
      if (!textRef.current) return;

      const split = new SplitText(textRef.current.querySelectorAll("h2, p"), {
        type: "lines",
      });

      split.lines.forEach((line) => {
        const wrap = document.createElement("div");
        wrap.style.cssText = "display:block; overflow:hidden; margin-bottom: 2px;";
        line.parentNode?.insertBefore(wrap, line);
        wrap.appendChild(line);
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 75%",
          toggleActions: "play none none none",
        },
      });

      tl.fromTo(
        split.lines,
        { yPercent: 105 },
        {
          yPercent: 0,
          duration: 1.2,
          stagger: 0.04,
          ease: "power4.out",
        }
      ).fromTo(
        ".outro-cta-wrapper",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1 },
        "-=0.6"
      );

      return () => {
        split.revert();
      };
    },
    { scope: containerRef, dependencies: [lang] }
  );

  return (
    <section
      ref={containerRef}
      className="w-full bg-soft-white py-24 md:py-40 flex flex-col items-center justify-center text-center px-6"
    >
      <div className="max-w-3xl space-y-8">
        <div ref={textRef} className="space-y-4">
          <h2 className="text-2xl md:text-4xl tracking-tighter text-ink-black">
            {lang === "gr" ? "Ας Κάνουμε τη Μέρα Σας Ανεπανάληπτη" : "Let’s Breathe Life Into the Day"}
          </h2>
          <p
            className="text-base md:text-lg opacity-70 leading-none max-w-xl mx-auto font-light"
            style={{ fontFamily: "var(--font-karena)" }}
          >
            {lang === "gr"
              ? "Αν προκύψουν αλλαγές, προσαρμογές ή προσθήκες στο πρόγραμμα, προγραμματίστε ένα ψηφιακό ραντεβού μαζί μου για να συντονίσουμε κάθε λεπτομέρεια."
              : "Should timelines shift or adjustments require refinement, let's connect. Schedule a brief configuration synchronize directly onto my open calendar."}
          </p>
        </div>

        <div className="outro-cta-wrapper pt-4 max-w-xs mx-auto w-full">
          <CTAButton href={calendlyLink} target="_blank" className="w-full py-4 text-sm  ">
            {lang === "gr" ? "Συντονισμός Χρονοδιαγράμματος" : "Sync Schedule Parameters"}
          </CTAButton>
        </div>
      </div>
    </section>
  );
}