"use client";

import React from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import RevealAnimation from "@/components/animations/RevealAnimation";
import { ProjectsData } from "@/app/(site)/data/ProjectsData";
import AnimatedBorder from "@/components/animations/AnimatedBorder";
import CTAButton from "@/components/ui/CTAButton";
import ProjectCard from "../Projects/ProjectCard";
import type {HomepageSettings} from "@/lib/homepage-settings";

if (typeof window !== "undefined") {
  gsap.registerPlugin(SplitText);
}

interface HomeProjectsGridProps {
  isBaptism?: boolean;
  content?:HomepageSettings["portfolio"];
}

const HomeProjectsGrid = ({ isBaptism = false,content }: HomeProjectsGridProps) => {
  // Φιλτράρουμε τα projects βάσει κατηγορίας
  const filteredProjects = ProjectsData.filter(
    (p) => p.category === (isBaptism ? "Baptism" : "Wedding")
  );

  // Never cross event categories: a baptism offer must not fall back to wedding work.
  const displayedProjects = content?.items.map(item=>({title:item.title,location:item.location,thumbnail:item.image,href:item.href,alt:item.alt}))??filteredProjects.slice(0, 2);

  return (
    <section className="relative min-h-0 w-full bg-off-white px-4 py-6 lg:px-8">
      <div className="relative mt-5 mb-6 flex w-full flex-col items-center gap-4 pt-4 text-center md:mt-16 md:flex-row md:items-center md:justify-between md:gap-0 md:pt-12 md:text-left">
        <div className="w-full md:flex-1 md:pr-4">
          <RevealAnimation>
            <span className="block w-full text-center text-[14px] uppercase leading-[1.1] tracking-wide text-ink-black/80 xs:text-[16px] md:text-left md:text-lg lg:text-xl">
              {content?.title??<>Best of {isBaptism ? "Baptism" : "Wedding"} <br className="hidden xs:block" />Portfolio works</>}
            </span>
          </RevealAnimation>
          {content?.subtitle&&<RevealAnimation><p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-ink-black/60 md:mx-0 md:text-base">{content.subtitle}</p></RevealAnimation>}
        </div>
        <div className="shrink-0">
          <RevealAnimation>
            <CTAButton
              href={content?.buttonHref??"/portfolio"}
              className="px-4 py-2 "
            >
              <span className="text-md xs:text-xl">Portfolio</span>
            </CTAButton>
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

      <div className="mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:gap-x-14">
        {displayedProjects.map((project, index) => (
          <div key={"href" in project?project.href:project.id} className={index===1?"md:mt-[clamp(10rem,24vw,22rem)]":""}>
            <ProjectCard project={project} index={index}/>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HomeProjectsGrid;
