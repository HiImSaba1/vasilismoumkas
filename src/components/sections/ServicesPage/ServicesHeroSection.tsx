"use client";

import React, { useRef, useState, useEffect } from "react";
import SeoImage from "@/components/ui/SeoImage";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AnimatedBorder from "@/components/animations/AnimatedBorder";
import { HERO_SERVICE_POOL } from "@/app/(site)/data/Pages-Photoset/Servicespage";
import { useInitialLoad } from "@/providers/InitialLoadContext";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

const ServicesHeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const paragraphRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const visualWrapperRef = useRef<HTMLDivElement>(null);

  const [staticImg, setStaticImg] = useState("");
  const [hasMounted, setHasMounted] = useState(false);

  const { isFirstVisit } = useInitialLoad();
  const mainEntranceDelay = isFirstVisit ? 0.2 : 0.6;

  useEffect(() => {
    setHasMounted(true);
    if (HERO_SERVICE_POOL.length > 0) {
      const randomImg =
        HERO_SERVICE_POOL[Math.floor(Math.random() * HERO_SERVICE_POOL.length)];
      setStaticImg(randomImg);
    }
  }, []);

  useGSAP(
    () => {
      if (
        !hasMounted ||
        !heroTitleRef.current ||
        !paragraphRef.current ||
        !labelRef.current
      )
        return;

      const splitLabel = new SplitText(labelRef.current, { type: "words" });
      const splitTitle = new SplitText(heroTitleRef.current, { type: "words" });
      const splitPara = new SplitText(paragraphRef.current, { type: "words" });

      [splitLabel, splitTitle, splitPara].forEach((split) => {
        split.words.forEach((word) => {
          const wrapper = document.createElement("div");
          wrapper.style.cssText =
            "display:inline-block; overflow:hidden; vertical-align:top;";
          word.parentNode?.insertBefore(wrapper, word);
          wrapper.appendChild(word);
        });
      });

      gsap.set([splitLabel.words, splitTitle.words, splitPara.words], {
        y: "105%",
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
          splitLabel.words,
          {
            y: "0%",
            duration: 0.6,
            stagger: 0.1,
            ease: "power4.out",
          },
          "-=0.8",
        )
        .to(
          splitTitle.words,
          {
            y: "0%",
            duration: 0.8,
            stagger: 0.12,
            ease: "power2.out",
          },
          "-=0.7",
        )
        .to(
          splitPara.words,
          {
            y: "0%",
            duration: 0.6,
            stagger: 0.02,
            ease: "power4.out",
          },
          "-=0.8",
        );

      return () => {
        splitLabel.revert();
        splitTitle.revert();
        splitPara.revert();
      };
    },
    { scope: containerRef, dependencies: [hasMounted, isFirstVisit] },
  );

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-screen md:h-screen bg-off-white overflow-hidden flex flex-col md:flex-row"
    >
      <div className="flex flex-col justify-center w-full md:w-1/2 h-[60vh] md:h-full px-8 md:px-20 py-20 md:py-0">
        <div className="space-y-8">
          <div className="w-fit">
            <span
              ref={labelRef}
              className="text-sm  md:text-md lg:text-2xl uppercase tracking-widest opacity-60 block pt-16 md:pt-8 md:pb-2"
            >
              (Editorial Wedding Photography)
            </span>
            <AnimatedBorder
              className="mt-2 bg-ink-black"
              delay={mainEntranceDelay + 0.3}
            />
          </div>

          <div className="w-full">
            <span
              ref={heroTitleRef}
              className="text-[8vw] md:text-[4vw] leading-[0.95] max-w-4xl tracking-tighter uppercase block w-full"
            >
              Bridging the gap between elegance and power of photography.
            </span>
          </div>

          <div className="max-w-2xl">
            <AnimatedBorder
              className="mb-6 bg-ink-black"
              origin="left"
              delay={mainEntranceDelay + 0.6}
            />
            <span
              ref={paragraphRef}
              className="text-md md:text-xl lg:text-2xl leading-tight block opacity-80"
              style={{ fontFamily: "var(--font-bricolage)" }}
            >
              I believe true excellence requires time. To maintain the highest
              standard of artistry, I commit to just a few select weddings
              annually.
            </span>
          </div>
        </div>
      </div>

      <div
        ref={visualWrapperRef}
        className="relative w-full flex-1 h-[40vh] md:h-full overflow-hidden"
      >
        {hasMounted && staticImg && (
          <SeoImage
            src={staticImg}
            description="editorial-wedding-photography-hero-service"
            location="greece-italy"
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        )}
      </div>
    </section>
  );
};

export default ServicesHeroSection;
