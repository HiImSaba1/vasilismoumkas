"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import AnimatedBorder from "@/components/animations/AnimatedBorder";
import { Project } from "@/app/(site)/data/ProjectsData";

interface ProjectSidebarProps {
  project: Project;
  currentIdx: number;
}

const ProjectSidebar: React.FC<ProjectSidebarProps> = ({
  project,
  currentIdx,
}) => {
  const stickyColumnRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!stickyColumnRef.current) return;

      const elements = stickyColumnRef.current.querySelectorAll(".reveal-text");

      // FIX: Wait for fonts to be ready so SplitText calculates widths/heights correctly
      document.fonts.ready.then(() => {
        elements.forEach((el) => {
          // Double splitting is great for line-masking effects
          const split = new SplitText(el, {
            type: "lines",
            linesClass: "overflow-hidden py-[0.12em] -my-[0.12em]",
          });
          
          const lines = new SplitText(split.lines, { type: "lines" });

          gsap.from(lines.lines, {
            y: 100,
            duration: 1.2,
            ease: "power4.out",
            stagger: 0.1,
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
              toggleActions: "play none none none",
            },
          });
        });
      });
    },
    { scope: stickyColumnRef }
  );

  return (
    <aside
      ref={stickyColumnRef}
      className="col-span-12 md:col-span-4 relative md:pr-6 mb-12"
    >
      <div className="md:sticky md:top-12 md:h-[85vh] flex flex-col justify-between">
        <div className="space-y-2">
          <span className="reveal-text text-2xl md:text-3xl uppercase tracking-[0.2em] opacity-60 leading-[0.9]">
            Highlights of <br /> {project.title}
          </span>
        </div>

        <div className="space-y-2 mt-8 md:mt-0">
          <span className="reveal-text text-xl leading-[1.15] md:leading-none tracking-tight ">
            {project.description}
          </span>
          <div className="space-y-2">
            <div className="pt-4">
              <AnimatedBorder className="bg-ink-black/70 mb-2" origin="left" />
              <p className="reveal-text text-[10px] uppercase opacity-40 mb-1">
                Location
              </p>
              <p className="reveal-text text-sm uppercase tracking-wider">
                {project.location} 
              </p>
            </div>
            <div className="pt-4">
              <AnimatedBorder className="bg-ink-black/70 mb-4" origin="left" />
              <p className="reveal-text text-[10px] uppercase opacity-40 mb-1">
                Client
              </p>
              <p className="reveal-text text-sm uppercase tracking-wider">
                {project.client}
              </p>
            </div>
          </div>
        </div>

        <div className="hidden md:flex flex-col gap-4">
          <p className="reveal-text text-[12px] uppercase tracking-tight opacity-60">
            (Click to open any image in full view)
          </p>
          <div className="text-xl tracking-widest tabular-nums uppercase">
            <span className="opacity-100">
              {String(currentIdx).padStart(2, "0")}
            </span>
            <span className="opacity-30 mx-2">/</span>
            <span className="opacity-30">
              {String(project.photoset.length).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default ProjectSidebar;
