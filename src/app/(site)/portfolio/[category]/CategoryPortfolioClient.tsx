"use client";

import React, { useState, useEffect } from "react";
import type {Project} from "../../data/ProjectsData";
import { homeServices } from "../../data/ServicesData";
import Link from "next/link";
import SeoImage from "@/components/ui/SeoImage";
import { motion } from "framer-motion";
import ProjectCard from "@/components/sections/Projects/ProjectCard";
import ProjectHero from "@/components/sections/Projects/ProjectHero";
import AnimatedBorder from "@/components/animations/AnimatedBorder";
import Navbar from "@/components/core/Navbar";

const sharedTransition = {
  duration: 0.6,
  ease: [0.19, 1, 0.22, 1] as const,
};

export default function CategoryPortfolioClient({category,projects}:{category:string;projects:Project[]}) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const serviceInfo = homeServices.find(s => s.slug.toLowerCase() === category.toLowerCase());

  const filteredProjects = projects.filter((p) => {
    const cat = p.category.toLowerCase();
    const target = category.toLowerCase();
    return cat === target || cat === target.replace(/s$/, "") || target === cat.replace(/s$/, "");
  });

  if (!serviceInfo || filteredProjects.length === 0) return null;

  const currentIndex = homeServices.findIndex(s => s.slug === serviceInfo.slug);
  const prevCat = homeServices[(currentIndex - 1 + homeServices.length) % homeServices.length];
  const nextCat = homeServices[(currentIndex + 1) % homeServices.length];

  return (
    <>
      <Navbar />
      <main className="bg-off-white min-h-screen">
        <h1 className="sr-only">{category.toLowerCase()==="wedding"?"Wedding Photography Stories":`${serviceInfo.title} Photography Stories`}</h1>
        <ProjectHero
          project={{
            id: serviceInfo.slug,
            title: serviceInfo.title,
            location: "Selected Works",
            thumbnail: serviceInfo.categoryHeroImage,
            slug: serviceInfo.slug,
            description: serviceInfo.description,
            dateShot: "",
            client: "",
            category: serviceInfo.title,
            tags: [],
            photoset: []
          }}
        />

        <section className="w-full px-4 lg:px-8 py-20 relative">
          <div className="absolute top-0 left-0 w-full px-4 lg:px-8">
            <AnimatedBorder origin="left" duration={1.8} className="bg-ink-black/70" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-12 mb-32">
            {filteredProjects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>

          <footer className="w-full h-[40vh] md:h-[60vh] grid grid-cols-12 overflow-hidden relative border-t border-ink-black/10">
            <div className="absolute top-0 left-0 w-full z-30">
              <AnimatedBorder origin="left" duration={2} className="bg-ink-black/70" />
            </div>

            <div className="col-span-5 relative group">
              <NavigationLink
                title={prevCat.title}
                slug={prevCat.slug}
                image={prevCat.image}
                label="Previous Category"
                align="left"
                isMobile={isMobile}
              />
              <motion.div className="absolute right-0 top-0 w-px h-full bg-ink-black/20 z-30" />
            </div>

            <div className="col-span-2 relative z-20">
              <AllWorksButton isMobile={isMobile} />
            </div>

            <div className="col-span-5 relative group">
              <NavigationLink
                title={nextCat.title}
                slug={nextCat.slug}
                image={nextCat.image}
                label="Next Category"
                align="right"
                isMobile={isMobile}
              />
            </div>
          </footer>
        </section>
      </main>
    </>
  );
}

/* --- Navigation Link Helper --- */
function NavigationLink({title,slug,image,label,align,isMobile}:{title:string;slug:string;image:string;label:string;align:"left"|"right";isMobile:boolean}) {
  const [isHovered, setIsHovered] = useState(false);
  const activeHover = isHovered && !isMobile;
  const hiddenClip = align === "left" ? "inset(0 100% 0 0)" : "inset(0 0 0 100%)";

  return (
    <Link
      href={`/portfolio/${slug}`}
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
            transition={{ duration: 0.7 }}
            className="w-full h-full relative"
          >
<SeoImage
  src={image}
  fill
  className="object-cover"
  sizes="50vw"
  description="Wedding Photographer"
  location="Greece"
/>
            <div className="absolute inset-0 bg-ink-black/40" />
          </motion.div>
        </motion.div>
      )}

      <motion.div
        animate={{ color: activeHover ? "#ffffc4" : "#161615" }}
        transition={{ duration: 0.4 }}
        className={`relative z-10 flex flex-col ${align === "right" ? "items-end text-right" : "items-start text-left"}`}
      >
        <span className="text-[10px] md:text-sm  uppercase tracking-[0.2em] mb-2 opacity-60">{label}</span>
        <span className="text-2xl sm:text-4xl md:text-6xl uppercase font-saans-bold leading-none tracking-tighter">
          {title}
        </span>
      </motion.div>
    </Link>
  );
}

/* --- All Works Button Helper --- */
function AllWorksButton({ isMobile }: { isMobile: boolean }) {
  const [isHovered, setIsHovered] = useState(false);
  const activeHover = isHovered && !isMobile;

  return (
    <Link
      href="/portfolio"
      className="w-full h-full flex items-center justify-center relative overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        animate={{ clipPath: (isMobile || activeHover) ? "inset(0 0 0% 0)" : "inset(0 0 100% 0)" }}
        transition={sharedTransition}
        className="absolute inset-0 bg-ink-black z-0"
      />
      <motion.span
        animate={{ color: (isMobile || activeHover) ? "#ffffc4" : "#161615" }}
        transition={{ duration: 0.4 }}
        className="text-[10px] md:text-sm  uppercase tracking-widest text-center leading-tight relative z-10 font-medium"
      >
        All <br /> Works
      </motion.span>
    </Link>
  );
}
