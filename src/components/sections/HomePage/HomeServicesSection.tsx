"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import SeoImage from "@/components/ui/SeoImage";
import RevealAnimation from "@/components/animations/RevealAnimation";
import HomeMarqueeImages from "./HomeMarqueeImages";
import AnimatedBorder from "@/components/animations/AnimatedBorder";
import { homeServices } from "@/app/(site)/data/ServicesData";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function HomeServicesSection() {
  return (
    <section className="relative py-10 lg:py-20 w-full overflow-hidden">
      <div className="flex flex-col gap-12 lg:gap-20 bg-ink-black/97 px-4 pt-12 lg:pt-20 pb-4">
        <div className="lg:grid lg:grid-cols-12 gap-12">
          <div className="flex flex-col col-span-12 lg:col-span-8 lg:col-start-2 px-2 md:px-0">
            <RevealAnimation>
              <h2
                className="text-[10px] lg:text-[12px] text-soft-yellow uppercase font-medium tracking-wider mb-2"
                style={{ fontFamily: "var(--font-karena)" }}
              >
                Expertise
              </h2>
            </RevealAnimation>
            <RevealAnimation>
              <p
                className="text-off-white text-[clamp(20px,2.5vw,30px)] font-medium leading-[1.1]"
                style={{ fontFamily: "var(--font-karena)" }}
              >
                Capturing the art of human connection through a lens of
                sophistication transforming moments into a permanent visual
                legacy.
              </p>
            </RevealAnimation>
          </div>
        </div>

        <div className="flex flex-col bg-ink-black px-4 lg:px-5">
          <ServicesList />
          <HomeMarqueeImages />
        </div>
      </div>
    </section>
  );
}

function ServicesList() {
  return (
    <ul className="relative flex flex-col w-full">
      {homeServices.map((service, index) => (
        <ServiceCard
          key={service.title}
          service={service}
          index={index}
          isLast={index === homeServices.length - 1}
        />
      ))}
    </ul>
  );
}

function ServiceCard({
  service,
  index,
  isLast,
}: {
  service: any;
  index: number;
  isLast: boolean;
}) {
  const imageContainerRef = useRef(null);

  const isImageInView = useInView(imageContainerRef, {
    once: true,
    margin: "0px 0px -10% 0px",
  });

  const { scrollYProgress } = useScroll({
    target: imageContainerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <li className="relative flex flex-col group w-full isolate">
      <div className="relative flex flex-col lg:grid lg:grid-cols-12 lg:gap-2 lg:items-center pt-8 md:pt-16 pb-6 lg:pb-12 px-2">
        {/* Index */}
        <div className="lg:col-span-1">
          <RevealAnimation>
            <p
              className="text-[10px] lg:text-[14px] text-off-white uppercase mb-4 lg:mb-0"
              style={{ fontFamily: "var(--font-karena)" }}
            >
              0{index + 1}
            </p>
          </RevealAnimation>
        </div>

        {/* Title */}
        <div className="lg:col-span-3 mb-4 lg:mb-0">
          <RevealAnimation>
            <span className="text-4xl md:text-[clamp(24px,3.5vw,42px)] text-soft-yellow tracking-tight leading-none">
              {service.title}
            </span>
          </RevealAnimation>
        </div>

        {/* Description & CTA */}
        <div className="flex flex-col gap-4 md:gap-8 lg:col-span-4 mb-8 lg:mb-0">
          <RevealAnimation>
            <p className="text-[16px] lg:text-[15px] text-soft-white font-normal leading-[1.2] max-w-[93%] md:max-w-[80%]">
              {service.description}
            </p>
          </RevealAnimation>

          <div className="flex flex-col gap-8">
            <ul className="flex gap-1 flex-wrap max-w-sm">
              {service.keywords.map((keyword: string) => (
                <li key={keyword} className="overflow-hidden">
                  <RevealAnimation>
                    <span className="inline-block text-[12px]  text-off-white border border-off-white/30 uppercase px-2 py-1">
                      {keyword}
                    </span>
                  </RevealAnimation>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Clickable Parallax Image */}
        <div className="lg:col-span-4 relative">
          <Link
            href={`/portfolio/project/${service.projectSlug}`}
            className="block w-full cursor-pointer group/img"
            aria-label={`View ${service.title} project`}
          >
            <div
              ref={imageContainerRef}
              className="w-full h-86 md:h-104 overflow-hidden relative isolate bg-neutral-900 transition-transform duration-700 ease-out group-hover/img:scale-[0.98]"
            >
              <motion.div
                className="absolute inset-0 w-full h-[120%]"
                style={{ y }}
              >
                <SeoImage
                  src={service.image}
                  description={`${service.title.toLowerCase()}-wedding-photography`}
                  location="greece-italy"
                  fill
                  priority={index === 0}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover/img:scale-105"
                />
              </motion.div>
            </div>
          </Link>
        </div>
      </div>

      {!isLast && (
        <div className="absolute bottom-0 left-0 w-full px-2">
          <AnimatedBorder
            origin="left"
            duration={1.5}
            className="bg-off-white/60"
          />
        </div>
      )}
    </li>
  );
}