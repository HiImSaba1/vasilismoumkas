"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AnimatedBorder from "@/components/animations/AnimatedBorder";
import CTAButton from "@/components/ui/CTAButton";
import { useInitialLoad } from "@/providers/InitialLoadContext";
import InstagramFooter from "@/components/core/InstagramFooter";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

const InstagramHeroMobile = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const visualWrapperRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null); // New ref for the actual image
  const secondaryLinksRef = useRef<HTMLDivElement>(null);

  const { isFirstVisit } = useInitialLoad();
  const mainEntranceDelay = isFirstVisit ? 0.2 : 0.6;

  useGSAP(
    () => {
      if (
        !labelRef.current ||
        !nameRef.current || // Added this check
        !buttonsRef.current
      )
        return;

      // 1. Create instances
      const splitName = new SplitText(nameRef.current, { type: "words", mask: "words" });
      const splitLabel = new SplitText(labelRef.current, { type: "words", mask: "words" });

      // 2. Wrap logic (your existing code is fine here)
      // 3. FIX: Add a small check to ensure these arrays are populated
      // GSAP can't set properties on an empty array or undefined references
      const targets = [
        splitName.words,
        splitLabel.words,
      ].filter((arr) => arr && arr.length > 0);

      if (targets.length > 0) {
        gsap.set(targets, { y: "105%" });
      }

      gsap.set([buttonsRef.current, secondaryLinksRef.current], {
        opacity: 0,
        y: 20,
      });
      gsap.set(visualWrapperRef.current, { scale: 1.05, opacity: 0 });

      const tl = gsap.timeline({ delay: mainEntranceDelay });

      tl.to(visualWrapperRef.current, {
        opacity: 1,
        scale: 1,
        duration: 1.2,
        ease: "power3.out",
      })
        .to(
          [splitName.words, splitLabel.words],
          {
            y: "0%",
            duration: 0.6,
            stagger: 0.05,
            ease: "power4.out",
          },
          "-=0.8",
        )
        .to(
          [secondaryLinksRef.current, buttonsRef.current],
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.1,
            ease: "power3.out",
          },
          "-=0.5",
        );

      return () => {
        splitName.revert();
        splitLabel.revert();
      };
    },
    { scope: containerRef, dependencies: [isFirstVisit] },
  );

  const exploreLinks = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "Services", href: "/services" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <main className="bg-ink-black min-h-screen">
      <section
        ref={containerRef}
        className="relative w-full h-[120vh] overflow-hidden flex items-center justify-center"
      >
        {/* Background Image Layer */}
        <div
          ref={visualWrapperRef}
          className="absolute inset-0 z-0 overflow-hidden"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- animated full-bleed hero uses its source asset directly */}
          <img
            ref={imageRef}
            src="/vm_img/About/11-bridal-portrait-veil-bouquet-foreground-vasilis-moumkas.jpg"
            alt="Hero Background"
            className="w-full h-full object-cover"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-ink-black/40" />
        </div>

        {/* Content Layer */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center w-full px-12 h-full">
          <div className="space-y-6 flex flex-col items-center w-full max-w-sm">
            {/* 1. Header Info */}
            <div className="flex flex-col items-center space-y-1">
              <span
                ref={nameRef}
                className="block text-[33px] uppercase tracking-wide pb-6 text-white"
              >
                Vasilis Moumkas
              </span>
              <span
                ref={labelRef}
                className="text-[14px] uppercase tracking-wider opacity-80 block text-white"
              >
                (Where real moments become art)
              </span>

            </div>

            {/* 3. Quick Links */}
            <div
              ref={secondaryLinksRef}
              className="space-y-3 w-full flex flex-col items-center"
            >
              <AnimatedBorder className="bg-soft-yellow/40 w-full" />
              <div className="flex flex-col gap-0.5 w-full">
                {exploreLinks.map((link) => (
                  <CTAButton
                    key={link.label}
                    href={link.href}
                    className="text-white border-none hover:text-soft-yellow transition-all duration-300 px-0 text-center text-[18px] min-w-0"
                  >
                    {link.label}
                  </CTAButton>
                ))}
              </div>
            </div>

            {/* 4. Action Buttons */}
            <div
              ref={buttonsRef}
              className="w-full flex flex-col items-center gap-3 pt-2"
            >
              <AnimatedBorder className="bg-soft-yellow/40 w-full mb-1" />
              <div className="flex flex-col gap-3 w-full px-4">
                <CTAButton
                  href="/education"
                  className="bg-ink-black border border-none text-white text-[18px] py-4 hover:bg-soft-yellow hover:text-ink-black hover:border-transparent transition-colors duration-300"
                >
                  Education
                </CTAButton>
                <CTAButton
                  href="/contact"
                  className="bg-white border-none text-ink-black text-[18px] py-4 hover:bg-ink-black hover:text-soft-yellow transition-colors duration-300"
                >
                  Get in touch
                </CTAButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      <InstagramFooter />
    </main>
  );
};

export default InstagramHeroMobile;
