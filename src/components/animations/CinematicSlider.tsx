"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import useEmblaCarousel from "embla-carousel-react";
import SeoImage from "@/components/ui/SeoImage";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Project } from "@/app/(site)/data/ProjectsData";
import { portfolioCategoryHref, projectHeaderAlt } from "@/lib/project-presentation";

interface CinematicSliderProps {
  projects: Project[];
}

export default function CinematicSlider({
  projects = [],
}: CinematicSliderProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const isAnimating = useRef(false);
  const autoplayTimer = useRef<NodeJS.Timeout | null>(null);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    skipSnaps: true,
    watchDrag: true,
  });

  const startAutoplay = useCallback(() => {
    if (autoplayTimer.current) clearInterval(autoplayTimer.current);
    autoplayTimer.current = setInterval(() => {
      if (!isAnimating.current && emblaApi) {
        emblaApi.scrollNext();
      }
    }, 5000);
  }, [emblaApi]);

  const stopAutoplay = useCallback(() => {
    if (autoplayTimer.current) clearInterval(autoplayTimer.current);
  }, []);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const newIndex = emblaApi.selectedScrollSnap();
    if (newIndex === selectedIndex) return;

    const total = projects.length;
    let diff = newIndex - selectedIndex;
    if (diff === -(total - 1)) diff = 1;
    if (diff === total - 1) diff = -1;

    setDirection(diff > 0 ? 1 : -1);
    setSelectedIndex(newIndex);
    startAutoplay();

    isAnimating.current = true;
    setTimeout(() => {
      isAnimating.current = false;
    }, 1000);
  }, [emblaApi, selectedIndex, projects.length, startAutoplay]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    startAutoplay();
    return () => {
      emblaApi.off("select", onSelect);
      stopAutoplay();
    };
  }, [emblaApi, onSelect, startAutoplay, stopAutoplay]);

  const scrollPrev = useCallback(
    (e?: React.MouseEvent) => {
      e?.preventDefault();
      if (isAnimating.current || !emblaApi) return;
      emblaApi.scrollPrev();
    },
    [emblaApi],
  );

  const scrollNext = useCallback(
    (e?: React.MouseEvent) => {
      e?.preventDefault();
      if (isAnimating.current || !emblaApi) return;
      emblaApi.scrollNext();
    },
    [emblaApi],
  );

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isAnimating.current || Math.abs(e.deltaY) < 15) return;
      if (e.deltaY > 0) scrollNext();
      else scrollPrev();
    };
    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [scrollNext, scrollPrev]);

  if (!projects.length) return null;

  return (
    <main
      ref={emblaRef}
      className="relative h-screen w-screen bg-off-white overflow-hidden"
      onMouseEnter={stopAutoplay}
      onMouseLeave={startAutoplay}
    >
      <div className="absolute inset-0 z-10 pointer-events-none flex h-full">
        {projects.map((_, i) => (
          <div key={i} className="flex-[0_0_100%] min-w-0 h-full" />
        ))}
      </div>

      <AnimatePresence initial={false} mode="popLayout" custom={direction}>
        <Slide
          key={selectedIndex}
          project={projects[selectedIndex]}
          idx={selectedIndex}
          total={projects.length}
          direction={direction}
        />
      </AnimatePresence>

      <div className="absolute inset-0 z-50 pointer-events-none flex items-center md:items-end justify-center pb-0 md:pb-12">
        <div className="w-full flex items-center justify-between px-6 md:px-12 pointer-events-auto mt-112 md:mt-0">
          <NavButton onClick={scrollPrev} direction="left" />
          <NavButton onClick={scrollNext} direction="right" />
        </div>
      </div>
    </main>
  );
}

function NavButton({
  onClick,
  direction,
}: {
  onClick: (e: React.MouseEvent) => void;
  direction: "left" | "right";
}) {
  return (
    <button
      onClick={onClick}
      className="group relative w-16 h-16 md:w-20 md:h-20 rounded-full border border-off-white/30 backdrop-blur-md flex items-center justify-center overflow-hidden transition-transform active:scale-90"
    >
      <div className="absolute inset-0 bg-soft-yellow transition-all duration-700 ease-[cubic-bezier(0.69,1,0.52,1)] [clip-path:circle(0%_at_50%_50%)] group-hover:[clip-path:circle(110%_at_50%_50%)]" />
      <div className="relative z-10 transition-colors duration-500 group-hover:text-black text-white">
        {direction === "left" ? (
          <ArrowLeft className="md:w-8 md:h-8 w-6 h-6" />
        ) : (
          <ArrowRight className="md:w-8 md:h-8 w-6 h-6" />
        )}
      </div>
    </button>
  );
}

