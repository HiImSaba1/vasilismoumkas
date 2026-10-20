"use client";

import React, { useRef, useState, useMemo } from "react";
import { Project, Photo } from "@/app/(site)/data/ProjectsData";
import {
  motion,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

import ProjectHero from "./ProjectHero";
import ProjectSidebar from "./ProjectSidebar";

const EXPO_OUT = [0.16, 1, 0.3, 1] as const;

const ProjectContent = ({ project }: { project: Project }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIdx, setCurrentIdx] = useState(1);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  // The CRM position is the public order. Never remix it by orientation or slug.
  const orderedPhotos=project.photoset;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (orderedPhotos.length === 0) return;
    const step = 1 / orderedPhotos.length;
    const idx = Math.min(Math.floor(latest / step) + 1, orderedPhotos.length);
    if (idx !== currentIdx) setCurrentIdx(idx);
  });

  const slides = useMemo(
    () => orderedPhotos.map((photo) => ({ src: photo.src })),
    [orderedPhotos],
  );

  return (
    <div
      ref={containerRef}
      className="w-full bg-off-white text-ink-black font-karena min-h-screen"
    >
      <ProjectHero project={project} />

      {orderedPhotos.length > 0 ? (
        <section className="relative grid grid-cols-12 w-full px-3 md:px-6 py-12 gap-0">
          <ProjectSidebar project={project} currentIdx={currentIdx} />

          <div className="col-span-12 md:col-span-8 relative">
            <div className="md:hidden sticky ml-4 top-30 z-30 mb-2 pointer-events-none">
              <div className="bg-ink-black/20 text-soft-yellow backdrop-blur-lg inline-block px-4 py-2">
                <div className="text-md tracking-widest tabular-nums uppercase flex items-center">
                  <span>{String(currentIdx).padStart(2, "0")}</span>
                  <span className="mx-2 text-sm">/</span>
                  <span>{String(orderedPhotos.length).padStart(2, "0")}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-start">
              {orderedPhotos.map((photo, i) => (
                <ProjectImageItem
                  key={`${project.slug}-${photo.src}-${i}`}
                  photo={photo}
                  index={i}
                  onClick={() => {
                    setIndex(i);
                    setOpen(true);
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      ) : (
        <div className="h-screen w-full" />
      )}

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={index}
        slides={slides}
        controller={{ closeOnBackdropClick: true }}
        styles={{ container: { backgroundColor: "rgba(248, 245, 242, 1)" } }}
      />
      <div className="h-[10vh]" />
    </div>
  );
};

function ProjectImageItem({
  photo,
  index,
  onClick,
}: {
  photo: Photo;
  index: number;
  onClick: () => void;
}) {
  const isLandscape = photo.width > photo.height;

  return (
    <div className={isLandscape?"md:col-span-2":"md:col-span-1"}>
      <button type="button" onClick={onClick} className="block w-full cursor-zoom-in border border-ink-black/10 bg-off-white md:hidden" data-portfolio-gallery-item data-mobile-natural-aspect>
        {/* The raw asset preserves its intrinsic dimensions for legacy projects whose stored metadata was incorrect. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo.src} alt={photo.alt||"Wedding photography project"} loading={index<3?"eager":"lazy"} decoding="async" className="block h-auto w-full object-contain"/>
      </button>
      <motion.button
      type="button"
      data-desktop-metro-gallery
      data-landscape={isLandscape?"true":"false"}
      initial={{ opacity: 0, y: 100 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{
        duration: 1.4,
        ease: EXPO_OUT,
        delay: (index % 2) * 0.1,
      }}
      onClick={onClick}
      className="group relative hidden h-auto w-full cursor-zoom-in overflow-hidden bg-off-white md:block"
    >
        {/* Raw dimensions keep every desktop photograph uncropped, including legacy records. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo.src} alt={photo.alt||"Wedding photography project"} loading={index<4?"eager":"lazy"} decoding="async" className="block h-auto w-full object-contain transition-transform duration-700 ease-out group-hover:scale-[1.015]"/>
      </motion.button>
    </div>
  );
}

export default ProjectContent;
