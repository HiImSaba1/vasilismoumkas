"use client";

import React, { useState, useEffect } from "react";
import SeoImage from "@/components/ui/SeoImage";
import ParallaxImage from "@/components/animations/ParallaxImage";
import RevealAnimation from "@/components/animations/RevealAnimation";
import AnimatedBorder from "@/components/animations/AnimatedBorder";
import {
  PORTRAIT_PHOTO_POOL,
  HORIZONTAL_PHOTO_POOL,
} from "@/app/(site)/data/Project-Photoset/photoPool";

const ServicesThreeColSection = () => {
  const [images, setImages] = useState<{
    left: string;
    partner: string;
    right: string;
    divider: string;
  } | null>(null);

  useEffect(() => {
    if (PORTRAIT_PHOTO_POOL?.length > 0 && HORIZONTAL_PHOTO_POOL?.length > 0) {
      const portPool = [...PORTRAIT_PHOTO_POOL].sort(() => Math.random() - 0.5);
      const randomHorizontal =
        HORIZONTAL_PHOTO_POOL[
          Math.floor(Math.random() * HORIZONTAL_PHOTO_POOL.length)
        ];

      setImages({
        left: portPool[0] || "",
        partner: portPool[1] || "",
        right: portPool[2] || "",
        divider: randomHorizontal || "",
      });
    }
  }, []);

  if (!images) {
    return <section className="min-h-screen bg-off-white" />;
  }

  return (
    <section className="relative z-20 w-full bg-off-white">
      <div className="min-h-[50vh] md:h-dvh w-full py-12 md:py-24 px-4 md:px-8">
        <div className="max-w-full mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch h-full">
          {/* Left Column */}
          <div className="hidden md:flex md:col-span-3 flex-col justify-start items-start">
            <div className="relative w-[18vw] aspect-3/4 overflow-hidden bg-ink-black/5">
              <ParallaxImage
                src={images.left}
                description="editorial-wedding-details-portrait"
                location="greece-italy"
                className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
              />
            </div>
          </div>

          {/* Middle Column */}
          <div className="col-span-1 md:col-span-7 flex flex-row group h-full">
            <div className="w-px relative mr-6 md:mr-10 h-full">
              <AnimatedBorder
                origin="top"
                duration={2.5}
                className="bg-ink-black"
                isVertical={true}
              />
            </div>

            <div className="flex flex-col justify-between py-4 flex-1">
              <div className="w-full max-w-4xl">
                <RevealAnimation>
                  <span
                    className="block text-ink-black text-[clamp(28px,4.5vw,3rem)] leading-[1.1] uppercase tracking-tighter font-light"
                    style={{ fontFamily: "var(--font-karena)" }}
                  >
                    "Through disciplined{" "}
                    <span className="text-red-600">creative direction</span> and
                    a focus on{" "}
                    <span className="text-red-600">cinematic storytelling</span>
                    , I translate our{" "}
                    <span className="text-red-600">artistic values</span> into
                    an <span className="text-red-600">authentic legacy</span>{" "}
                    that feels as vivid as the day itself."
                  </span>
                </RevealAnimation>
              </div>

              {/* Small Anchor Image - Updated to SeoImage */}
              <div className="mt-12 md:mt-16 flex flex-col items-start space-y-4">
                <div className="relative w-36 md:w-[10vw] lg:w-[12vw] aspect-square overflow-hidden bg-ink-black/5">
                  <SeoImage
                    src={images.partner}
                    description="vasilis-moumkas-editorial-detail"
                    location="greece-italy"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 96px, 10vw"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="hidden md:flex md:col-span-2 flex-col justify-end items-end">
            <div className="relative w-full aspect-3/4 overflow-hidden bg-ink-black/5">
              <ParallaxImage
                src={images.right}
                description="destination-wedding-photography-cinematic"
                location="greece-italy"
                className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Video Divider Section */}
      <div className="w-full overflow-hidden bg-off-white">
        <div className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden shadow-sm">
          <video
            src="/videos/vm_services_video_main.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/10" />
        </div>
      </div>
    </section>
  );
};

export default ServicesThreeColSection;
