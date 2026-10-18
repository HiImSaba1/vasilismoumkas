"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { usePathname } from "next/navigation";
import MenuLink from "@/providers/MenuLink";
import MenuImagePreview from "@/components/animations/MenuImagePreview";
import AnimatedBorder from "@/components/animations/AnimatedBorder";
import { navItems, footerLinksData } from "@/app/(site)/data/MenuData";
import type {SeoSettings} from "@/lib/seo-settings";

interface FullScreenMenuProps {
  isActive: boolean;
  setIsActive: React.Dispatch<React.SetStateAction<boolean>>;
  business?: SeoSettings["business"];
}

const FullScreenMenu: React.FC<FullScreenMenuProps> = ({
  isActive,
  setIsActive,
  business,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const footerLinkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const pathname = usePathname();
  const menuFooterLinks = business ? footerLinksData.map(column => {
    const title=column.title.toLowerCase();
    if(title==="socials")return {...column,links:[{text:"Instagram",href:business.instagram,isExternal:true},{text:"Facebook",href:business.facebook,isExternal:true},{text:"Pinterest",href:business.pinterest,isExternal:true}]};
    if(title==="address")return {...column,links:[{text:"Google Maps",href:business.mapUrl,isExternal:true}]};
    if(title==="contact")return {...column,links:[{text:business.telephone,href:`tel:${business.telephone.replace(/[^+\d]/g,"")}`},{text:business.email,href:`mailto:${business.email}`},{text:"WhatsApp Message",href:`https://wa.me/${business.telephone.replace(/\D/g,"")}`,isExternal:true}]};
    return column;
  }) : footerLinksData;

  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const currentPageImageIndex =
    navItems.find((i) => i.href === pathname)?.imageIndex ?? null;
  const masterTl = useRef<gsap.core.Timeline | null>(null);

  // --- Scroll Lock ---
  useEffect(() => {
    if (isActive) {
      const scrollY = window.scrollY;
      document.body.style.setProperty("--scroll-y", `-${scrollY}px`);
      document.body.classList.add("menu-open");
    } else {
      const scrollY = document.body.style.getPropertyValue("--scroll-y");
      document.body.classList.remove("menu-open");
      document.body.style.removeProperty("--scroll-y");
      window.scrollTo(0, parseInt(scrollY || "0") * -1);
    }
    return () => {
      document.body.classList.remove("menu-open");
    };
  }, [isActive]);

  // --- Background Image Animation ---
  useEffect(() => {
    const targetIndex =
      activeImageIndex !== null ? activeImageIndex : currentPageImageIndex;
    const targetImg = navItems.find((i) => i.imageIndex === targetIndex)?.image;
    if (bgRef.current && targetImg) {
      gsap.to(bgRef.current, {
        opacity: 0,
        duration: 0.4,
        ease: "power2.inOut",
        onComplete: () => {
          if (bgRef.current) {
            bgRef.current.style.backgroundImage = `url(${targetImg})`;
            gsap.to(bgRef.current, {
              opacity: 1,
              duration: 0.8,
              ease: "power2.out",
            });
          }
        },
      });
    }
  }, [activeImageIndex, currentPageImageIndex]);

  // --- GSAP Menu Entrance (live website version) ---
  useEffect(() => {
    const menuElement = menuRef.current;
    if (!menuElement) return;
    const navLinks = linksRef.current.filter(Boolean) as HTMLElement[];
    const footerLinks = footerLinkRefs.current.filter(Boolean) as HTMLElement[];
    const allLinks = [...navLinks, ...footerLinks];
    masterTl.current = gsap.timeline({ paused: true, reversed: true, defaults: { ease: "expo.out" } });
    gsap.set(allLinks, { y: "100%", opacity: 0 });
    gsap.set(menuElement, { y: "-100%" });
    masterTl.current.to(menuElement, { y: "0%", duration: 0.6, ease: "power4.inOut" });
    masterTl.current.to(allLinks, { y: "0%", opacity: 1, duration: 0.6, stagger: 0.03 }, "-=0.3");
    return () => { masterTl.current?.kill(); };
  }, []);

  useEffect(() => {
    if (!masterTl.current) return;
    isActive ? masterTl.current.play() : masterTl.current.reverse().then(() => setActiveImageIndex(null));
  }, [isActive]);

  return (
    <div
      ref={menuRef}
      className={`fullscreen-menu fixed inset-0 z-9990 transform -translate-y-full bg-ink-black ${isActive ? "is-active" : ""}`}
    >
      {/* BG Layer */}
      <div
        ref={bgRef}
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(3px) brightness(0.9)",
          transform: "scale(1.1)",
        }}
      />
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-ink-black/40 pointer-events-none z-1"
      />

      <div className="relative z-10 w-full h-full flex justify-center items-center px-6 lg:px-12 text-off-white overflow-y-auto">
        <div className="w-full max-w-[95%] flex flex-col gap-6 lg:gap-14 py-12">
          {/* Main Navigation */}
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between w-full gap-8">
            <div className="nav-wrapper w-full lg:w-[50%] flex flex-col">
              <nav className="nav-links-container">
                <div className="nav-header mb-2">
                  <p
                    className="text-off-white/60 tracking-[0.2em] uppercase pb-2 text-[14px] lg:text-sm "
                    style={{ fontFamily: "var(--font-karena)" }}
                  >
                    Navigation
                  </p>
                  <AnimatedBorder
                    className="bg-soft-yellow/60 w-full"
                    origin="left"
                    delay={0.3}
                  />
                </div>
                <ul className="space-y-0 mt-2 lg:mt-4">
                  {navItems.map((data, index) => (
                    <li
                      key={index}
                      className="text-[34px] sm:text-[40px] md:text-[6vw] lg:text-[80px] overflow-hidden leading-[1.1] md:leading-none"
                    >
                      <div
                        className={`nav-link-wrapper -mb-2 lg:-mb-3 ${pathname === data.href ? "text-soft-yellow" : ""}`}
                        style={{
                          fontFamily: "var(--font-karena)",
                          fontWeight: 300,
                        }}
                      >
                        <MenuLink
                          href={data.href}
                          prefetch={false}
                          ref={(el) => { linksRef.current[index] = el; }}
                          onClick={() => setIsActive(false)}
                          onMouseEnter={() =>
                            setActiveImageIndex(data.imageIndex)
                          }
                          onMouseLeave={() => setActiveImageIndex(null)}
                        >
                          {data.title}
                        </MenuLink>
                      </div>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
            <div className="hidden lg:flex w-full lg:w-[38%] items-center justify-end relative">
              <MenuImagePreview
                activeImageIndex={activeImageIndex}
                currentPageImageIndex={currentPageImageIndex}
                navItems={navItems}
                className="aspect-11/12 w-full max-w-md shadow-2xl border border-off-white/25"
              />
            </div>
          </div>

          {/* Grid Section: Socials + Address (Top Row), Contact (Below) */}
          <div className="footer-bar w-full text-[12px] uppercase tracking-widest">
            <AnimatedBorder
              className="bg-soft-yellow/60 w-full mb-6 md:mb-8"
              origin="left"
              delay={0.5}
            />

            <div className="grid grid-cols-12 md:grid-cols-3 gap-y-8 md:gap-5 w-full">
              {menuFooterLinks.map((column, colIndex) => {
                const title = column.title.toLowerCase();
                let colSpan = "col-span-12";
                let order = "order-3";

                if (title === "socials") {
                  colSpan = "col-span-4 md:col-span-1";
                  order = "order-1";
                } else if (
                  column.links.some(
                    (l) =>
                      l.text.toLowerCase().includes("address") ||
                      title.includes("address"),
                  )
                ) {
                  colSpan = "col-span-8 md:col-span-1";
                  order = "order-2";
                } else if (title === "contact") {
                  colSpan = "col-span-12 md:col-span-1";
                  order = "order-3";
                }

                return (
                  <div
                    key={colIndex}
                    className={`${colSpan} ${order} flex flex-col`}
                  >
                    <div className="mb-2 md:mb-4 inline-block min-w-20 lg:min-w-25">
                      <span className="text-md lg:text-lg text-soft-yellow mb-1">
                        {column.title}
                      </span>
                      <AnimatedBorder
                        className="bg-soft-yellow/30 w-full"
                        origin="left"
                        delay={0.6 + colIndex * 0.1}
                      />
                    </div>

                    <div className="space-y-1.5 lg:space-y-2">
                      {column.links.map((link, linkIndex) => (
                        <div
                          key={linkIndex}
                          className={`relative overflow-hidden ${column.linkClass}`}
                        >
                          <MenuLink
                            href={link.href}
                            prefetch={false}
                            target={link.isExternal ? "_blank" : undefined}
                            rel={
                              link.isExternal
                                ? "noopener noreferrer"
                                : undefined
                            }
                            ref={(el) => { footerLinkRefs.current[linkIndex + colIndex * 10] = el; }}
                            onClick={() => {
                              // Only close the menu if it's an internal link
                              if (!link.isExternal) setIsActive(false);
                            }}
                            className="block text-[13px] lg:text-[15px] text-soft-white -mb-2 hover:text-soft-yellow transition-colors duration-300"
                          >
                            {link.text}
                          </MenuLink>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullScreenMenu;
