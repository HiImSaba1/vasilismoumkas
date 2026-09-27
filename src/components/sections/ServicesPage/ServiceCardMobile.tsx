"use client";
import React, { forwardRef, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AnimatedBorder from "@/components/animations/AnimatedBorder";
import ParallaxImage from "@/components/animations/ParallaxImage";

gsap.registerPlugin(ScrollTrigger);

interface ServiceCardMobileProps {
  service: any;
  index: number;
}

const ServiceCardMobile = forwardRef<HTMLDivElement, ServiceCardMobileProps>(
  ({ service, index }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const textContentRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
      if (!textContentRef.current) return;

      const words = gsap.utils.toArray<HTMLElement>(".reveal-word-inner", textContentRef.current);

      const revealAnim = gsap.fromTo(
        words,
        { yPercent: 100, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.02,
          ease: "back.out(1.2)",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 20%", 
            toggleActions: "play none none none",
            id: `word-reveal-${index}`, 
          },
        }
      );

      return () => {
        if (revealAnim.scrollTrigger) revealAnim.scrollTrigger.kill();
        revealAnim.kill();
      };
    }, { scope: containerRef });

    const renderSplitText = (text: string) => {
      return text.split(" ").map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.2em]">
          <span className="reveal-word-inner inline-block opacity-0">
            {word}
          </span>
        </span>
      ));
    };

    return (
      <div
        ref={ref}
        className="service-card absolute top-0 left-0 w-full h-full bg-off-white border-t border-ink-black/40 overflow-hidden"
        style={{ zIndex: index + 1 }}
      >
        <div className="absolute top-0 left-0 w-full z-30">
          <AnimatedBorder origin="left" className="bg-ink-black/10" duration={1.2} />
        </div>

        {/* Compact Centered Container */}
        <div 
          ref={containerRef} 
          className="flex flex-col justify-start items-center h-full px-6 py-12 relative max-w-md mx-auto"
        >
          {/* Smaller Centered Image Section */}
          <div className="relative w-full mb-6 mx-auto">
            <ParallaxImage 
              src={service.image_main} 
              alt={service.title} 
              className="w-full h-full object-cover aspect-square" 
            />
            <span 
              className="absolute top-3 right-3 text-soft-yellow text-lg tracking-widest z-10 "
            >
              0{index + 1}
            </span>
          </div>

          {/* Text Content Section */}
          <div ref={textContentRef} className="w-full space-y-5 text-center px-2">
            <h3 className="text-[clamp(26px,7.5vw,32px)] leading-none uppercase tracking-tighter text-black flex flex-wrap justify-center">
              {renderSplitText(service.title)}
            </h3>
            
            <div className="flex justify-center">
              <span className="inline-block border border-ink-black/30 px-3 py-1 text-[12px]  uppercase tracking-widest text-black/60">
                {service.tags?.[0] || "EVENT PLANNING"}
              </span>
            </div>

            <span className="text-base uppercase tracking-tight leading-snug text-ink-black800 flex flex-wrap justify-center">
              {renderSplitText(service.description)}
            </span>
          </div>
        </div>
      </div>
    );
  }
);

ServiceCardMobile.displayName = "ServiceCardMobile";
export default ServiceCardMobile;