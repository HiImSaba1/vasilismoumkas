"use client";
/* eslint-disable @next/next/no-img-element -- Preserve the existing image element controlled by GSAP crop and transforms. */

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import React, { useRef, useSyncExternalStore, FC } from "react";
import Link from "next/link";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function useWindowSize() {
  const width=useSyncExternalStore(callback=>{window.addEventListener("resize",callback);return()=>window.removeEventListener("resize",callback)},()=>window.innerWidth,()=>1024);
  return {width};
}

interface ImageComponentProps {
  isDesktop?: boolean;
  className?: string;
  desktopSrc?: string;
  mobileSrc?: string;
  projectSlug?: string;
  projectHref?: string;
  alt?: string;
  caption?:string;
}

const ImageComponent: FC<ImageComponentProps> = ({ 
  isDesktop = false, 
  className,
  desktopSrc = "/uploads/portfolio/natasa-stamatis/b85c1421-3758-44f5-bc57-d6b5bf761807.webp",
  mobileSrc = "/uploads/portfolio/natasa-stamatis/7099163a-198e-4cf5-ab4c-799e6ae5757a.webp",
  projectSlug = "natasa-stamatis",
  projectHref,
  alt="Natasa & Stamatis wedding",caption,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const { width } = useWindowSize();

  // Determine source based on width (Standard mobile breakpoint 768px)
  const currentSrc = width < 768 ? mobileSrc : desktopSrc;

  useGSAP(() => {
    if (!containerRef.current || !imgRef.current) return;

    // Reset or bypass animations if not in desktop mode/width
    if (!isDesktop || width < 768 || !currentSrc) {
      gsap.set(containerRef.current, { clearProps: "all" });
      return;
    }

    const breakpoints = [
      { maxWidth: 900, translateY: -95 },
      { maxWidth: 1200, translateY: -115 },
      { maxWidth: 1600, translateY: -125 },
      { maxWidth: 2000, translateY: -125 },
      { maxWidth: 2500, translateY: -125 },
    ];

    const getInitialY = () => {
      for (const br of breakpoints) {
        if (width <= br.maxWidth) return br.translateY;
      }
      return -125;
    };

    const initialY = getInitialY();

    gsap.set(containerRef.current, {
      y: `${initialY}vh`,
      scale: 0.35,
      transformOrigin: "center center",
      willChange: "transform",
    });

    const introSt = gsap.to(containerRef.current, {
      scale: 1,
      y: "0vh",
      ease: "none",
      scrollTrigger: {
        trigger: ".intro", 
        start: "top bottom",
        end: "top 10%",
        scrub: true,
        invalidateOnRefresh: true,
      },
    });

    const parallaxSt = gsap.fromTo(imgRef.current, 
      { yPercent: -10 }, 
      {
        yPercent: 10,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom", 
          end: "bottom top",
          scrub: true,
        }
      }
    );

    return () => {
      if (introSt.scrollTrigger) introSt.scrollTrigger.kill();
      if (parallaxSt.scrollTrigger) parallaxSt.scrollTrigger.kill();
    };
  }, [width, isDesktop, currentSrc]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden z-10 ${
        isDesktop ? "aspect-video" : "h-full min-h-[60vh]"
      } ${className ?? ""}`}
    >
      <Link 
        href={projectHref??`/portfolio/project/${projectSlug}`}
        className="block absolute inset-0 w-full h-full cursor-pointer group"
        aria-label={alt}
      >
        <div className="absolute inset-0 overflow-hidden">
          {currentSrc && (
            <img
              ref={imgRef}
              src={currentSrc}
              alt={alt}
              className="absolute top-0 left-0 w-full h-[120%] object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              style={{ top: "-10%" }} 
            />
          )}
        </div>
        {caption&&<span className="absolute inset-x-0 bottom-0 bg-ink-black/60 p-3 text-xs text-white">{caption}</span>}
      </Link>
    </div>
  );
};

export default ImageComponent;
