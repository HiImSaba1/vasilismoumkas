"use client";

import React, { useRef } from "react";
import SeoImage from "@/components/ui/SeoImage";
import ContactForm from "@/components/sections/ContactForm";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {useWebsiteSettings} from "@/providers/WebsiteSettingsContext";

import type { PublicPageContent } from "@/lib/public-page-content";
export default function ContactPage({content,previewOnly=false}:{content:PublicPageContent["contact"];previewOnly?:boolean}) {
  const{contact}=useWebsiteSettings();
  const container = useRef(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageWrapperRef = useRef(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        defaults: { ease: "expo.out" },
      });

      // Initial States
      tl.set(".left-col", { xPercent: -100 })
        .set(".bg-image", { scale: 1.2 })
        .set(".header-reveal", { opacity: 0, y: 40 })
        .set(".form-wrapper", { opacity: 0, x: 60 });

      // Execution
      tl.to(".left-col", {
        xPercent: 0,
        duration: 1.6,
        ease: "expo.inOut",
      })
        .to(
          ".bg-image",
          {
            scale: 1,
            duration: 2,
          },
          "-=1",
        )
        .to(
          ".header-reveal",
          {
            y: 0,
            opacity: 1,
            stagger: 0.1,
            duration: 1.2,
          },
          "-=1",
        )
        .to(
          ".form-wrapper",
          {
            x: 0,
            opacity: 1,
            duration: 1.4,
          },
          "-=0.8",
        );
    },
    { scope: container },
  );

  const handleMouseEnter = () => {
    if (videoRef.current) {
      // 1. Capture the promise
      const playPromise = videoRef.current.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Video is playing, now we can safely animate the overlay
            gsap.to(imageWrapperRef.current, {
              opacity: 0,
              duration: 0.8,
              ease: "power2.inOut",
            });
          })
          .catch(() => {
            // Auto-play was prevented or interrupted
            console.log("Playback interrupted");
          });
      }
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      // 2. Wrap pause in a check to ensure we don't interrupt a pending play
      videoRef.current.pause();

      gsap.to(imageWrapperRef.current, {
        opacity: 1,
        duration: 0.8,
        ease: "power2.inOut",
      });
    }
  };

  return (
    <main
      ref={container}
      className="min-h-screen bg-off-white flex flex-col md:flex-row overflow-hidden"
    >
      <h1 className="sr-only">{content.title}</h1>
      {/* LEFT COLUMN */}
      <section
        className="left-col relative w-full md:w-1/2 h-[60svh] md:h-screen overflow-hidden cursor-pointer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <video
          ref={videoRef}
          src={content.video}
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-ink-black/20 z-0" />
        <div ref={imageWrapperRef} className="bg-image absolute inset-0 z-10">
          <SeoImage
            src={content.image || contact.image.src}
            alt={content.image ? content.imageAlt : contact.image.alt}
            description="luxury-contact-image"
            location="greece"
            fill
            className="object-cover max-md:!h-[120%] max-md:!top-[-10%]"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-ink-black/20" />
          {content.caption&&<span className="absolute inset-x-0 bottom-0 p-4 text-xs text-white">{content.caption}</span>}
        </div>
      </section>

      {/* RIGHT COLUMN */}
      <section className="w-full md:w-1/2 p-6 md:px-16 flex flex-col justify-center overflow-hidden">
        <div className="max-w-3xl w-full mx-auto space-y-8 py-4">
          <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-2 md:gap-6 border-b border-ink-black md:pb-4 overflow-hidden">
            <span
              className="header-reveal text-sm md:text-base font-bold tracking-[0.2em] uppercase opacity-60"
              style={{ fontFamily: "var(--font-karena)" }}
            >
              {content.label}
            </span>
            <span
              className="header-reveal text-3xl uppercase tracking-tighter text-red-600"
              style={{ fontFamily: "var(--font-karena)" }}
            >
              {content.heading}
            </span>
          </div>

          <div className="form-wrapper">
            <ContactForm content={content} previewOnly={previewOnly} />
          </div>
        </div>
      </section>
    </main>
  );
}