function Slide({
  project,
  idx,
  total,
  direction,
}: {
  project: Project;
  idx: number;
  total: number;
  direction: number;
}) {
  const container = useRef<HTMLElement | null>(null);
  const imgRef = useRef<HTMLDivElement | null>(null);

  // 1. PROJECT ROUTING: Matches /portfolio/project/[slug]
  const projectHref = `/portfolio/project/${project.slug}`;

  // 2. CATEGORY ROUTING: Maps "Wedding" -> /portfolio/wedding
  const categoryHref = useMemo(() => {
    return portfolioCategoryHref(project.category);
  }, [project.category]);

  useGSAP(
    () => {
      const tl = gsap.timeline();

      // Background & Image Parallax
      tl.fromTo(
        container.current,
        { x: direction > 0 ? "100%" : "-100%" },
        { x: "0%", duration: 1.3, ease: "expo.inOut" },
      );

      tl.fromTo(
        imgRef.current,
        { x: direction > 0 ? "-60%" : "60%", scale: 1.3 },
        { x: "0%", scale: 1, duration: 1.3, ease: "expo.inOut" },
        0,
      );

      // Borders
      tl.fromTo(
        ".border-line",
        { scaleX: 0 },
        { scaleX: 1, duration: 0.8, ease: "power4.inOut" },
        "-=0.7",
      );

      // Title Reveal
      tl.fromTo(
        ".title-word",
        { y: "100%", opacity: 0 },
        {
          y: "0%",
          opacity: 1,
          duration: 0.5,
          stagger: 0.04,
          ease: "power4.out",
        },
        "-=0.4",
      );

      // Category Reveal
      tl.fromTo(
        ".cat-word",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.03, ease: "power3.out" },
        "-=0.3",
      );

      // Description Reveal
      const descriptionLines=container.current?.querySelectorAll(".desc-line");
      if(descriptionLines?.length)tl.fromTo(descriptionLines,{ y: 20, opacity: 0 },{ y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: "power3.out" },"-=0.3");

      // Counter Reveal
      tl.fromTo(
        ".counter-item",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4 },
        "-=0.3",
      );
    },
    { scope: container, dependencies: [direction] },
  );

  return (
    <motion.section
      ref={container}
      className="absolute inset-0 h-full w-full overflow-hidden bg-off-white"
      initial={false}
      exit={{
        x: direction > 0 ? "-30%" : "30%",
        opacity: 0,
        filter: "brightness(0.2)",
        transition: { duration: 1.1, ease: [0.87, 0, 0.13, 1] },
      }}
    >
      <Link
        href={projectHref}
        className="absolute inset-0 block w-full h-full group z-10"
      >
        <div ref={imgRef} className="relative h-full w-full">
          <SeoImage
            src={project.thumbnail}
            alt={projectHeaderAlt(project)}
            description={project.title.toLowerCase().replace(/\s+/g, "-")} 
            location="greece" 
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-ink-black/40 group-hover:bg-ink-black/20 transition-colors duration-700" />
        </div>
      </Link>

      {/* UI CONTENT LAYER: Category, Description, and Title */}
      <div className="relative z-30 h-full w-full flex flex-col justify-center px-6 md:px-12 pointer-events-none">
        <div className="relative w-full py-12 md:py-16">
          <div className="flex flex-row justify-center items-center w-full mb-4 px-2">
            {/* CLICKABLE CATEGORY LINK */}
            <Link
              href={categoryHref}
              className="pointer-events-auto group/cat cursor-pointer relative"
              onClick={(e) => e.stopPropagation()}
            >
              <span
                className="text-[14px] md:text-[18px] uppercase tracking-widest text-off-white overflow-hidden block"
                style={{ fontFamily: "var(--font-karena)" }}
              >
                {(project.category || "Selected Work")
                  .split(" ")
                  .map((word: string, i: number) => (
                    <span
                      key={i}
                      className="cat-word inline-block mr-2 transition-colors duration-300 group-hover/cat:text-soft-yellow"
                    >
                      {word}
                    </span>
                  ))}
              </span>
            </Link>
          </div>

          {/* TITLE WITH BORDERS */}
          <div className="relative w-full py-8 md:py-12 flex items-center justify-center">
            <div className="border-line absolute top-0 left-0 w-full h-px bg-soft-yellow origin-left" />
            <div className="border-line absolute bottom-0 left-0 w-full h-px bg-soft-yellow origin-right" />
            <div className="w-full text-center overflow-hidden flex flex-wrap justify-center">
              {project.title.split(" ").map((word: string, i: number) => (
                <span key={i} className="inline-block overflow-hidden mr-[2vw]">
                  <span
                    className="title-word block text-[12vw] md:text-[6vw] uppercase leading-none text-soft-yellow tracking-tighter"
                    style={{ fontFamily: "var(--font-karena)" }}
                  >
                    {word}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* COUNTER */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 overflow-hidden pointer-events-none">
        <span className="counter-item block font-mono text-xl text-white/60 tracking-widest">
          {(idx + 1).toString().padStart(2, "0")} /{" "}
          {total.toString().padStart(2, "0")}
        </span>
      </div>
    </motion.section>
  );
}
