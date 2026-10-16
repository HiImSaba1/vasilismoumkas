"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import SeoImage from "@/components/ui/SeoImage";
import { useInitialLoad } from "@/providers/InitialLoadContext";
import ImageComponent from "../ImageComponent";
import AnimatedHeadline from "@/components/animations/AnimatedHeadline";
import type {HomepageSettings} from "@/lib/homepage-settings";

export default function HomeHeroMobile({content}:{content:HomepageSettings["hero"]}) {
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
      className="min-h-dvh w-full flex flex-col px-4 pt-[28%] pb-2 overflow-hidden bg-off-white"
    >
      <div className="flex justify-between w-full mb-2 overflow-hidden text-[13px] uppercase shrink-0">
        <div className="overflow-hidden">
          <p className="mobile-reveal font-semibold">{content.topLeft}</p>
        </div>
        <div className="overflow-hidden">
          <p className="mobile-reveal">{content.topCenter}</p>
        </div>
        <div className="overflow-hidden">
          <p className="mobile-reveal font-semibold">{content.topRight}</p>
        </div>
      </div>

      <div className="relative h-[50vh] min-h-[58vh] w-full overflow-hidden ">
        <ImageComponent isDesktop={false} desktopSrc={content.desktopImage} mobileSrc={content.mobileImage} projectHref={content.projectHref} alt={content.imageAlt}/>
      </div>

      <div className="shrink-0 mb-2">
        <AnimatedHeadline animationDelay={headlineDelay} isMobile={true} />
      </div>

      <div className="flex items-center justify-between mt-2 border-t border-black/5 shrink-0">
        <div className="mobile-indicator flex flex-col gap-1 w-1/3">
          <p className="text-[14px] uppercase leading-tight tracking-wide">
            {content.bottomLeft}
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
          <p className="text-[14px] uppercase leading-tight tracking-wide">
            {content.bottomRight}
          </p>
        </div>
      </div>
    </section>
  );
}
