"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";
import RevealAnimation from "@/components/animations/RevealAnimation";

gsap.registerPlugin(SplitText);

interface LegalContentProps {
  title: React.ReactNode;
  sections: { heading: string; content: string }[];
}

const LegalContent = ({ title, sections }: LegalContentProps) => {
  const containerRef = useRef(null);

  useGSAP(() => {
    const split = new SplitText(".legal-title", { type: "chars" });
    
    gsap.from(split.chars, {
      y: 100,
      opacity: 0,
      duration: 1.2,
      stagger: 0.03,
      ease: "power4.out",
    });
  }, { scope: containerRef });

  return (
    <main ref={containerRef} className="pt-40 pb-32 px-6 md:px-10 max-w-6xl mx-auto min-h-screen bg-off-white text-ink-black">
      <h1 className="legal-title text-[15vw] md:text-[8vw] uppercase leading-[0.8] tracking-tighter mb-20" style={{ fontFamily: "var(--font-karena)" }}>
        {title}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-3 opacity-40 uppercase tracking-widest text-sm ">
          <RevealAnimation>
            <span>Read More</span>
          </RevealAnimation>
        </div>

        <div className="md:col-span-9 space-y-16">
          {sections.map((sec, i) => (
            <section key={i} className="legal-section border-t border-ink-black/50 pt-8">
              <RevealAnimation>
                <h2 style={{lineHeight:"1.25"}} className="uppercase tracking-[0.2em] mb-4 text-sm">
                  {sec.heading}
                </h2>
              </RevealAnimation>
              <RevealAnimation>
                <p className="text-lg md:text-xl leading-none opacity-80 font-light">
                  {sec.content}
                </p>
              </RevealAnimation>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
};

export default LegalContent;