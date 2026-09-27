"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

interface AnimatedBorderProps {
  className?: string;
  origin?: "left" | "right" | "center" | "top" | "bottom";
  duration?: number;
  delay?: number;
  isVertical?: boolean;
}

const AnimatedBorder = ({
  className = "",
  origin = "left",
  duration = 1.5,
  delay = 0,
  isVertical = false,
}: AnimatedBorderProps) => {
  const borderRef = useRef<HTMLDivElement>(null);
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!borderRef.current) return;

      const isHoriz = !isVertical;

      gsap.fromTo(
        borderRef.current,
        {
          scaleX: isHoriz ? 0 : 1,
          scaleY: isVertical ? 0 : 1,
        },
        {
          scaleX: 1,
          scaleY: 1,
          duration: duration,
          delay: delay,
          immediateRender: false,
          ease: "power4.inOut",
          transformOrigin: origin,
          scrollTrigger: {
            trigger: borderRef.current,
            start: "top 98%",
            toggleActions: "play none none reverse",
          },
        }
      );
    },
    { scope: container, dependencies: [isVertical, duration, delay, origin] }
  );

  return (
    <div ref={container} className="relative w-full h-full">
      <div
        ref={borderRef}
        className={`${isVertical ? "w-px h-full" : "h-px w-full"} ${
          !className.includes("bg-") ? "bg-ink-black" : ""
        } ${className}`}
        style={{
          willChange: "transform",
          transform: isVertical ? "scaleY(0)" : "scaleX(0)",
        }}
      />
    </div>
  );
};

export default AnimatedBorder;
