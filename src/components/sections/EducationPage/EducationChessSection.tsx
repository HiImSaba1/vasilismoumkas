"use client";

import React, { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ScrollToPlugin } from "gsap/ScrollToPlugin"; // Required for smooth manual scrolling
import { useGSAP } from "@gsap/react";
import ParallaxImage from "@/components/animations/ParallaxImage";
import {useEducationContent} from "@/providers/EducationContentContext";
import type {EducationContent} from "@/lib/education-content";
import CTAButton from "@/components/ui/CTAButton";

if (typeof window !== "undefined") {
  // Register all plugins including ScrollToPlugin
  gsap.registerPlugin(ScrollTrigger, SplitText, ScrollToPlugin);
}

// Define the type to include the optional id
type EducationItem = EducationContent["sections"][number];

const ChessRow = ({
  item,
  idx,
}: {
  item: EducationItem;
  idx: number;
}) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const paraRef = useRef<HTMLSpanElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!titleRef.current || !paraRef.current || !contentRef.current) return;

      const splitTitle = new SplitText(titleRef.current, { type: "lines" });
      const splitPara = new SplitText(paraRef.current, { type: "lines" });
      const splitContent = new SplitText(
        contentRef.current.querySelectorAll("p, li, .footer-text"),
        { type: "lines" },
      );

      [splitTitle.lines, splitPara.lines, splitContent.lines].forEach(
        (elements) => {
          elements.forEach((el) => {
            const wrap = document.createElement("div");
            wrap.style.cssText =
              "display:block; overflow:hidden; vertical-align:top;";
            el.parentNode?.insertBefore(wrap, el);
            wrap.appendChild(el);
          });
        }
      );

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: rowRef.current,
          start: "top 75%",
          end: "bottom 15%",
          toggleActions: "play reverse play reverse",
        },
      });

      tl.fromTo(
        [splitTitle.lines, splitPara.lines, splitContent.lines],
        { yPercent: 105 },
        {
          yPercent: 0,
          duration: 1.2,
          stagger: 0.03,
          ease: "power4.out",
        }
      );
    },
    { scope: rowRef }
  );

  return (
    <section
      ref={rowRef}
      data-education-row="true"
      id={item.id}
      className={`relative w-full flex flex-col md:flex-row items-stretch overflow-hidden border-b border-ink-black/5 scroll-mt-24 ${
        idx % 2 === 1 ? "md:flex-row-reverse" : "flex-col"
      }`}
    >
      <div className="w-full md:w-1/2 flex flex-col justify-between p-8 md:p-12 bg-off-white z-10">
        <div className="mb-8 md:mb-0">
          <span className="block text-[12px] md:text-[14px] tracking-[0.2em] uppercase text-ink-black/60 mb-4">
            — {item.category}
          </span>
          <Link href={item.headingHref} className="group inline-block">
            <h2 style={{margin:0,fontWeight:"inherit",fontFamily:"inherit"}}
              ref={titleRef}
              className="text-[10vw] md:text-[7vw] leading-[0.9] text-ink-black uppercase tracking-tighter group-hover:italic transition-all duration-700 block"
            >
              {item.title}
            </h2>
          </Link>
        </div>

        <div className="my-8 md:my-0">
          <span
            ref={paraRef}
            className="text-ink-black text-[20px] md:text-[22px] leading-tight tracking-tight block"
          >
            {item.paragraph}
          </span>
        </div>

        <div
          ref={contentRef}
          className="border-t border-ink-black/20 pt-8 md:pt-10"
        >
          <span className="text-[18px] md:text-[20px] text-ink-black/80 leading-[1.2] block">
            {item.detail}
          </span>

          {item.list.length>0&&<ul className="list-disc list-outside ml-6 md:ml-8 space-y-1 my-3 md:my-6">
            {item.list.map((bullet, i) => (
              <li
                key={i}
                className="text-[18px] md:text-[20px] text-ink-black/90 pl-2 marker:text-ink-black/80"
              >
                {bullet}
              </li>
            ))}
          </ul>}

          <span className="footer-text text-[18px] md:text-[20px] leading-[1.2] text-ink-black/80 block mb-8">
            {item.footer}
          </span>

          <div className="flex justify-between items-center mt-8 w-full">
            <div className="w-1/2">
              <CTAButton className="w-full" href={item.buttonHref}>
                {item.buttonLabel}
              </CTAButton>
            </div>

            <span className="font-mono text-[14px] md:text-[16px] text-ink-black/30 block">
              0{idx + 1} / 04
            </span>
          </div>
        </div>
      </div>

      <div className="w-full md:w-1/2 relative overflow-hidden h-[60vh] md:h-auto md:min-h-screen z-0">
        <ParallaxImage
          src={item.image}
          alt={item.imageAlt}
          fill={true}
          priority={idx === 0}
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    </section>
  );
};

export default function EducationChessSection() {
  const content=useEducationContent();
  // FIX: Manual scroll to hash on mount
  useGSAP(() => {
    const hash = window.location.hash;
    if (hash) {
      // Use a slight timeout to ensure SplitText and other layout calculations are finished
      setTimeout(() => {
        const target = document.querySelector(hash);
        if (target) {
          gsap.to(window, {
            scrollTo: {
              y: target,
              autoKill: false,
              offsetY: 80, // Adjust this value to account for your header height
            },
            duration: 1.5,
            ease: "power4.inOut",
          });
        }
      }, 150); // Delay ensures DOM stability
    }
  }, []);

  return (
    <div className="relative w-full bg-off-white">
      {content.sections.map((item, idx) => (
        <ChessRow key={idx} item={item} idx={idx} />
      ))}

      <footer className="sr-only" aria-hidden="true">
        <p>
          Wedding photography education in Greece for photographers who want to
          refine their style, build a strong visual identity, and grow as luxury
          and destination wedding photographers.
        </p>
      </footer>
    </div>
  );
}
