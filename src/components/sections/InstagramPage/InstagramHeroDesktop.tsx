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

const InstagramHeroDesktop = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const visualWrapperRef = useRef<HTMLDivElement>(null);
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
    { label: "Education", href: "/education" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "Services", href: "/services" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <main className="bg-off-white">
      <section
        ref={containerRef}
        className="relative w-full min-h-screen md:h-screen bg-off-white overflow-hidden flex flex-col md:flex-row"
      >
        {/* Left Content */}
        <div className="flex flex-col justify-center items-center text-center w-full md:w-1/2 h-auto md:h-full px-8 md:px-10 py-10 md:py-0">
          <div className="space-y-8 flex flex-col items-center">
            <div className="w-fit space-y-1 flex flex-col items-center">
              <span
                ref={nameRef}
                className="block text-[20px] uppercase tracking-widest text-ink-black font-bold mb-8"
              >
                Vasilis Moumkas
              </span>
              <span
                ref={labelRef}
                className="text-sm  md:text-md lg:text-xl uppercase -tracking-tight opacity-60 block text-ink-black"
              >
                (Where real moments become art)
              </span>
              <AnimatedBorder
                className="mt-2 bg-ink-black w-full"
                delay={mainEntranceDelay + 0.3}
              />
            </div>

            {/* Secondary Explore Grid */}
            <div
              ref={secondaryLinksRef}
              className="space-y-3 w-full flex flex-col items-center"
            >
              <AnimatedBorder className="bg-ink-black w-full" />

              <div className="grid grid-cols-1 gap-1 w-full">
                {exploreLinks.map((link) => (
                  <CTAButton
                    key={link.label}
                    href={link.href}
                    className="text-ink-black border-none hover:bg-black hover:border-transparent hover:text-soft-yellow transition-all duration-300 px-0 text-center text-[16px] md:text-3xl flex justify-center items-center min-w-0"
                  >
                    {link.label}
                  </CTAButton>
                ))}
              </div>
            </div>

            {/* Main Action Buttons */}
            <div
              ref={buttonsRef}
              className="w-full flex flex-col items-center gap-2"
            >
              <AnimatedBorder className="bg-ink-black w-full mb-2" />
              <div className="flex flex-row items-center justify-evenly gap-4 w-full">
                <CTAButton
                  href="/contact"
                  className="bg-ink-black border-none text-white text-[1.5vw] hover:bg-soft-yellow hover:text-ink-black transition-colors duration-300"
                >
                  Get in touch
                </CTAButton>
              </div>
            </div>
          </div>
        </div>

        {/* Right Visual */}
        <div
          ref={visualWrapperRef}
          className="relative w-full flex-1 h-[60vh] md:h-full overflow-hidden bg-black"
        >
          <video
            src="/videos/vm_services_video_main.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/10 pointer-events-none" />
        </div>
      </section>

      <InstagramFooter />
    </main>
  );
};

export default InstagramHeroDesktop;
