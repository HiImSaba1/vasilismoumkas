"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import SeoImage from "@/components/ui/SeoImage";
import { AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { TestimonialsData } from "@/app/(site)/data/TestimonialsData";
import RevealAnimation from "@/components/animations/RevealAnimation";
import AnimatedBorder from "@/components/animations/AnimatedBorder";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

const HomeTestimonialsOnScroll = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const autoplay = useRef(Autoplay({ delay: 7000, stopOnInteraction: false }));

  const [emblaMainRef, emblaMainApi] = useEmblaCarousel(
    { loop: true, duration: 50, axis: "x", watchDrag: true },
    [autoplay.current],
  );

  const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({
    containScroll: "keepSnaps",
    dragFree: true,
  });

  const onThumbClick = useCallback(
    (index: number) => {
      if (!emblaMainApi) return;
      emblaMainApi.scrollTo(index);
      const autoplayPlugin = emblaMainApi.plugins().autoplay;
      if (autoplayPlugin) autoplayPlugin.reset();
    },
    [emblaMainApi],
  );

  const onSelect = useCallback(() => {
    if (!emblaMainApi || !emblaThumbsApi) return;
    const index = emblaMainApi.selectedScrollSnap();
    setSelectedIndex(index);
    emblaThumbsApi.scrollTo(index);
    const autoplayPlugin = emblaMainApi.plugins().autoplay;
    if (autoplayPlugin) autoplayPlugin.reset();
  }, [emblaMainApi, emblaThumbsApi]);

  useEffect(() => {
    if (!emblaMainApi) return;
    onSelect();
    emblaMainApi.on("select", onSelect).on("reInit", onSelect);
  }, [emblaMainApi, onSelect]);

  return (
    <section className="py-4 px-4 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full">
        <AnimatedBorder
          origin="left"
          duration={2}
          className="bg-ink-black/60"
        />
      </div>

      <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative pt-8">
        <div className="relative mb-12 inline-block">
          <RevealAnimation>
            <span className="font-saans-bold text-center text-[14px] md:text-xl uppercase tracking-[0.215em] text-ink-black pb-6 block">
              Couple <br /> Testimonials
            </span>
          </RevealAnimation>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24">
            <AnimatedBorder
              origin="center"
              duration={1.5}
              delay={0.5}
              className="bg-ink-black/60"
            />
          </div>
        </div>

        <div className="relative w-full flex items-center justify-center">
          <div
            className="overflow-hidden w-full h-auto min-h-100 md:min-h-137.5 cursor-grab active:cursor-grabbing"
            ref={emblaMainRef}
          >
            <div className="flex flex-row">
              {TestimonialsData.map((item, index) => (
                <div
                  key={item.id}
                  className="flex-[0_0_100%] min-w-0 flex items-center justify-center"
                >
                  <AnimatePresence mode="wait">
                    {index === selectedIndex && (
                      <TestimonialSlide item={item} />
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full max-w-3xl mt-0">
          <div className="overflow-hidden" ref={emblaThumbsRef}>
            <div className="flex gap-0 md:gap-2 justify-center py-2">
              {TestimonialsData.map((item, index) => (
                <button
                  key={`thumb-${item.id}`}
                  onClick={() => onThumbClick(index)}
                  className={`relative flex-[0_0_40px] md:flex-[0_0_50px] aspect-square overflow-hidden transition-all duration-500 border-2 ${
                    index === selectedIndex
                      ? "border-ink-black/50 scale-110 grayscale-0"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <SeoImage
                    src={item.profileImage}
                    description={`testimonial-thumb-${item.couple.toLowerCase()}`}
                    location="greece-italy"
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

function TestimonialSlide({ item }: { item: (typeof TestimonialsData)[number] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current || !quoteRef.current) return;
      let cancelled = false;
      let split: SplitText | undefined;
      let timeline: gsap.core.Timeline | undefined;

      const setup = async () => {
        await document.fonts.ready;
        if (cancelled || !containerRef.current || !quoteRef.current) return;

        split = new SplitText(quoteRef.current, {
          type: "lines",
          linesClass: "line-parent-split",
        });
        split.lines.forEach((line) => {
          const wrapper = document.createElement("div");
          wrapper.style.overflow = "hidden";
          wrapper.style.display = "block";
          line.parentNode?.insertBefore(wrapper, line);
          wrapper.appendChild(line);
        });

        const image = containerRef.current.querySelector(".slide-img");
        timeline = gsap.timeline();
        if (image) timeline.fromTo(image, { clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)" }, { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)", duration: 1.2, ease: "expo.inOut" });
        if (split.lines.length) timeline.fromTo(split.lines, { yPercent: 100 }, { yPercent: 0, duration: 0.9, stagger: 0.1, ease: "power4.out" }, "-=0.7");
      };

      void setup();
      return () => {
        cancelled = true;
        timeline?.kill();
        split?.revert();
      };
    },
    { scope: containerRef, dependencies: [item] },
  );

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center text-center px-4 md:px-12 w-full select-none"
    >
      <div className="slide-img relative w-46 h-58 md:w-72 md:h-96 mb-8 md:mb-12 overflow-hidden">
        <SeoImage
          src={item.profileImage}
          description={`testimonial-portrait-${item.couple.toLowerCase()}`}
          location="greece-italy"
          fill
          className="object-cover"
          draggable={false}
          sizes="(max-width: 768px) 150px, 200px"
        />
      </div>

      <blockquote className="max-w-5xl mx-auto mb-10">
        <div
          ref={quoteRef}
          className="quote-text text-xl text-ink-black tracking-tighter"
        >
          “{item.quote}”
        </div>
      </blockquote>
    </div>
  );
}

export default HomeTestimonialsOnScroll;
