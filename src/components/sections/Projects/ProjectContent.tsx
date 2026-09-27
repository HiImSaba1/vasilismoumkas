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

// Define the Bezier curve as a constant tuple to satisfy TypeScript
const EXPO_OUT = [0.16, 1, 0.3, 1] as const;
function seededRandom(seedText:string){let seed=2166136261;for(const char of seedText)seed=Math.imul(seed^char.charCodeAt(0),16777619);return()=>{seed+=0x6d2b79f5;let value=seed;value=Math.imul(value^(value>>>15),value|1);value^=value+Math.imul(value^(value>>>7),value|61);return((value^(value>>>14))>>>0)/4294967296}}
function mixProjectPhotos(photos:Photo[],slug:string){const random=seededRandom(slug);const shuffle=(items:Photo[])=>{const result=[...items];for(let index=result.length-1;index>0;index--){const target=Math.floor(random()*(index+1));[result[index],result[target]]=[result[target],result[index]]}return result};const portraits=shuffle(photos.filter(photo=>photo.width<=photo.height));const landscapes=shuffle(photos.filter(photo=>photo.width>photo.height));const result:Photo[]=[];let portraitIndex=0;let landscapeIndex=0;let portraitCounter=0;let targetGap=[4,6,8][Math.floor(random()*3)];while(portraitIndex+1<portraits.length||landscapeIndex<landscapes.length){if(portraitIndex+1<portraits.length){result.push(portraits[portraitIndex++],portraits[portraitIndex++]);portraitCounter+=2}if(portraitCounter>=targetGap&&landscapeIndex<landscapes.length){result.push(landscapes[landscapeIndex++]);portraitCounter=0;targetGap=[4,6,8][Math.floor(random()*3)]}if(portraitIndex+1>=portraits.length&&landscapeIndex<landscapes.length){result.push(...landscapes.slice(landscapeIndex));landscapeIndex=landscapes.length}}if(portraitIndex<portraits.length)result.push(portraits[portraitIndex]);return result}

const ProjectContent = ({ project }: { project: Project }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIdx, setCurrentIdx] = useState(1);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const mixedPhotos=useMemo(()=>mixProjectPhotos(project.photoset,project.slug),[project.photoset,project.slug]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (mixedPhotos.length === 0) return;
    const step = 1 / mixedPhotos.length;
    const idx = Math.min(Math.floor(latest / step) + 1, mixedPhotos.length);
    if (idx !== currentIdx) setCurrentIdx(idx);
  });

  const slides = useMemo(
    () => mixedPhotos.map((photo) => ({ src: photo.src })),
    [mixedPhotos],
  );

  return (
    <div
      ref={containerRef}
      className="w-full bg-off-white text-ink-black font-karena min-h-screen"
    >
      <ProjectHero project={project} />

      {mixedPhotos.length > 0 ? (
        <section className="relative grid grid-cols-12 w-full px-3 md:px-6 py-12 gap-0">
          <ProjectSidebar project={project} currentIdx={currentIdx} />

          <div className="col-span-12 md:col-span-8 relative">
            <div className="md:hidden sticky ml-4 top-30 z-30 mb-2 pointer-events-none">
              <div className="bg-ink-black/20 text-soft-yellow backdrop-blur-lg inline-block px-4 py-2">
                <div className="text-md tracking-widest tabular-nums uppercase flex items-center">
                  <span>{String(currentIdx).padStart(2, "0")}</span>
                  <span className="mx-2 text-sm">/</span>
                  <span>{String(mixedPhotos.length).padStart(2, "0")}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-start">
              {mixedPhotos.map((photo, i) => (
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
