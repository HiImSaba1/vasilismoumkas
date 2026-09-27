"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import SeoImage from "@/components/ui/SeoImage";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import AnimatedBorder from "@/components/animations/AnimatedBorder";
import RevealButton from "@/components/ui/RevealButton";
import { HOMEPAGE_WHITE_FOOTER } from "@/app/(site)/data/Pages-Photoset/Homepage";

if (typeof window !== "undefined") {
  gsap.registerPlugin(SplitText, ScrollTrigger);
}

const FooterLink = ({
  href,
  children,
  isExternal = false,
}: {
  href: string;
  children: React.ReactNode;
  isExternal?: boolean;
}) => {
  const lineRef = useRef(null);
  const onMouseEnter = () =>
    gsap.to(lineRef.current, { scaleX: 1, duration: 0.6, ease: "power3.out" });
  const onMouseLeave = () =>
    gsap.to(lineRef.current, {
      scaleX: 0,
      duration: 0.6,
      ease: "power3.inOut",
    });

  const props = {
    className:
      "relative inline-block pb-0.5 cursor-pointer w-fit text-sm md:text-md uppercase",
    onMouseEnter,
    onMouseLeave,
  };

  return isExternal ? (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
      <span
        ref={lineRef}
        className="absolute bottom-0 left-0 w-full h-px bg-ink-black origin-left scale-x-0"
      />
    </a>
  ) : (
    <Link href={href} {...props}>
      {children}
      <span
        ref={lineRef}
        className="absolute bottom-0 left-0 w-full h-px bg-ink-black origin-left scale-x-0"
      />
    </Link>
  );
};

const InstagramFooter = () => {
  const footerRef = useRef(null);
  const pathname = usePathname();
  const [randomMarquee, setRandomMarquee] = useState<string[]>([]);

  useEffect(() => {
    const uniqueImages = Array.from(new Set(HOMEPAGE_WHITE_FOOTER));
    if (uniqueImages.length > 0) {
      const shuffled = [...uniqueImages]
        .sort(() => 0.5 - Math.random())
        .slice(0, 10);
      setRandomMarquee(shuffled);
    }
  }, []);

  useGSAP(
    () => {
      if (!footerRef.current) return;

      const textElements = gsap.utils.toArray(".gsap-reveal-text");
      textElements.forEach((el: any) => {
        const split = new SplitText(el, {
          type: "lines",
          linesClass: "overflow-hidden",
        });

        gsap.from(split.lines, {
          yPercent: 100,
          duration: 0.8,
          stagger: 0.04,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 92%",
            toggleActions: "play none none reverse",
          },
        });
      });
    },
    { scope: footerRef, dependencies: [randomMarquee] },
  );

  const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <div className="mb-2 w-fit relative">
      <span
        className="uppercase text-lg md:text-xl tracking-normal gsap-reveal-text"
        style={{ fontFamily: "var(--font-bricolage)", fontWeight: 800 }}
      >
        {children}
      </span>
      <AnimatedBorder
        className="mt-1 bg-ink-black"
        origin="left"
        duration={1}
      />
    </div>
  );

  return (
    <footer
      ref={footerRef}
      className="w-full px-4 md:px-10 lg:px-8 py-12 bg-off-white"
    >
      <AnimatedBorder
        className="mb-10 bg-ink-black"
        origin="right"
        duration={1.5}
      />

      <div className="w-full">
        {/* Top Section: CTA and Marquee */}
        <div className="flex flex-col md:flex-row items-stretch mb-6 gap-10 md:gap-0">
          <div className="w-full md:w-[40%] flex flex-col justify-between py-2">
            <div className="mb-2">
              <div className="flex gap-2 text-[12px] uppercase tracking-[0.3em] font-bold opacity-90 gsap-reveal-text">
                <span>/</span>
                <span>CONTACT</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-[10vw] md:text-[5.5vw] max-w-md tracking-tighter leading-[0.85] uppercase gsap-reveal-text">
                Looking for a Luxury Wedding Photographer in Greece or Italy?
              </h3>
              <div className="pt-2">
                <RevealButton
                  href="tel:+306972218775"
                  className="px-6! md:px-8! py-3! w-fit border border-ink-black"
                >
                  <span
                    className="text-xl md:text-2xl"
                    style={{ fontFamily: "var(--font-karena)" }}
                  >
                    call me directly
                  </span>
                </RevealButton>
              </div>
            </div>
          </div>

          <div className="w-full md:w-[60%] relative overflow-hidden h-64 md:h-96 marquee-container">
            {randomMarquee.length > 0 && (
              <motion.div
                className="flex gap-2 w-max h-full"
                animate={{ x: "-50%" }}
                transition={{ duration: 60, ease: "linear", repeat: Infinity }}
              >
                {[...randomMarquee, ...randomMarquee].map((src, idx) => (
                  <div
                    key={`${idx}-${src}`}
                    className="relative shrink-0 h-full w-64 md:w-80 lg:w-96"
                  >
                    <SeoImage
                      src={src}
                      description="luxury-wedding-photography"
                      location="greece-italy"
                      fill
                      className="object-cover shadow-sm"
                      sizes="(max-width: 768px) 256px, 400px"
                    />
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default InstagramFooter;
