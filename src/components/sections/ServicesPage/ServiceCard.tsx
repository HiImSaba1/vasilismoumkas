"use client";
import React, { forwardRef } from "react";
import AnimatedBorder from "@/components/animations/AnimatedBorder";
import ParallaxImage from "@/components/animations/ParallaxImage";
import RevealAnimation from "@/components/animations/RevealAnimation";

interface ServiceCardProps {
  service: any;
  index: number;
}

const ServiceCard = forwardRef<HTMLDivElement, ServiceCardProps>(
  ({ service, index }, ref) => {
    return (
      <div
        ref={ref}
        className="service-card absolute top-0 left-0 w-full max-h-137.5 bg-off-white border-t border-ink-black shadow-[0_-10px_35px_rgba(0,0,0,0.1)] overflow-hidden"
        style={{
          zIndex: index + 1,
          transform: index === 0 ? "none" : "translateY(100%)",
        }}
      >
        <div className="absolute top-0 left-0 w-full">
          <AnimatedBorder
            origin="left"
            className="bg-ink-black/20"
            duration={1.2}
          />
        </div>

        <div className="h-full px-8 py-12">
          <div className="grid grid-cols-12 h-full gap-4">
            {/* COLUMN 1: Main Parallax Image */}
            <div className="col-span-3 flex gap-4 items-start">
              <ParallaxImage
                src={service.image_main}
                alt={service.title}
                className="aspect-4/5 w-full  hover:grayscale-100 transition-all duration-700"
              />
              <span
                className="text-red-600 text-lg leading-none pt-1"
                style={{ fontFamily: "var(--font-bricolage)" }}
              >
                0{index + 1}
              </span>
            </div>

            {/* COLUMN 2: Animated Text Content */}
            <div className="col-span-7 flex flex-col justify-between pl-8">
              <div className="grow">
                <span className="text-[clamp(32px,4.5vw,50px)] leading-[0.9] uppercase tracking-tighter text-black block">
                  {service.title}
                </span>
                <div className="flex flex-wrap gap-2 mt-6">
                  {service.tags.map((tag: string, i: number) => (
                    <div key={i} className="overflow-hidden">
                      <span className="tag-item border border-ink-black/30 px-3 py-1 text-[11px] uppercase tracking-widest text-black/60 block">
                        {tag}
                      </span>
                    </div>
                  ))}
                </div>
                {/* Description Reveal with slight delay */}
                <div className="max-w-md mt-12">
                  <p className="text-md uppercase tracking-tight leading-[1.1] text-ink-black600 block pb-8">
                    {service.description}
                  </p>
                </div>
              </div>
            </div>

            {/* COLUMN 3: Secondary Parallax Image */}
            <div className="col-span-2 flex flex-col justify-end items-end">
              <ParallaxImage
                src={service.image_small}
                alt="Detail View"
                className="w-full aspect-square"
              />
            </div>
          </div>
        </div>
      </div>
    );
  },
);

ServiceCard.displayName = "ServiceCard";
export default ServiceCard;
