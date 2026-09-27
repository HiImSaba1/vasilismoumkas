"use client";

import React, { useRef, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import ParallaxImage from "@/components/animations/ParallaxImage";
import AnimatedBorder from "@/components/animations/AnimatedBorder";
import { Project } from "@/app/(site)/data/ProjectsData";
import { homeServices } from "@/app/(site)/data/ServicesData";

gsap.registerPlugin(SplitText);

const ProjectHero = ({ project }: { project: Project }) => {
  const heroTitleRef = useRef<HTMLDivElement>(null);

  // Logic for the Category Link (Matches your CinematicSlider)
  const categoryHref = useMemo(() => {
    const projectCat = project.category?.toLowerCase() || "";
    const matchingService = homeServices.find((s) => {
      const serviceTitle = s.title.toLowerCase();
      return (
        serviceTitle === projectCat ||
        serviceTitle === `${projectCat}s` ||
        `${serviceTitle}s` === projectCat
      );
    });
    return matchingService
      ? `/portfolio/${matchingService.slug}`
      : "/portfolio/editorial";
  }, [project.category]);

  const titleClasses =
    "text-[9vw] md:text-[6vw] lg:text-[7vw] uppercase text-soft-yellow leading-none text-center tracking-tighter block w-full font-karena px-4";

  useGSAP(
    () => {
      if (!heroTitleRef.current) return;

      const staticWrap = heroTitleRef.current.querySelector(".static-wrap");
      const animatedWrap = heroTitleRef.current.querySelector(".animated-wrap");
      const revealElement =
        heroTitleRef.current.querySelector(".hero-title-reveal");

      if (revealElement) {
        const split = new SplitText(revealElement, {
          type: "words",
          wordsClass: "overflow-hidden px-[0.1em]",
        });
        const words = new SplitText(split.words, { type: "words" });
        gsap.from(words.words, {
          y: "110%",
          duration: 1.5,
          ease: "power4.out",
          stagger: 0.1,
          delay: 0.8,
        });
      }

      const onEnter = () => {
        gsap.to(staticWrap, {
          y: "-100%",
          duration: 0.6,
          ease: "power4.inOut",
        });
        gsap.to(animatedWrap, { y: "0%", duration: 0.6, ease: "power4.inOut" });
      };

      const onLeave = () => {
        gsap.to(staticWrap, { y: "0%", duration: 0.6, ease: "power4.inOut" });
        gsap.to(animatedWrap, {
          y: "100%",
          duration: 0.6,
          ease: "power4.inOut",
        });
      };

      heroTitleRef.current.addEventListener("mouseenter", onEnter);
      heroTitleRef.current.addEventListener("mouseleave", onLeave);
      return () => {
        heroTitleRef.current?.removeEventListener("mouseenter", onEnter);
        heroTitleRef.current?.removeEventListener("mouseleave", onLeave);
      };
    },
    { scope: heroTitleRef },
  );

  return (
    <section className="relative w-full h-screen flex flex-col justify-center overflow-hidden">
      <motion.div
        initial={{ clipPath: "inset(20% 20% 20% 20%)" }}
        animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
        transition={{ duration: 1.5, ease: [0.19, 1, 0.22, 1] }}
        className="absolute inset-0 z-0"
      >
        <ParallaxImage
          src={project.thumbnail}
          alt={project.title}
          priority
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-ink-black/50" />
      </motion.div>

      <div className="relative z-20 px-6 md:px-12 w-full">
        <AnimatedBorder
          className="bg-soft-yellow/70 w-full"
          origin="left"
          delay={0.5}
        />
      </div>

      <div className="relative z-10 w-full px-6 md:px-12 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-8">
          {/* Left Side: Mobile & Desktop visible */}
          <div className="col-span-12 md:col-span-2 flex flex-col items-center md:items-start space-y-4 md:space-y-2">
            <p className="text-white/80 text-[12px] md:text-sm  leading-tight uppercase tracking-wider text-center md:text-start">
              Selected Work <br />
              {project.location} &copy; {new Date().getFullYear()}
            </p>
          </div>

          {/* Center: Title */}
          <div className="col-span-12 md:col-span-8 flex flex-col items-center justify-center">
            {/* TITLE CONTAINER */}
            <div
              ref={heroTitleRef}
              className="relative overflow-hidden w-full h-[25vw] md:h-[15vw]"
            >
              <div className="static-wrap w-full h-full flex items-center justify-center">
                <span className={`hero-title-reveal ${titleClasses}`}>
                  {project.title}
                </span>
              </div>
              <div
                className="animated-wrap absolute inset-0 w-full h-full flex items-center justify-center"
                style={{ transform: "translateY(100%)" }}
              >
                <span className={titleClasses}>{project.location}</span>
              </div>
            </div>

            {/* CATEGORY LINK - Moved here to be below the title */}
            <Link
              href={categoryHref}
              className="group/cat pointer-events-auto"
            >
              <p className="text-white/80 text-[12px] md:text-sm  leading-tight uppercase tracking-widest text-center group-hover/cat:text-soft-yellow transition-colors duration-300">
                <span className="text-white group-hover/cat:text-soft-yellow">
                  {project.category}
                </span>
              </p>
            </Link>
          </div>

          {/* Right Side: Hidden on Mobile */}
          <div className="hidden md:block col-span-2 text-right">
            <p className="text-white/80 text-[10px] md:text-sm  leading-relaxed uppercase tracking-wider">
              Exploring boundaries of visual storytelling.
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-20 px-6 md:px-12 w-full">
        <AnimatedBorder
          className="bg-soft-yellow/70 w-full"
          origin="right"
          delay={0.7}
        />
      </div>
    </section>
  );
};

export default ProjectHero;
