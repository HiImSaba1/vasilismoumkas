"use client";

import React from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import RevealAnimation from "@/components/animations/RevealAnimation";
import { ProjectsData } from "@/app/(site)/data/ProjectsData";
import AnimatedBorder from "@/components/animations/AnimatedBorder";
import RevealButton from "@/components/ui/RevealButton";
import ProjectCard from "../Projects/ProjectCard";

if (typeof window !== "undefined") {
  gsap.registerPlugin(SplitText);
}

interface HomeProjectsGridProps {
  isBaptism?: boolean;
  compact?: boolean;
}

const HomeProjectsGrid = ({ isBaptism = false, compact = false }: HomeProjectsGridProps) => {
  // Φιλτράρουμε τα projects βάσει κατηγορίας
  const filteredProjects = ProjectsData.filter(
    (p) => p.category === (isBaptism ? "Baptism" : "Wedding")
  );

  // Never cross event categories: a baptism offer must not fall back to wedding work.
  const displayedProjects = filteredProjects.slice(0, 3);

  return (
    <section className={`${compact ? "min-h-0" : "min-h-dvh"} w-full px-4 lg:px-8 py-6 bg-off-white relative`}>
      <div className="flex flex-row items-center justify-between mt-10 md:mt-16 mb-6 pt-8 md:pt-12 relative w-full">
        <div className="flex-1 pr-4 ">
          <RevealAnimation>
            <span className="text-[14px] xs:text-[16px] md:text-lg lg:text-xl uppercase tracking-wide text-ink-black/80 leading-[1.1] block">
              Best of {isBaptism ? "Baptism" : "Wedding"} <br className="hidden xs:block" />
              Portfolio works
            </span>
          </RevealAnimation>
        </div>
        <div className="shrink-0">
          <RevealAnimation>
            <RevealButton
              href="/portfolio"
              className="px-4 py-2 "
            >
              <div className="flex items-center gap-2">
                <span className="text-md xs:text-xl">Full Portfolio</span>
                <span className="text-sm md:text-2xl translate-y-px">→</span>
              </div>
            </RevealButton>
          </RevealAnimation>
        </div>
      </div>
      
      <div className="absolute top-0 left-0 w-full px-4 lg:px-8">
        <AnimatedBorder
          origin="left"
          duration={1.8}
          className="bg-ink-black/70"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-12">
        {displayedProjects.map((project, index) => (
          <ProjectCard key={project.id} project={project} index={index} />
        ))}
      </div>
    </section>
  );
};

export default HomeProjectsGrid;
