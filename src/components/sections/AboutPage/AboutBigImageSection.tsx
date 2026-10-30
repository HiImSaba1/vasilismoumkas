"use client";
import {InlineContent} from "@/components/ui/InlineContent";
import { publicCopy } from "@/app/(site)/data/ApprovedPublicCopy";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import SeoImage from "@/components/ui/SeoImage";
import RevealAnimation from "@/components/animations/RevealAnimation";
import AnimatedBorder from "@/components/animations/AnimatedBorder";

function HighlightedBio({text,phrase}:{text:string;phrase:string}){const index=text.indexOf(phrase);if(index<0)return <InlineContent text={text}/>;return <><InlineContent text={text.slice(0,index)}/><span className="text-soft-yellow">{phrase}</span><InlineContent text={text.slice(index+phrase.length)}/></>;}

import { aboutVisualDefaults, type PublicPageContent } from "@/lib/public-page-content";
const AboutBigImageSection = ({intro=publicCopy.aboutIntro,content=aboutVisualDefaults}:{intro?:string[];content?:PublicPageContent["about"]["visuals"]}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);

  return (
    <section
      ref={containerRef}
      className="relative h-auto min-h-[110vh] md:min-h-[150vh] w-full overflow-hidden bg-ink-black px-4 lg:px-12 py-16 lg:py-24 mb-18"
    >
      {/* Background Parallax Wrapper */}
      <div className="absolute inset-0 z-0">
        <motion.div
          style={{ y }}
          className="relative w-full h-[120%] -top-[10%]"
        >
          <SeoImage
            src={content.biographyImage} alt={content.biographyAlt}
            description="luxury-wedding-photographer-profile"
            location="thessaloniki-greece"
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-ink-black/45 md:bg-ink-black/35" />
          {content.biographyCaption&&<span className="absolute inset-x-0 bottom-0 p-3 text-xs text-white">{content.biographyCaption}</span>}
        </motion.div>
      </div>

      {/* Content Layers */}
      <div className="relative z-10 h-full flex flex-col justify-between w-full">
        {/* Top Section */}
        <div className="w-full">
          <RevealAnimation>
            <h2 style={{margin:0,fontWeight:"inherit",fontFamily:"inherit"}} className="block text-soft-yellow text-[clamp(45px,7vw,70px)] md:text-[clamp(60px,10vw,100px)] leading-[0.9] uppercase tracking-tighter">
              {content.biographyHeading.split("\n").map((line,i)=><React.Fragment key={i}>{i>0&&<br/>}{line}</React.Fragment>)}
            </h2>
          </RevealAnimation>
          <AnimatedBorder
            origin="left"
            duration={1.8}
            className="bg-soft-yellow/50 w-full mt-10"
          />
        </div>

        {/* Middle Section: Shared Truth & Bio Start */}
        <div className="w-full py-16 md:py-32">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between w-full pb-10 gap-8 md:gap-0">
            {/* LEFT COLUMN */}
            <div className="hidden md:flex md:w-[40%] flex-col gap-6">
              <RevealAnimation>
                <span
                  className="block text-soft-yellow text-xl lg:text-5xl uppercase tracking-wide"
                  style={{ fontFamily: "var(--font-karena)" }}
                >
                  {content.rootsHeading}
                </span>
              </RevealAnimation>
              <div className="flex flex-wrap max-w-md gap-3 opacity-80">
                {content.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-soft-yellow text-[14px] uppercase border border-soft-yellow/40 px-2 py-1 tracking-widest"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="w-full md:w-[55%]">
              <RevealAnimation>
                <h3 style={{margin:0,fontWeight:"inherit",fontFamily:"inherit"}} className="block text-soft-yellow text-4xl lg:text-6xl tracking-tighter leading-none mb-8">
                  {content.sharedHeading}
                </h3>
              </RevealAnimation>
              <RevealAnimation>
                <span className="block text-off-white text-xl md:text-2xl lg:text-3xl leading-[1.2] tracking-tight max-w-2xl">
                  <HighlightedBio text={content.sharedText} phrase="cling to the beating of your heart."/>
                </span>
              </RevealAnimation>
            </div>
          </div>

          <AnimatedBorder
            origin="left"
            duration={2}
            className="bg-soft-yellow/50 w-full"
          />
        </div>

        {/* Bottom Section */}
        <div className="w-full flex flex-col pt-12">
          {/* ROW 1: Bio Details */}
          <div className="grid grid-cols-1 md:grid-cols-12 w-full order-1 mb-16 md:mb-24">
            <div className="md:col-span-7 space-y-10">
              <RevealAnimation>
                <span className="block text-off-white text-xl md:text-2xl lg:text-3xl leading-[1.2] tracking-tight">
                  <HighlightedBio text={intro[0]} phrase="wedding photographer"/>
                </span>
              </RevealAnimation>
              <RevealAnimation>
                <span className="block text-off-white text-xl md:text-2xl lg:text-3xl leading-[1.2] tracking-tight">
                  <HighlightedBio text={intro[1]} phrase="gently guided editorial portraits"/>
                </span>
              </RevealAnimation>
              <RevealAnimation>
                <span className="block text-soft-yellow text-lg md:text-xl uppercase tracking-[0.3em] pt-4 font-bold">
                  {content.closing}
                </span>
              </RevealAnimation>
            </div>
          </div>

          {/* ROW 2: A Quiet Visual Language */}
          <div className="grid grid-cols-1 md:grid-cols-12 w-full order-2 border-t border-soft-yellow/20 pt-10">
            <div className="hidden md:block md:col-span-3" />
            <div className="md:col-span-9 flex flex-col items-start md:items-end justify-end">
              <RevealAnimation>
                <h2 style={{margin:0,fontWeight:"inherit",fontFamily:"inherit"}} className="text-soft-yellow text-[clamp(45px,7vw,70px)] md:text-[clamp(60px,10vw,100px)] leading-[0.9] uppercase tracking-tighter text-left md:text-right block">
                  {content.closingHeading.split("\n").map((line,i)=><React.Fragment key={i}>{i>0&&<br className="hidden md:block"/>}{i>0&&" "}{line}</React.Fragment>)}
                </h2>
              </RevealAnimation>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutBigImageSection;
