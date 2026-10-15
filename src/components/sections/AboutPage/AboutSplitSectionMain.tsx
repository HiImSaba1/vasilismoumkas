"use client";

import React from "react";
import Link from "next/link";
import ParallaxImage from "@/components/animations/ParallaxImage";
import type {HomepageSettings} from "@/lib/homepage-settings";

export default function AboutSplitSectionMain({cards}:{cards:HomepageSettings["featuredCards"]}) {
  const galleryItems = [
    {
      id: 1,
      src: cards[0].image,
      description: cards[0].alt,
      location: cards[0].subtitle,
      couple: cards[0].title,
      href: cards[0].href,
      wrapperClasses: "flex w-full justify-center py-4 md:row-start-1 md:grid md:grid-cols-[20%_60%_20%] md:py-0",
      cardClasses: "mx-auto h-auto w-[82%] max-w-[290px] aspect-[4/5] md:col-start-2 md:h-full md:w-full md:max-w-none md:aspect-auto",
      sizes: "(max-width: 768px) 82vw, 60vw",
    },
   {
      id: 2,
      src: cards[1].image,
      description: cards[1].alt,
      location: cards[1].subtitle,
      couple: cards[1].title,
      href: cards[1].href,
      wrapperClasses: "flex w-full justify-end py-6 md:row-start-2 md:grid md:grid-cols-[30%_30%_40%] md:py-0",
      cardClasses: "ml-auto h-auto w-[90%] max-w-[380px] aspect-[4/5] md:col-start-3 md:h-full md:w-full md:max-w-none md:aspect-auto",
      sizes: "(max-width: 768px) 90vw, 40vw",
    },
   
    {
      id: 3,
      src: cards[2].image,
      description: cards[2].alt,
      location: cards[2].subtitle,
      couple: cards[2].title,
      href: cards[2].href,
      wrapperClasses: "flex w-full justify-start py-12 md:row-start-3 md:grid md:grid-cols-[30%_40%_30%] md:py-0",
      cardClasses: "mr-auto h-auto w-[68%] max-w-[270px] aspect-[3/4] md:col-start-1 md:h-full md:w-full md:max-w-none md:aspect-auto",
      sizes: "(max-width: 768px) 68vw, 30vw",
    },
  ];

  return (
    <section
      className="relative flex h-auto w-full flex-col justify-center overflow-hidden bg-off-white px-2 pb-[15%] pt-4 md:h-full"
    >
      <div className="relative mx-auto flex w-full max-w-[1536px] flex-col space-y-2 md:grid md:h-full md:grid-cols-1 md:grid-rows-3 md:space-y-0">
        {galleryItems.map((item) => (
          <div key={item.id} className={item.wrapperClasses}>
            <div className={`metro-card flex flex-col ${item.cardClasses}`}>
              <Link
                href={item.href}
                className="relative block min-h-0 w-full flex-1 cursor-pointer overflow-hidden"
              >
                <div className="relative w-full h-full overflow-hidden">
                  <ParallaxImage
                    src={item.src}
                    description={item.description}
                    location={item.location}
                    sizes={item.sizes}
                    className="h-full w-full"
                  />
                </div>
              </Link>

              {/* Couple Name & Place Below Card */}
              <div className="mt-4 flex flex-col items-center justify-between px-4 text-ink-black md:flex-row md:px-8">
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
