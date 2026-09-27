"use client";

import React, { useState, useEffect } from "react";
import { Project } from "@/app/(site)/data/ProjectsData";
import Link from "next/link";
import SeoImage from "@/components/ui/SeoImage";
import { motion } from "framer-motion";
import ProjectContent from "./ProjectContent";
import Navbar from "@/components/core/Navbar";
import AnimatedBorder from "@/components/animations/AnimatedBorder";

const sharedTransition = {
  duration: 0.6,
  ease: [0.19, 1, 0.22, 1] as const,
};

interface ProjectLayoutProps {
  project: Project | undefined;
  nextProject: Project | undefined;
  prevProject: Project | undefined;
}

const ProjectLayout: React.FC<ProjectLayoutProps> = ({
  project,
  nextProject,
  prevProject,
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!project) return null;

  return (
    <>
      <Navbar />
      <main className="min-h-dvh">
        <ProjectContent project={project} />
      </main>

      <div className="px-4 md:px-8 w-full">
        <footer className="w-full h-[35vh] md:h-[60vh] grid grid-cols-12 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full z-30">
            <AnimatedBorder
              origin="left"
              duration={2}
              className="bg-ink-black/70"
            />
          </div>

          {/* PREVIOUS PROJECT */}
          <div className="col-span-5 md:col-span-5 relative group">
            {prevProject && (
              <NavigationLink
                project={prevProject}
                label="Prev"
                align="left"
                isMobile={isMobile}
              />
            )}
            <motion.div
              initial={{ height: 0 }}
              whileInView={{ height: "100%" }}
              viewport={{ once: true }}
              transition={{
                duration: 1.5,
                delay: 0.5,
                ease: [0.19, 1, 0.22, 1] as const,
              }}
              className="absolute right-0 top-0 w-px bg-ink-black/20 z-30 origin-top"
            />
          </div>

          {/* CENTER BUTTON */}
          <div className="col-span-2 md:col-span-2 relative z-20">
            <AllWorksButton isMobile={isMobile} />
          </div>

          {/* NEXT PROJECT */}
          <div className="col-span-5 md:col-span-5 relative group">
            <motion.div
              initial={{ height: 0 }}
              whileInView={{ height: "100%" }}
              viewport={{ once: true }}
              transition={{
                duration: 1.5,
                delay: 0.7,
                ease: [0.19, 1, 0.22, 1] as const,
              }}
              className="absolute left-0 top-0 w-px bg-ink-black/20 z-30 origin-top"
            />
            {nextProject && (
              <NavigationLink
                project={nextProject}
                label="Next"
                align="right"
                isMobile={isMobile}
              />
            )}
          </div>
        </footer>
      </div>
    </>
  );
};

/* --- Navigation Link --- */
function NavigationLink({
  project,
  label,
  align,
  isMobile,
}: {
  project: Project;
  label: string;
  align: "left" | "right";
  isMobile: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const activeHover = isHovered && !isMobile;
  const hiddenClip =
    align === "left" ? "inset(0 100% 0 0)" : "inset(0 0 0 100%)";

  return (
    <Link
      href={`/portfolio/project/${project.slug}`}
      className="w-full h-full flex flex-col justify-center px-4 md:px-12 relative z-10 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!isMobile && (
        <motion.div
          animate={{ clipPath: activeHover ? "inset(0 0% 0 0)" : hiddenClip }}
          transition={sharedTransition}
          className="absolute inset-0 z-0 overflow-hidden grayscale pointer-events-none"
        >
          <motion.div
            animate={{ scale: activeHover ? 1 : 1.1 }}
            transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] as const }}
            className="w-full h-full relative"
          >
            <SeoImage
              src={project.thumbnail}
              description={`portfolio-project-${project.title.toLowerCase().replace(/ /g, "-")}`}
              location="greece-italy"
              fill
              className="object-cover"
              sizes="50vw"
            />
            <div className="absolute inset-0 bg-ink-black/40" />
          </motion.div>
        </motion.div>
      )}

      <motion.div
        animate={{ color: activeHover ? "#ffffc4" : "#161615" }}
        transition={{ duration: 0.4 }}
        className={`relative z-10 flex flex-col ${
          align === "right" ? "items-end text-right" : "items-start text-left"
        }`}
      >
        <motion.span
          animate={{
            x: activeHover ? (align === "left" ? 5 : -5) : 0,
            opacity: activeHover ? 1 : 0.4,
          }}
          transition={sharedTransition}
          className="text-[12px] md:text-sm  uppercase tracking-widest mb-2 md:mb-4"
        >
          {label}
        </motion.span>
        <span className="text-xl sm:text-3xl md:text-4xl lg:text-5xl uppercase font-saans-bold leading-tight md:leading-none tracking-tighter">
          {project.title}
        </span>
      </motion.div>
    </Link>
  );
}

/* --- All Works Button --- */
function AllWorksButton({ isMobile }: { isMobile: boolean }) {
  const [isHovered, setIsHovered] = useState(false);
  const activeHover = isHovered && !isMobile;

  return (
    <Link
      href="/portfolio"
      className="w-full h-full flex items-center justify-center relative overflow-hidden group bg-transparent"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        animate={{
          clipPath: isMobile
            ? "inset(0% 0% 0% 0%)"
            : activeHover
              ? "inset(0 0 0% 0)"
              : "inset(0 0 100% 0)",
        }}
        transition={sharedTransition}
        className="absolute inset-0 bg-ink-black z-0"
      />
      <motion.span
        animate={{ color: isMobile || activeHover ? "#ffffc4" : "#161615" }}
        transition={{ duration: 0.4 }}
        className="text-[10px] md:text-md uppercase tracking-widest text-center leading-tight relative z-10"
      >
        All <br /> Works
      </motion.span>
    </Link>
  );
}

// THIS IS THE LINE YOU WERE MISSING:
export default ProjectLayout;
