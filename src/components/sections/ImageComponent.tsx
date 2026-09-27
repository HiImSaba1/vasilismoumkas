"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import React, { useRef, useState, useEffect, FC } from "react";
import Link from "next/link";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function useWindowSize() {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    // Set initial width
    setWidth(window.innerWidth);
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return { width };
}

interface ImageComponentProps {
  isDesktop?: boolean;
  className?: string;
  desktopSrc?: string;
  mobileSrc?: string;
  projectSlug?: string;
}

const ImageComponent: FC<ImageComponentProps> = ({ 
  isDesktop = false, 
  className,
  desktopSrc = "/uploads/portfolio/natasa-stamatis/b85c1421-3758-44f5-bc57-d6b5bf761807.webp",
  mobileSrc = "/uploads/portfolio/natasa-stamatis/7099163a-198e-4cf5-ab4c-799e6ae5757a.webp",
  projectSlug = "natasa-stamatis",
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
        href={`/portfolio/project/${projectSlug}`} 
        className="block absolute inset-0 w-full h-full cursor-pointer group"
        aria-label="View Natasa & Stamatis project"
      >
        <div className="absolute inset-0 overflow-hidden">
          {currentSrc && (
            <img
              ref={imgRef}
              src={currentSrc}
              alt="Natasa & Stamatis wedding"
              className="absolute top-0 left-0 w-full h-[120%] object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              style={{ top: "-10%" }} 
            />
          )}
        </div>
      </Link>
    </div>
  );
};

export default ImageComponent;
