"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import ParallaxImage from "@/components/animations/ParallaxImage";
import { Project } from "@/app/(site)/data/ProjectsData";
import CTAButton from "@/components/ui/CTAButton";

if (typeof window !== "undefined") {
  gsap.registerPlugin(SplitText);
}

export default function ProjectCard({ project, index }: { project: Project; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const borderRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isInView = useInView(cardRef, {
    once: true,
    margin: "0px 0px -10% 0px",
  });

  useGSAP(
    () => {
      if (!titleRef.current || !borderRef.current || !cardRef.current) return;

      const initSplit = () => {
        if (titleRef.current?.querySelectorAll(".word-child").length) return;

        const split = new SplitText(titleRef.current, {
          type: "words",
          wordsClass: "word-child",
        });

        split.words.forEach((word) => {
          const wrapper = document.createElement("div");
          Object.assign(wrapper.style, {
            display: "inline-block",
            overflow: "hidden",
            verticalAlign: "top",
          });
          word.parentNode?.insertBefore(wrapper, word);
          wrapper.appendChild(word);
        });

        const onEnter = () => {
          const words = titleRef.current?.querySelectorAll(".word-child");
          if (!words || words.length === 0) return;

          gsap.fromTo(
            words,
            { y: "100%" },
            {
              y: "0%",
              duration: 1,
              ease: "power3.out",
              stagger: 0.1,
              overwrite: true,
            }
          );

          if (borderRef.current) {
            gsap.fromTo(
              borderRef.current,
              { scaleX: 0 },
              {
                scaleX: 1,
                duration: 0.8,
                ease: "power3.out",
                transformOrigin: "center",
                overwrite: true,
              }
            );
          }
        };

        const onLeave = () => {
          gsap.to(borderRef.current, {
            scaleX: 0,
            duration: 0.5,
            ease: "power3.in",
          });
        };

        cardRef.current?.addEventListener("mouseenter", onEnter);
        cardRef.current?.addEventListener("mouseleave", onLeave);
      };

      if (document.fonts.status === "loaded") {
        initSplit();
      } else {
        document.fonts.ready.then(initSplit);
      }
    },
    { scope: cardRef }
  );

  const initialClip = isMobile
    ? "polygon(0 0, 100% 0, 100% 100%, 0 100%)"
    : "polygon(0 0, 100% 0, 100% 0, 0 0)";
  const animateClip = "polygon(0 0, 100% 0, 100% 100%, 0 100%)";

  const projectLink = `/portfolio/project/${project.slug}`;

  return (
    <div ref={cardRef} className="flex flex-col group cursor-pointer relative">
      <Link
        href={projectLink}
        className="relative mb-4 block overflow-hidden md:aspect-square xl:aspect-3/4"
      >
        <motion.div
          className="relative w-full md:h-full"
          initial={{ clipPath: initialClip }}
          animate={isInView ? { clipPath: animateClip } : { clipPath: initialClip }}
          transition={{
            duration: isMobile ? 0 : 0.8, // Lowered from 1.1 for speed
            delay: isMobile ? 0 : index * 0.05, // Lowered from 0.1 for faster sequence
            ease: [0.87, 0, 0.13, 1],
          }}
        >
          {/* Mobile keeps the source image's real aspect ratio. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={project.thumbnail} alt={project.title} loading={index<2?"eager":"lazy"} decoding="async" data-portfolio-card-image className="block h-auto w-full object-contain md:hidden"/>
          <ParallaxImage src={project.thumbnail} alt={project.title} className="hidden h-full w-full transition-transform duration-900 ease-out group-hover:scale-105 md:block"/>
          <motion.div className="absolute inset-0 z-10 hidden flex-col items-center justify-center bg-ink-black/40 p-4 opacity-0 transition-opacity duration-500 group-hover:opacity-100 md:flex">
            <span
              ref={titleRef}
              className="text-center text-soft-yellow text-3xl md:text-4xl uppercase tracking-tight leading-none px-4"
            >
              {project.title}
            </span>
            <div
              ref={borderRef}
              className="h-px mt-4 w-2/3 scale-x-0 bg-soft-yellow"
            />
          </motion.div>
        </motion.div>
      </Link>

      <div className="flex flex-col items-center justify-between px-1 text-center text-ink-black md:flex-row md:text-left">
        <span className="text-[16px] font-medium uppercase tracking-wider md:text-xl md:leading-none">
          <Link href={projectLink} className="hover:opacity-60 transition-opacity">
            {project.title}
          </Link>
        </span>
        <span className="mt-1 text-[13px] uppercase tracking-wide opacity-75 md:hidden">
          {project.location}
        </span>
        <div className="hidden items-center md:flex">
          <CTAButton href={projectLink}>View Project</CTAButton>
        </div>
      </div>
    </div>
  );
}
