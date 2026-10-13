"use client";

import React, { useRef } from "react";
import Link from "next/link";
import SeoImage from "@/components/ui/SeoImage";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type {HomepageSettings} from "@/lib/homepage-settings";

gsap.registerPlugin(ScrollTrigger);

export default function AboutSplitSectionMain({cards}:{cards:HomepageSettings["featuredCards"]}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const galleryItems = [
    {
      id: 1,
      src: cards[0].image,
      description: cards[0].alt,
      location: cards[0].subtitle,
      couple: cards[0].title,
      href: cards[0].href,
      // Centered wrapper
      wrapperClasses: "w-full flex justify-center py-12",
      // Using responsive inline styles that cleanly override from mobile to desktop using clamp() correctly
      cardStyle: {
        width: "100%",
        maxWidth: "clamp(320px, 85vw, 750px)",
        aspectRatio: "1 / 1",
      },
      mobileClasses: "mx-auto !w-[82%] !max-w-[290px] md:!w-full md:!max-w-[clamp(320px,85vw,750px)]",
      sizes: "(max-width: 768px) 90vw, 60vw",
    },
   {
      id: 2,
      src: cards[1].image,
      description: cards[1].alt,
      location: cards[1].subtitle,
      couple: cards[1].title,
      href: cards[1].href,
      // Desktop positioning wrapper: Center Right (pushed to the right)
      wrapperClasses: "w-full flex justify-end py-6 md:py-10  md:pr-[8%]",
      cardStyle: {
        minWidth: "clamp(420px, 45vw, 640px)",
        height: "clamp(520px, 58vw, 760px)",
      },
      mobileClasses: "w-[90%] max-w-[380px] aspect-[4/5] ml-auto",
      sizes: "(max-width: 768px) 90vw, 85vw",
    },
   
    {
      id: 3,
      src: cards[2].image,
      description: cards[2].alt,
      location: cards[2].subtitle,
      couple: cards[2].title,
      href: cards[2].href,
      // Desktop positioning wrapper: Bottom Left (pushed to the left)
      wrapperClasses: "w-full flex justify-start py-12 md:py-20 md:pl-[8%]",
      cardStyle: {
        minWidth: "clamp(320px, 34vw, 480px)",
        height: "clamp(420px, 44vw, 600px)",
      },
      mobileClasses: "!min-w-0 !w-[68%] !max-w-[270px] !h-auto aspect-[3/4] mr-auto md:!min-w-[clamp(320px,34vw,480px)] md:!w-auto md:!max-w-none md:!h-[clamp(420px,44vw,600px)]",
      sizes: "(max-width: 768px) 80vw, 40vw",
    },
  ];

  useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>(".metro-card");

      cards.forEach((card) => {
        gsap.fromTo(
          card,
          { clipPath: "inset(20% 0% 20% 0%)", opacity: 0, y: 60 },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });
    },
    { scope: containerRef },
  );

  return (
    <section
      ref={containerRef}
      className="relative w-full h-auto bg-off-white py-4 px-2 overflow-hidden flex flex-col justify-center"
    >
      <div className="relative w-full max-w-[1536px] mx-auto flex flex-col space-y-2 md:space-y-2">
        {galleryItems.map((item) => (
          <div key={item.id} className={item.wrapperClasses}>
            <div
              className={`metro-card flex flex-col group ${item.mobileClasses}`}
              style={item.cardStyle}
            >
              <Link
                href={item.href}
                className="relative w-full h-full overflow-hidden block cursor-pointer shadow-sm"
              >
                {/* Dark Overlay & Zoom on Hover */}
                <div className="absolute inset-0 bg-ink-black/0 group-hover:bg-ink-black/30 transition-colors duration-500 z-10 pointer-events-none" />

                <div className="relative w-full h-full overflow-hidden">
                  <SeoImage
                    src={item.src}
                    description={item.description}
                    location={item.location}
                    fill
                    sizes={item.sizes}
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                </div>
              </Link>

              {/* Couple Name & Place Below Card */}
              <div className="mt-4 flex flex-col md:flex-row justify-between items-center text-ink-black">
                <span className="text-[16px] md:text-[19px] font-medium uppercase tracking-wider">
                  {item.couple}
                </span>
                <span className="text-[13px] md:text-[14px] opacity-75 tracking-wide uppercase">
                  {item.location}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
