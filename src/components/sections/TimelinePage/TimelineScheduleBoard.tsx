// FILE: src/components/sections/TimelinePage/TimelineScheduleBoard.tsx
"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

interface Milestone {
  time: string;
  title_gr: string;
  title_en: string;
  location_gr: string;
  location_en: string;
  desc_gr: string;
  desc_en: string;
}

interface TimelineScheduleBoardProps {
  milestones: Milestone[];
  lang: "en" | "gr";
}

function ScheduleRow({
  item,
  index,
  lang,
}: {
  item: Milestone;
  index: number;
  lang: "en" | "gr";
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const title = lang === "gr" ? item.title_gr : item.title_en;
  const location = lang === "gr" ? item.location_gr : item.location_en;
  const desc = lang === "gr" ? item.desc_gr : item.desc_en;

  useGSAP(
    () => {
      if (!timeRef.current || !contentRef.current) return;

      const splitTime = new SplitText(timeRef.current, { type: "words,lines" });
      const splitContent = new SplitText(
        contentRef.current.querySelectorAll(".animate-text-line"),
        { type: "lines" },
      );

      const allLines = [...splitTime.lines, ...splitContent.lines];

      allLines.forEach((el) => {
        const wrap = document.createElement("div");
        wrap.style.cssText =
          "display:block; overflow:hidden; vertical-align:top;";
        el.parentNode?.insertBefore(wrap, el);
        wrap.appendChild(el);
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: rowRef.current,
          start: "top 85%",
          end: "bottom 15%",
          toggleActions: "play reverse play reverse",
        },
      });

      tl.fromTo(
        allLines,
        { yPercent: 105 },
        {
          yPercent: 0,
          duration: 1.2,
          stagger: 0.02,
          ease: "power4.out",
        },
      ).fromTo(
        rowRef.current,
        { borderBottomColor: "rgba(0,0,0,0)" },
        { borderBottomColor: "rgba(0,0,0,0.1)", duration: 0.6 },
        "-=1.0",
      );

      return () => {
        splitTime.revert();
        splitContent.revert();
      };
    },
    { scope: rowRef, dependencies: [item, lang] },
  );

  return (
    <div
      ref={rowRef}
      className="group relative w-full grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 py-8 px-4 md:py-12 border-b border-ink-black/10 overflow-hidden"
    >
      {/* Hover Background Effect */}
      <div className="absolute inset-0 bg-ink-black z-0 -translate-y-[115%] -rotate-2 group-hover:translate-y-0 group-hover:rotate-0 transition-all duration-500 ease-[cubic-bezier(0.215,0.61,0.355,1)]" />

      {/* Content Container */}
      <div className="relative z-10 w-full md:col-span-12 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8">
        {/* Time Stamp */}
        <div
          ref={timeRef}
          className="md:col-span-2 text-2xl md:text-3xl font-light tracking-tighter font-mono text-ink-black group-hover:text-soft-yellow transition-colors duration-500"
        >
          {item.time || "--:--"}
        </div>

        {/* Narrative */}
        <div ref={contentRef} className="md:col-span-10 space-y-3">
          <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-1">
            <span className="animate-text-line text-2xl md:text-5xl font-normal text-ink-black group-hover:text-soft-yellow transition-colors duration-500">
              {title}
            </span>
            {location && (
              <span className="animate-text-line text-md md:text-base text-ink-black/50 group-hover:text-soft-yellow/50 transition-colors duration-500">
                / {location}
              </span>
            )}
          </div>

          {desc && (
            <p
              className="animate-text-line text-sm md:text-base opacity-70 group-hover:opacity-90 max-w-3xl leading-relaxed font-light text-ink-black group-hover:text-off-white transition-colors duration-500"
              style={{ fontFamily: "var(--font-karena)" }}
            >
              {desc}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TimelineScheduleBoard({
  milestones,
  lang,
}: TimelineScheduleBoardProps) {
  const sectionHeaderRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!sectionHeaderRef.current) return;
      const split = new SplitText(
        sectionHeaderRef.current.querySelectorAll("span, h3"),
        { type: "lines" },
      );

      split.lines.forEach((line) => {
        const wrap = document.createElement("div");
        wrap.style.cssText = "display:block; overflow:hidden;";
        line.parentNode?.insertBefore(wrap, line);
        wrap.appendChild(line);
      });

      gsap.fromTo(
        split.lines,
        { yPercent: 105 },
        {
          yPercent: 0,
          duration: 1.2,
          ease: "power4.out",
          scrollTrigger: {
            trigger: sectionHeaderRef.current,
            start: "top 80%",
          },
        },
      );

      return () => split.revert();
    },
    { scope: sectionHeaderRef, dependencies: [lang] },
  );

  return (
    <section className="w-full bg-off-white py-8 md:py-16 px-6 border-t border-ink-black/5">
      <div className="mx-auto">
        <div
          ref={sectionHeaderRef}
          className="mb-12 md:mb-20 space-y-2 border-b border-ink-black/20 pb-6"
        >
          <span className="text-sm  uppercase tracking-[0.25em] text-ink-black/40 block">
            {lang === "gr" ? "Η Ροή της Ημέρας" : "The Sequence of Events"}
          </span>
          <span className="text-3xl md:text-5xl tracking-tighter font-light">
            {lang === "gr"
              ? "Χρονοδιάγραμμα Εκδήλωσης"
              : "Celebration Framework"}
          </span>
        </div>

        {milestones.length === 0 ? (
          <div className="py-20 text-center border-b border-ink-black/10">
            <p className="text-ink-black uppercase tracking-widest text-sm  opacity-40">
              {lang === "gr"
                ? "Δεν έχουν προστεθεί ορόσημα ακόμη."
                : "No schedule milestones recorded yet."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {milestones.map((item, idx) => (
              <ScheduleRow key={idx} item={item} index={idx} lang={lang} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
