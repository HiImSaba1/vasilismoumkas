"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {InlineContent} from "@/components/ui/InlineContent";
import SeoImage from "@/components/ui/SeoImage";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import AnimatedBorder from "@/components/animations/AnimatedBorder";
import { ABOUT_GALLERY_POOL } from "@/app/(site)/data/Pages-Photoset/Aboutpage";

// 1. Updated QUOTES to include JSX spans for keywords
const QUOTES = [
  <>
    PHOTOGRAPHS ARE PART OF <span className="text-red-600">HUMAN LEGACY</span>,
    AND AN INSTRUMENT TO DOCUMENT OUR{" "}
    <span className="text-red-600">EXISTENCE</span>
  </>,
  <>
    ONE IN A THOUSAND OF A SECOND,{" "}
    <span className="text-red-600">FROZEN IN TIME</span> TO BE RELIVED FOR{" "}
    <span className="text-red-600">GENERATIONS</span> TO COME
  </>,
  <>
    <span className="text-red-600">ART DRIVEN</span> PHOTOGRAPHY THAT HOLDS SHOW
    OF YOUR <span className="text-red-600">LOVE</span>
  </>,
  <>
    MY TASK IS TO CAPTURE ALL THE <span className="text-red-600">SENSES</span>{" "}
    OF YOUR WEDDING DAY AND TRANSFORM THEM INTO A{" "}
    <span className="text-red-600">STORY</span>
  </>,
  <>
    WHERE REAL MOMENTS BECOME <span className="text-red-600">ART</span>. FOR THE{" "}
    <span className="text-red-600">SOULFUL</span>, NOSTALGIC AND WILDLY IN LOVE
  </>,
  <>
    Artistic wedding photography for couples who value{" "}
    <span className="text-red-600">authenticity</span> and{" "}
    <span className="text-red-600">timeless elegance</span>.
  </>,
  <>
    Turning <span className="text-red-600">fleeting moments</span> into
    permanent memories with a{" "}
    <span className="text-red-600">sophisticated</span>, editorial eye.
  </>,
];

const AboutGallerySection = ({galleryImages=[],galleryQuotes=[],galleryDescriptions=[]}:{galleryImages?:{src:string;alt:string;caption:string}[];galleryQuotes?:string[];galleryDescriptions?:{src:string;alt:string}[]}) => {
  const imagePool = useMemo(()=>galleryImages.length >= 4 ? galleryImages.map(image=>image.src) : ABOUT_GALLERY_POOL,[galleryImages]);
  const quotes: React.ReactNode[] = useMemo(()=>galleryQuotes.length ? galleryQuotes.map((text,index)=><InlineContent key={index} text={text}/>) : QUOTES,[galleryQuotes]);
  const containerRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);

  const [images, setImages] = useState<string[]>([]);
  const [currentQuote, setCurrentQuote] = useState<React.ReactNode>(quotes[0]);

  const quotePool = useRef<React.ReactNode[]>([]);
  const lastUpdatedIndices = useRef<number[]>([0, 1, 2, 3]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
    const pool = Array.from(new Set(imagePool));
    const initialImages = [...pool].sort(() => 0.5 - Math.random()).slice(0, 4);
    setImages(initialImages);

    // Filter by index/reference since they are now objects (React Nodes)
    quotePool.current = [...quotes]
      .sort(() => 0.5 - Math.random())
      .filter((q) => q !== quotes[0]);
    });
    return () => cancelAnimationFrame(frame);
  }, [imagePool,quotes]);

  const triggerSwap = useCallback(() => {
    if (quotePool.current.length === 0) {
      quotePool.current = [...quotes].sort(() => 0.5 - Math.random());
    }

    const nextQuote = quotePool.current.pop();
    if (nextQuote) setCurrentQuote(nextQuote);

    const pool = Array.from(new Set(imagePool));
    setImages((prev) => {
      const nextImages = [...prev];
      const slotsToChange = [0, 1, 2, 3]
        .sort(() => 0.5 - Math.random())
        .slice(0, 2);
      lastUpdatedIndices.current = slotsToChange;

      slotsToChange.forEach((slot) => {
        const filteredPool = pool.filter((img) => !nextImages.includes(img));
        nextImages[slot] =
          filteredPool[Math.floor(Math.random() * filteredPool.length)] || nextImages[slot];
      });
      return nextImages;
    });
  }, [imagePool,quotes]);

  useEffect(() => {
    const timer = setInterval(triggerSwap, 5000);
    return () => clearInterval(timer);
  }, [triggerSwap]);

  useGSAP(() => {
    if (!images.length) return;

    gsap.fromTo(
      quoteRef.current,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 1, ease: "power2.out" },
    );

    const items = containerRef.current?.querySelectorAll(
      ".gallery-image-inner",
    );
    if (!items) return;

    const targets = lastUpdatedIndices.current.map((idx) => items[idx]);
    gsap.fromTo(
      targets,
      { clipPath: "inset(100% 0% 0% 0%)", scale: 1.2 },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        scale: 1,
        duration: 1.4,
        stagger: 0.15,
        ease: "power4.inOut",
      },
    );
  }, [images, currentQuote]);

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden py-24 mb-12 bg-off-white"
    >
      <div className="absolute top-0 left-4 right-4 md:left-10 md:right-10">
        <AnimatedBorder origin="center" duration={1.8} />
      </div>

      <div className="text-center max-w-5xl px-6 mb-16 md:mb-24 flex flex-col items-center">
        <div ref={quoteRef}>
          <span className="text-xl sm:text-2xl md:text-4xl lg:text-5xl uppercase tracking-tight text-ink-black/80 block text-balance leading-[1.2] min-h-[4em]">
            &ldquo;{currentQuote}&rdquo;
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-6 max-w-7xl w-full px-4 items-start">
        {images.map((src, i) => {
          const isTall = i === 0 || i === 3;
          return (
            <div
              key={i}
              className={`relative w-full overflow-hidden shadow-lg
                ${isTall ? "aspect-2/3" : "aspect-4/5"}
                ${i === 1 ? "translate-y-14 md:translate-y-16" : ""} 
                ${i === 3 ? "translate-y-4 md:translate-y-10" : ""}
                ${i === 0 || i === 2 ? "md:-translate-y-6" : ""}
              `}
            >
              <div
                className="gallery-image-inner relative w-full h-full"
                style={{ clipPath: "inset(0% 0% 0% 0%)" }}
              >
                <SeoImage
                  key={src}
                  src={src} alt={galleryImages.find(image=>image.src===src)?.alt||galleryDescriptions.find(image=>image.src===src)?.alt||undefined}
                  fill
                  description="fine-art-wedding-gallery"
                  location="greece-italy"
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                  priority={i < 4}
                />
              </div>
              {galleryImages.find(image=>image.src===src)?.caption&&<span className="absolute inset-x-0 bottom-0 bg-ink-black/60 p-2 text-xs text-white">{galleryImages.find(image=>image.src===src)?.caption}</span>}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default AboutGallerySection;
