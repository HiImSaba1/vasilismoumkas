"use client";
import { publicCopy } from "@/app/(site)/data/ApprovedPublicCopy";

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
import CTAButton from "@/components/ui/CTAButton";
import { HOMEPAGE_WHITE_FOOTER } from "@/app/(site)/data/Pages-Photoset/Homepage";
import { OFFER_BAPTISM_POOL } from "@/app/(site)/data/Pages-Photoset/Servicespage";
import { weddingProposalSmallImages,type ProposalImage } from "@/app/(site)/data/proposal-image-sequence";
import {useOptionalWebsiteSettings} from "@/providers/WebsiteSettingsContext";
import type {SeoSettings} from "@/lib/seo-settings";
gsap.registerPlugin(SplitText, ScrollTrigger);
interface FooterProps {
  isBaptism?: boolean;
  proposalMode?: boolean;
  hideMarquee?: boolean;
  imagePool?:ProposalImage[];
  business?:SeoSettings["business"];
}
const CustomLink = ({
  href,
  target,
  children,
  className = "",
  isExternal = false,
  prefetch = false,
}: {
  href: string;
  target?: string;
  children: React.ReactNode;
  className?: string;
  isExternal?: boolean;
  prefetch?: boolean;
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

  const useNativeAnchor =
    isExternal ||
    href.startsWith("http") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:");

  if (useNativeAnchor) {
    return (
      <a
        href={href}
        target={target || (isExternal ? "_blank" : undefined)}
        rel={
          isExternal || target === "_blank" ? "noopener noreferrer" : undefined
        }
        className={`relative inline-block pb-0.5 cursor-pointer w-fit ${className}`}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {children}
        <span
          ref={lineRef}
          className="absolute bottom-0 left-0 w-full h-px bg-ink-black origin-left scale-x-0"
        />
      </a>
    );
  }

  return (
    <Link
      href={href}
      prefetch={prefetch}
      className={`relative inline-block pb-0.5 cursor-pointer w-fit ${className}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
      <span
        ref={lineRef}
        className="absolute bottom-0 left-0 w-full h-px bg-ink-black origin-left scale-x-0"
      />
    </Link>
  );
};

const SectionLabel=({children,animationKey}:{children:React.ReactNode;animationKey:string})=><div className="mb-2 w-fit relative"><span className="uppercase text-lg md:text-xl tracking-normal gsap-reveal-text" style={{fontFamily:"var(--font-bricolage)",fontWeight:800}}>{children}</span><AnimatedBorder key={`label-${animationKey}`} className="mt-1 bg-ink-black" origin="left" duration={1}/></div>;

type SplitElement=HTMLElement&{_gsapSplitText?:SplitText};

const Footer = ({ isBaptism = false,proposalMode=false,hideMarquee=false,imagePool,business }: FooterProps) => {
  const websiteSettings=useOptionalWebsiteSettings();
  const currentYear = new Date().getFullYear();
  const footerRef = useRef(null);
  const pathname = usePathname();

  const [randomMarquee, setRandomMarquee] = useState<ProposalImage[]>([]);

  const hideFooterOn = ["/portfolio"];
  const shouldHide = hideFooterOn.includes(pathname);

  useEffect(() => {
    if(hideMarquee){const timer=window.setTimeout(()=>setRandomMarquee([]),0);return()=>window.clearTimeout(timer)}
    const configuredPool=imagePool??websiteSettings?.footer.images??[];
    if(configuredPool.length){const timer=window.setTimeout(()=>setRandomMarquee(configuredPool),0);return()=>window.clearTimeout(timer)}
    if(proposalMode){const timer=window.setTimeout(()=>setRandomMarquee(weddingProposalSmallImages),0);return()=>window.clearTimeout(timer)}
    const activePool: string[] = isBaptism
      ? OFFER_BAPTISM_POOL
      : HOMEPAGE_WHITE_FOOTER;

    // Χρησιμοποιούμε τύπο στο Set
    const uniqueImages = Array.from(new Set<string>(activePool));

    if (uniqueImages.length > 0) {
      const shuffled: string[] = [...uniqueImages]
        .sort(() => 0.5 - Math.random())
        .slice(0, 10);

      const timer=window.setTimeout(()=>setRandomMarquee(shuffled.map(src=>({src,alt:`Vasilis Moumkas ${isBaptism?"baptism":"wedding"} photography in Greece and Italy`}))),0);
      return()=>window.clearTimeout(timer);
    }
  }, [pathname, isBaptism,proposalMode,hideMarquee,imagePool,websiteSettings?.footer.images]);

  useGSAP(
    () => {
      if (shouldHide || !footerRef.current) return;

      const initSplits = () => {
        if (!footerRef.current) return;
        ScrollTrigger.refresh();

        const textElements = gsap.utils.toArray<SplitElement>(".gsap-reveal-text");

        textElements.forEach((el) => {
          if (el._gsapSplitText) {
            el._gsapSplitText.revert();
          }
          const split = new SplitText(el, {
            type: "lines",
            linesClass: "overflow-hidden",
          });
          split.lines.forEach((line) => {
            const wrap = document.createElement("div");
            wrap.style.cssText = "display: block; overflow: hidden;";
            line.parentNode?.insertBefore(wrap, line);
            wrap.appendChild(line);
          });

          el._gsapSplitText = split;
          gsap.fromTo(
            split.lines,
            { yPercent: 100 },
            {
              yPercent: 0,
              duration: 0.8,
              stagger: 0.04,
              ease: "power3.out",
              scrollTrigger: {
                trigger: el,
                start: "top 92%",
                toggleActions: "play none none reverse",
              },
            },
          );
        });
      };

      if (document.fonts.status === "loaded") {
        initSplits();
      } else {
        document.fonts.ready.then(initSplits);
      }
    },
    { scope: footerRef, dependencies: [pathname, randomMarquee] },
  );

  if (shouldHide) return null;

  return (
    <footer ref={footerRef} className="w-full px-4 md:px-10 lg:px-8 py-2 mt-2">
      <AnimatedBorder
        key={`top-border-${pathname}`}
        className="mb-3 md:mb-5 bg-ink-black"
        origin="right"
        duration={1.5}
      />

      <div className=" w-full">
        <div className="flex flex-col md:flex-row items-stretch mb-8 gap-10 md:gap-0">
          <div className="flex w-full flex-col items-center justify-between py-2 text-center md:w-[40%] md:items-stretch md:text-left">
            <div className="mb-4 ">
              <div className="flex justify-center gap-2 text-[12px] md:justify-start md:text-[12px] uppercase tracking-[0.3em] font-bold opacity-90 gsap-reveal-text">
                <span>/</span>
                <span>CONTACT</span>
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <h3 className="text-[12vw] md:text-[6vw] max-w-md tracking-tighter leading-none uppercase gsap-reveal-text">
                {pathname === "/" && !isBaptism && !proposalMode ? (
                  <>{publicCopy.homeCta[0]}<br />{publicCopy.homeCta[1]}</>
                ) : isBaptism ? (
                  <>
                    Looking for a<br /> Luxury Baptism Photographer in Greece or
                    Italy?
                  </>
                ) : (
                  <>
                    Looking for a<br /> Luxury Wedding Photographer in Greece or
                    Italy?
                  </>
                )}
              </h3>

              <div className="flex justify-center pt-2 md:justify-start">
                <CTAButton
                  href="tel:+306972218775"
                  className="w-fit"
                >
                  Call me directly
                </CTAButton>
              </div>
            </div>
          </div>
          {!hideMarquee&&<div className="w-full md:w-[60%] relative overflow-hidden h-60 md:h-auto md:min-h-100 marquee-container">
            {randomMarquee.length > 0 && (
              <motion.div
                className="flex gap-2 w-max h-full"
                initial={{ x: 0 }}
                animate={{ x: "-50%" }}
                transition={{
                  duration: 60,
                  ease: "linear",
                  repeat: Infinity,
                }}
              >
                {[...randomMarquee, ...randomMarquee].map((image, idx) => (
                  <div
                    key={`${idx}-${image.src}`}
                    className="marquee-item relative shrink-0 h-full w-60 md:w-87.5 lg:w-112.5"
                  >
                    <div className="relative w-full h-full overflow-hidden shadow-md">
                      <SeoImage
                        src={image.src}
                        fallbackSrc={proposalMode?HOMEPAGE_WHITE_FOOTER[idx%HOMEPAGE_WHITE_FOOTER.length]:undefined}
                        alt={image.alt}
                        description={
                          isBaptism
                            ? "baptism-photography-portfolio"
                            : "wedding-photography-portfolio"
                        }
                        location="greece-italy"
                        fill
                        className={proposalMode?"object-contain":"object-cover"}
                        sizes="(max-width: 768px) 240px, (max-width: 1024px) 350px, 450px"
                      />
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </div>}
        </div>

        <AnimatedBorder
          key={`mid-border-${pathname}`}
          className="mb-0 bg-ink-black"
          origin="left"
          duration={1.5}
        />
        <div className="grid grid-cols-12 md:grid-cols-4 gap-x-2 gap-y-0 md:gap-y-4 md:gap-x-12 py-8 md:py-6">
          <div className="flex flex-col col-span-8 md:col-span-1 py-2 md:py-0">
            <SectionLabel animationKey={`${pathname}-personal-contact`}>Personal Contact</SectionLabel>
            <div className="flex flex-col gap-1">
              <CustomLink
                href={`mailto:${business?.email??"vasilis.moumkas@gmail.com"}`}
                prefetch={false}
                className="text-sm md:text-md uppercase break-all"
              >
                {business?.email??"vasilis.moumkas@gmail.com"}
              </CustomLink>
              <CustomLink
                href={`tel:${business?.telephone??"+306972218775"}`}
                prefetch={false}
                className="text-sm md:text-md uppercase mt-2"
              >
                {business?.telephone??"+30 6972 218 775"}
              </CustomLink>
              <CustomLink
                isExternal
                href={`https://wa.me/${(business?.telephone??"+306972218775").replace(/\D/g,"")}?text=Hello%20Vasilis!%20I'm%20interested%20in%20your%20wedding%20photography%20services.`}
                prefetch={false}
                className="text-sm md:text-md uppercase mt-2"
              >
                WhatsApp Message
              </CustomLink>
            </div>
          </div>
          <div className="flex flex-col col-span-4 md:col-span-1 items-start text-start py-2 md:py-0">
            <SectionLabel animationKey={`${pathname}-follow-me`}>Follow Me</SectionLabel>
            <ul className="flex flex-col gap-1 uppercase text-sm md:text-md tracking-tight">
              <li>
                <CustomLink
                  isExternal
                  href={business?.instagram??"https://www.instagram.com/vasilismoumkas_weddings/"}
                  prefetch={false}
                >
                  Instagram
                </CustomLink>
              </li>
              <li>
                <CustomLink
                  isExternal
                  href={business?.facebook??"https://www.facebook.com/VasilisMoumkasPhotography"}
                  prefetch={false}
                >
                  Facebook
                </CustomLink>
              </li>
              <li>
                <CustomLink
                  isExternal
                  href={business?.pinterest??"https://gr.pinterest.com/vasilismoumkas/"}
                  prefetch={false}
                >
                  Pinterest
                </CustomLink>
              </li>
            </ul>
          </div>
          <div className="flex flex-col col-span-8 md:col-span-1 py-2 md:py-0">
            <SectionLabel animationKey={`${pathname}-find-me`}>Find Me</SectionLabel>
            <CustomLink
              href={business?.mapUrl??"https://maps.app.goo.gl/WgcYHohyWbyXDu3R9"}
              isExternal
              prefetch={false}
              className="text-sm md:text-md leading-snug uppercase tracking-wide"
            >
              {business?.addressLocality??"Thessaloniki"} / {business?.addressCountry??"Greece"}
              <br />
              {business?.streetAddress??"Themistokli Sofouli, 52"}
            </CustomLink>
          </div>
          <div className="flex flex-col col-span-4 md:col-span-1 items-start text-start py-2 md:py-0">
            <SectionLabel animationKey={`${pathname}-explore`}>Explore</SectionLabel>
            <ul className="flex flex-col gap-1 uppercase text-sm md:text-md tracking-tight">
              <li>
                <CustomLink href="/" prefetch={false}>
                  Home
                </CustomLink>
              </li>
              <li>
                <CustomLink href="/about" prefetch={false}>
                  About
                </CustomLink>
              </li>
              <li>
                <CustomLink href="/education" prefetch={false}>
                  Education
                </CustomLink>
              </li>
              <li>
                <CustomLink href="/portfolio" prefetch={false}>
                  Portfolio
                </CustomLink>
              </li>
              <li>
                <CustomLink href="/services" prefetch={false}>
                  Services
                </CustomLink>
              </li>
              <li>
                <CustomLink href="/contact" prefetch={false}>
                  Contact
                </CustomLink>
              </li>
            </ul>
          </div>
        </div>

        <AnimatedBorder
          key={`bot-border-${pathname}`}
          className="bg-ink-black"
          origin="center"
          duration={2}
        />
<div className="w-full pb-4 pt-6 px-4 md:px-8 flex flex-col gap-8 text-ink-black text-[10px] md:text-sm uppercase tracking-wide mb-[env(safe-area-inset-bottom)]">
  
  {/* ΣΕΙΡΑ 1: Τοποθεσίες (Κεντραρισμένες) */}
  <div className="w-full text-center opacity-80 text-[11px] md:text-[14px]">
    Santorini · Mykonos · Naxos · Thessaloniki · Lake Como · Tuscany · Amalfi Coast
  </div>

  {/* ΣΕΙΡΑ 2: Saba αριστερά, Links δεξιά */}
  <div className="w-full flex justify-between items-center">
    
    {/* Αριστερή πλευρά: Copyright & Saba */}
    <div className="flex items-center gap-2">
      <span>©{currentYear} - VASILIS MOUMKAS</span>
      <CustomLink href="https://www.sabaweb.gr" isExternal>
        By Saba Web Solutions
      </CustomLink>
    </div>

    {/* Δεξιά πλευρά: Links */}
    <div className="flex gap-2">
      <CustomLink href="/privacy-policy">Privacy Policy</CustomLink>
      <CustomLink href="/cookies">Cookies</CustomLink>
    </div>
    
  </div>
</div>
      </div>
    </footer>
  );
};

export default Footer;
