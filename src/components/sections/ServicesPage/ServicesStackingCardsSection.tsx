"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { services, getDynamicServices, Service } from "@/app/(site)/data/ServicesData";
import ServiceCard from "./ServiceCard";
import ServiceCardMobile from "./ServiceCardMobile";
import useWindowSize from "@/lib/useWindowSize";

gsap.registerPlugin(ScrollTrigger);

const ServicesStackingCardsSection = ({content}:{content?:{title:string;description:string;image_main?:string;image_small?:string;imageAlt?:string;detailAlt?:string;caption?:string;tags?:string[]}[]}) => {
  const scrollWrapperRef = useRef<HTMLDivElement>(null);
  const pinContainerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const { width } = useWindowSize();
  
  // Start with empty or default, but handle mapping strictly on client
  const [displayServices, setDisplayServices] = useState<Service[]>([]);
  const [hasMounted, setHasMounted] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const frame=requestAnimationFrame(()=>{
      setHasMounted(true);
      const randomized = getDynamicServices();
      setDisplayServices(randomized.map((service,index)=>{const saved=content?.[index];const tags=saved?.tags;return {...service,...saved,image_main:saved?.image_main||service.image_main,image_small:saved?.image_small||service.image_small,tags:tags&&tags.length?tags:service.tags};}));
    });
    
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => {cancelAnimationFrame(frame);clearTimeout(timer);};
  }, [content]);

  const isMobile = useMemo(() => {
    if (!hasMounted) return false;
    return width > 0 && width < 768;
  }, [width, hasMounted]);

  useGSAP(
    () => {
      if (!isReady || !pinContainerRef.current || !scrollWrapperRef.current) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          id: "stacking-cards-main",
          trigger: scrollWrapperRef.current,
          start: "top top",
          end: "bottom bottom",
          pin: pinContainerRef.current,
          scrub: true,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });

      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        if (i === 0) {
          gsap.set(card, { yPercent: 0, opacity: 1 });
        } else {
          tl.fromTo(
            card,
            { yPercent: 100, opacity: 1 },
            {
              yPercent: 0,
              y: i * (isMobile ? 20 : 100),
              ease: "none",
            },
            (i - 1) * 0.5
          );
        }
      });

      ScrollTrigger.refresh();
    },
    { scope: scrollWrapperRef, dependencies: [isMobile, isReady, displayServices] }
  );

  return (
    <section
      ref={scrollWrapperRef}
      className="relative z-20 w-full bg-off-white px-2 md:px-4 py-6"
style={{
    height: isMobile
      ? `${(services.length * 100) - 80}vh` 
      : `${(services.length * 80) - 20}vh`,
  }}
    >
      <div
        ref={pinContainerRef}
        className={`relative h-dvh md:h-[85vh] w-full overflow-hidden bg-off-white transition-opacity duration-500 ${isReady ? 'opacity-100' : 'opacity-0'}`}
      >
        {hasMounted && displayServices.map((service, index) => {
          const CardComponent = isMobile ? ServiceCardMobile : ServiceCard;
          return (
            <CardComponent
              key={`${isMobile ? "mob" : "desk"}-${index}`}
              service={service}
              index={index}
              ref={(el) => { cardsRef.current[index] = el; }}
            />
          );
        })}
      </div>
    </section>
  );
};

export default ServicesStackingCardsSection;