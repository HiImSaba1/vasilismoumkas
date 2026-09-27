"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import SeoImage from "@/components/ui/SeoImage";
import RevealAnimation from "@/components/animations/RevealAnimation";
import AnimatedBorder from "@/components/animations/AnimatedBorder";
import { HOMEPAGE_BLACK_FOOTER } from "@/app/(site)/data/Pages-Photoset/Homepage";

const seoKeywords = [
  "Family",
  "Destination",
  "Portraits",
  "Thessaloniki",
  "Wedding ",
  "Photographer",
];

const HomeMarqueeImages = () => {
  const gapClass = "gap-4 md:gap-6";
  const [shuffledImages, setShuffledImages] = useState<string[]>([]);

  useEffect(() => {
    // Unique shuffle logic
    const uniquePool = Array.from(new Set(HOMEPAGE_BLACK_FOOTER));
    const shuffle = () => {
      return [...uniquePool].sort(() => 0.5 - Math.random()).slice(0, 12);
    };
    setShuffledImages(shuffle());
  }, []);

  return (
    <div className="bg-ink-black px-0 lg:px-5 pb-10 lg:pb-16 pt-12 md:pt-20">
      <div className="flex flex-col pt-4 md:pt-16 gap-8 md:gap-12 relative">
        <div className="absolute top-0 left-0 w-full">
          <AnimatedBorder
            origin="left"
            duration={2}
            className="bg-soft-yellow/40"
          />
        </div>

        <div className="relative overflow-hidden py-4 md:py-8">
          {shuffledImages.length > 0 && (
            <motion.div
              className={`flex ${gapClass} w-max pr-4 md:pr-6`}
              initial={{ x: 0 }}
              animate={{ x: "-50%" }}
              transition={{
                duration: 70,
                ease: "linear",
                repeat: Infinity,
              }}
            >
              {[...shuffledImages, ...shuffledImages].map((src, idx) => (
                <div
                  key={`${idx}-${src}`}
                  className="relative w-56 h-72 md:w-80 md:h-100 shrink-0 overflow-hidden"
                >
                  <SeoImage
                    src={src}
                    description="wedding-editorial-portfolio"
                    location="greece-italy-worldwide"
                    fill
                    sizes="(max-width: 768px) 224px, 320px"
                    priority={idx < 4}
                    className="object-cover hover:grayscale transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
                  />
                </div>
              ))}
            </motion.div>
          )}
        </div>

        <div className="flex flex-col justify-between items-center text-center min-h-[20vh] lg:min-h-[30vh] pb-8 relative">
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-16 w-full max-w-full px-4 pb-8 relative">
            {seoKeywords.map((keyword, idx) => (
              <span
                key={idx}
                className="text-soft-yellow text-sm uppercase tracking-widest font-medium"
                style={{ fontFamily: "var(--font-karena)" }}
              >
                {keyword}
              </span>
            ))}
            <div className="absolute bottom-0 left-4 right-4">
              <AnimatedBorder
                origin="center"
                duration={1.8}
                delay={0.4}
                className="bg-soft-yellow/40"
              />
            </div>
          </div>

          <div className="max-w-4xl px-4 mt-12 md:mt-auto">
            <RevealAnimation>
              <p
                className="text-soft-yellow text-md md:text-2xl lg:text-3xl uppercase tracking-tight leading-tight"
                style={{ fontFamily: "var(--font-karena)" }}
              >
                Fashion Wedding Photographer Featured in Leading Editorials.
                Capturing Timeless Stories Worldwide
              </p>
            </RevealAnimation>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeMarqueeImages;
