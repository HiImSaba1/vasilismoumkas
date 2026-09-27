"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import AnimatedBorder from "@/components/animations/AnimatedBorder";

const AboutHeroVideoSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const titleWrapperRef = useRef<HTMLDivElement>(null);
  const leftParaRef = useRef<HTMLParagraphElement>(null);
  const rightParaRef = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      tl.fromTo(
        videoRef.current,
        { clipPath: "inset(0% 0% 100% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 1.8, ease: "expo.inOut" },
      );

      tl.fromTo(
        [titleWrapperRef.current, leftParaRef.current, rightParaRef.current],
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.4,
          stagger: 0.2,
          ease: "power3.out",
        },
        "-=1.2",
      );

      if (titleWrapperRef.current) {
        const staticText = titleWrapperRef.current.querySelector(".static-text");
        const animatedText = titleWrapperRef.current.querySelector(".animated-text");

        const onEnter = () => {
          gsap.to(staticText, { y: "-100%", duration: 0.6, ease: "power4.inOut" });
          gsap.to(animatedText, { y: "0%", duration: 0.6, ease: "power4.inOut" });
        };

        const onLeave = () => {
          gsap.to(staticText, { y: "0%", duration: 0.6, ease: "power4.inOut" });
          gsap.to(animatedText, { y: "100%", duration: 0.6, ease: "power4.inOut" });
        };

        titleWrapperRef.current.addEventListener("mouseenter", onEnter);
        titleWrapperRef.current.addEventListener("mouseleave", onLeave);
      }
    },
    { scope: sectionRef },
  );

  // Adjusted leading to 0.9 or 1 to allow two lines to sit close but not overlap
  const titleClasses =
    "text-soft-yellow text-[clamp(2.5rem,10vw,5.5rem)] md:text-8xl uppercase tracking-tighter text-center leading-[0.9]";

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-screen bg-off-white overflow-hidden flex flex-col justify-center"
    >
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          src="/videos/about-vm-video-2.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative z-20 px-4 md:px-16 w-full">
        <AnimatedBorder
          className="bg-soft-yellow/50 w-full"
          origin="left"
          delay={0.5}
        />
      </div>

      <div className="relative z-10 w-full px-4 md:px-16 py-12 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-12 w-full items-center gap-8">
          {/* LEFT PARA */}
          <div className="md:col-span-2 flex items-start justify-start order-2 md:order-1">
            <p
              ref={leftParaRef}
              className="text-off-white/80 text-sm  md:text-sm leading-tight max-w-50 uppercase tracking-wider"
            >
              Capturing timeless moments as a destination wedding photographer,
              focusing on the raw emotions and cinematic beauty.
            </p>
          </div>

          {/* CENTER - Two Line Layout */}
          <div className="md:col-span-8 flex flex-col items-center justify-center order-1 md:order-2">
            <div
              ref={titleWrapperRef}
              className="relative cursor-pointer overflow-hidden py-4 w-full"
              style={{ fontFamily: "var(--font-karena)" }}
            >
              <div className={`static-text -mt-4 ${titleClasses}`}>
                Fine <br /> Artist
              </div>
              <div
                className={`animated-text absolute inset-0 flex items-center justify-center pt-4 ${titleClasses}`}
                style={{ transform: "translateY(100%)" }}
              >
                Lover<br />of Life
              </div>
            </div>
          </div>

          {/* RIGHT PARA */}
          <div className="md:col-span-2 flex items-end justify-end order-3">
            <p
              ref={rightParaRef}
              className="text-off-white/80 text-sm  md:text-sm leading-tight max-w-50 text-right uppercase tracking-wider"
            >
              From intimate elopements to grand celebrations, my editorial
              approach ensures every frame feels like a piece of art.
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-20 px-4 md:px-16 w-full">
        <AnimatedBorder
          className="bg-soft-yellow/50 w-full"
          origin="right"
          delay={0.7}
        />
      </div>
    </section>
  );
};

export default AboutHeroVideoSection;