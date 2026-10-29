"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import ParallaxImage from "@/components/animations/ParallaxImage";
import type { Project } from "@/app/(site)/data/ProjectsData";
import {projectHeaderAlt} from "@/lib/project-presentation";

if (typeof window !== "undefined") {
  gsap.registerPlugin(SplitText);
}

type ProjectCardProject=Pick<Project,"title"|"thumbnail"|"location">&Partial<Pick<Project,"slug"|"headerImageAlt"|"photoset">>&{href?:string;alt?:string;caption?:string};

export default function ProjectCard({ project, index, hoverOverlay=true, portrait=false, persistentCaption=false }: { project: ProjectCardProject; index: number; hoverOverlay?: boolean; portrait?: boolean; persistentCaption?: boolean }) {
  const imageAlt=project.alt??projectHeaderAlt({...project,photoset:project.photoset??[]});
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
      if (!hoverOverlay || !titleRef.current || !borderRef.current || !cardRef.current) return;

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

          const cta=cardRef.current?.querySelector(".card-hover-cta");
          if(cta)gsap.fromTo(cta,{y:18,opacity:0},{y:0,opacity:1,duration:0.65,delay:0.15,ease:"power3.out",overwrite:true});
        };

        const onLeave = () => {
          gsap.to(borderRef.current, {
            scaleX: 0,
            duration: 0.5,
            ease: "power3.in",
          });
          const cta=cardRef.current?.querySelector(".card-hover-cta");
          if(cta)gsap.to(cta,{y:12,opacity:0,duration:0.35,ease:"power3.in",overwrite:true});
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
    { scope: cardRef, dependencies:[hoverOverlay] }
  );

  const initialClip = isMobile || !hoverOverlay
    ? "polygon(0 0, 100% 0, 100% 100%, 0 100%)"
    : "polygon(0 0, 100% 0, 100% 0, 0 0)";
  const animateClip = "polygon(0 0, 100% 0, 100% 100%, 0 100%)";

  const projectLink = project.href??`/portfolio/project/${project.slug}`;

  return (
    <div ref={cardRef} className={`relative flex cursor-pointer flex-col ${hoverOverlay?"group":""}`}>
      <Link
        href={projectLink}
        className={`relative mb-4 block overflow-hidden ${portrait?"md:aspect-[4/5]":"md:aspect-square xl:aspect-3/4"}`}
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
          <img src={project.thumbnail} alt={imageAlt} loading={!hoverOverlay||index<2?"eager":"lazy"} decoding="async" data-portfolio-card-image className="block h-auto w-full object-contain md:hidden"/>
          <ParallaxImage src={project.thumbnail} alt={imageAlt} priority={!hoverOverlay||index<2} className={`hidden h-full w-full md:block ${hoverOverlay?"transition-transform duration-900 ease-out group-hover:scale-105":""}`}/>
          {hoverOverlay&&<motion.div className="absolute inset-0 z-10 hidden flex-col items-center justify-center bg-ink-black/40 p-4 opacity-0 transition-opacity duration-500 group-hover:opacity-100 md:flex">
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
            <span className="card-hover-cta mt-6 border border-soft-yellow/70 px-5 py-3 text-[11px] uppercase tracking-[0.16em] text-soft-yellow opacity-0">
              View Project
            </span>
          </motion.div>}
        </motion.div>
        {project.caption&&<span className="absolute inset-x-0 bottom-0 z-30 bg-ink-black/60 p-2 text-xs text-white">{project.caption}</span>}
      </Link>

      <div className={`flex flex-col items-center justify-between px-1 text-center text-ink-black ${persistentCaption ? "" : "md:hidden"}`}>
        <span className="text-[16px] font-medium uppercase tracking-wider">
          <Link href={projectLink} className="hover:opacity-60 transition-opacity">
            {project.title}
          </Link>
        </span>
        <span className="mt-1 text-[13px] uppercase tracking-wide opacity-75">
          {project.location}
        </span>
      </div>
    </div>
  );
}
