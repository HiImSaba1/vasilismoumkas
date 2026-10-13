"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import SplitText from "gsap/dist/SplitText";
import SeoImage from "@/components/ui/SeoImage";
import { ArrowDown } from "lucide-react";
import { useInitialLoad } from "@/providers/InitialLoadContext";
import ImageComponent from "../ImageComponent";
import AnimatedHeadline from "@/components/animations/AnimatedHeadline";
import type {HomepageSettings} from "@/lib/homepage-settings";

gsap.registerPlugin(SplitText);

const TopSubtext = ({content}:{content:HomepageSettings["hero"]}) => (
  <div className="flex justify-between w-full mb-4 text-[clamp(14px,1.1vw,18px)] uppercase font-semibold pb-4">
    <p className="hero-subtext-item text-left w-1/3">{content.topLeft}</p>
    <p className="hero-subtext-item text-center w-1/3">{content.topCenter}</p>
    <p className="hero-subtext-item text-right w-1/3">{content.topRight}</p>
  </div>
);

const BottomIndicators = ({content}:{content:HomepageSettings["hero"]}) => (
  <div className="flex items-end justify-between w-full pt-6">
    <div className="flex items-center gap-2 indicator-icon w-1/3">
      <ArrowDown className="w-5 h-5" />
      <p className="indicator-text-p text-[18px] lowercase tracking-tight">
        {content.bottomLeft}
      </p>
    </div>
    <div className="indicator-icon flex justify-center w-1/3">
      <div className="relative w-15 h-20">
        <SeoImage
          src="/vm_img/Homepage/vasilis_moumkas_home_main_image_small.webp"
          description="divider-graphic"
          location="homepage"
          fill
          className="object-contain"
          sizes="60px"
        />{" "}
      </div>
    </div>
    <div className="flex items-center justify-end gap-2 w-1/3 indicator-icon">
      <p className="indicator-text-p text-[18px] ">{content.bottomRight}</p>
      <ArrowDown className="w-5 h-5" />
    </div>
  </div>
);

export default function HomeHeroDesktop({content}:{content:HomepageSettings["hero"]}) {
  const { isFirstVisit } = useInitialLoad();
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      // Tiny delay if the loader just finished, otherwise standard entrance
      const baseDelay = isFirstVisit ? 0.3 : 0.6;

      const allText = containerRef.current.querySelectorAll(
        ".hero-subtext-item, .indicator-text-p",
      );
      allText.forEach((item) => {
        const split = new SplitText(item, {
          type: "words",
          wordsClass: "word-inner",
        });
        split.words.forEach((word) => {
          const wrapper = document.createElement("div");
          wrapper.style.cssText =
            "display:inline-block; overflow:hidden; vertical-align:top;";
          word.parentNode?.insertBefore(wrapper, word);
          wrapper.appendChild(word);
        });
        gsap.from(split.words, {
          yPercent: 100,
          duration: 1.2,
          stagger: 0.05,
          ease: "power3.out",
          delay: baseDelay,
        });
      });

      const icons = containerRef.current.querySelectorAll(".indicator-icon");
      gsap.from(icons, {
        opacity: 0,
        y: 20,
        duration: 1,
        stagger: 0.1,
        ease: "power2.out",
        delay: baseDelay + 0.4,
      });
    },
    { scope: containerRef, dependencies: [isFirstVisit] },
  );

  return (
    <>
      <section
        ref={containerRef}
        className="relative w-full z-10 h-svh overflow-hidden"
      >
        <div className="relative h-full w-full px-8 flex flex-col justify-end pb-10">
          <div className="w-full flex flex-col">
            <TopSubtext content={content}/>
            <div className="py-8">
              <AnimatedHeadline animationDelay={isFirstVisit ? 0.2 : 0.5} />
            </div>
            <BottomIndicators content={content}/>
          </div>
        </div>
      </section>
      <section className="intro relative h-svh w-full flex items-center justify-center bg-off-white z-50">
        <div className="w-full px-8">
          <ImageComponent isDesktop={true} desktopSrc={content.desktopImage} mobileSrc={content.mobileImage} projectHref={content.projectHref} alt={content.imageAlt}/>
        </div>
      </section>
    </>
  );
}
