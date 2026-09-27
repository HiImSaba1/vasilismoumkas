"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import SeoImage from "@/components/ui/SeoImage";
import { ArrowDown } from "lucide-react";
import { useInitialLoad } from "@/providers/InitialLoadContext";
import ImageComponent from "../ImageComponent";
import AnimatedHeadline from "@/components/animations/AnimatedHeadline";

export default function HomeHeroMobile() {
  const { isFirstVisit } = useInitialLoad();
  const containerRef = useRef<HTMLDivElement>(null);

  // Timing adjusted for the unmounting loader
  const titleDelay = isFirstVisit ? 0.2 : 0.4;
  const headlineDelay = isFirstVisit ? 0.4 : 0.7;
  const indicatorDelay = isFirstVisit ? 0.7 : 1.0;

  useGSAP(
    () => {
      const items = gsap.utils.toArray(".mobile-reveal");
      gsap.set(items, { yPercent: 110 });
      gsap.to(items, {
        yPercent: 0,
        duration: 1,
        stagger: 0.1,
        delay: titleDelay,
        ease: "expo.out",
      });

      const indicators = gsap.utils.toArray(".mobile-indicator");
      gsap.set(indicators, { opacity: 0, y: 20 });
      gsap.to(indicators, {
        opacity: 1,
        y: 0,
        duration: 1,
        delay: indicatorDelay,
        ease: "power2.out",
      });
    },
    { dependencies: [isFirstVisit], scope: containerRef },
  );

  return (
    <section
      ref={containerRef}
      className="h-dvh w-full flex flex-col px-4 pt-[28%] pb-6 overflow-hidden bg-off-white"
    >
      <div className="flex justify-between w-full mb-2 overflow-hidden text-[13px] uppercase shrink-0">
        <div className="overflow-hidden">
          <p className="mobile-reveal font-semibold">For modern</p>
        </div>
        <div className="overflow-hidden">
          <p className="mobile-reveal">Romantic souls</p>
        </div>
        <div className="overflow-hidden">
          <p className="mobile-reveal font-semibold">Emotional & timeless</p>
        </div>
      </div>

      <div className="relative w-full grow overflow-hidden mb-2">
        <ImageComponent isDesktop={false} />
      </div>

      <div className="shrink-0 mb-4">
        <AnimatedHeadline animationDelay={headlineDelay} isMobile={true} />
      </div>

      <div className="flex items-center justify-between mt-auto pt-2 border-t border-black/5 shrink-0">
        <div className="mobile-indicator flex flex-col gap-1 w-1/3">
          <ArrowDown className="w-5 h-5" />
          <p className="text-[14px] uppercase leading-tight tracking-wide">
            Scroll for <br />
            portraits
          </p>
        </div>
        <div className="mobile-indicator flex justify-center w-1/3">
          <SeoImage
            src="/vm_img/Homepage/vasilis_moumkas_home_main_image_small.webp"
            description="divider-graphic"
            location="homepage-mobile"
            width={60}
            height={40}
            className="object-contain max-w-[12vw]"
          />{" "}
        </div>
        <div className="mobile-indicator flex flex-col items-end text-right gap-1 w-1/3">
          <ArrowDown className="w-5 h-5" />
          <p className="text-[14px] uppercase leading-tight tracking-wide">
            with passion <br /> & elegance
          </p>
        </div>
      </div>
    </section>
  );
}
