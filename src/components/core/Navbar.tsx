"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import FullScreenMenu from "./FullScreenMenu";
import { gsap } from "gsap";
import type {SeoSettings} from "@/lib/seo-settings";

const Navbar: React.FC<{business?:SeoSettings["business"]}> = ({business}) => {
  const [isActive, setIsActive] = useState(false);
  const [isStickyVisible, setIsStickyVisible] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true);
  const pathname = usePathname();
  const navbarRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const header=navbarRef.current;
    if(!header)return;
    const update=()=>document.documentElement.style.setProperty("--site-header-height",`${header.offsetHeight}px`);
    update();
    const observer=new ResizeObserver(update);
    observer.observe(header);
    return()=>{observer.disconnect();document.documentElement.style.removeProperty("--site-header-height");};
  },[]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsActive(false);
      setIsStickyVisible(true);
      if (navbarRef.current) {
        gsap.to(navbarRef.current, {
          y: "0%",
          duration: 0.5,
          ease: "power3.out",
          clearProps: "y",
        });
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  const toggleMenu = () => setIsActive((prev) => !prev);

  const onMouseEnter = (e: React.MouseEvent) => {
    if (window.innerWidth < 768) return;
    const parts = e.currentTarget.querySelectorAll(".expand-part");
    if (parts.length > 0) {
      gsap.to(parts, {
        width: "auto",
        opacity: 1,
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.05,
      });
    }
  };

  const onMouseLeave = (e: React.MouseEvent) => {
    if (window.innerWidth < 768) return;
    const parts = e.currentTarget.querySelectorAll(".expand-part");
    if (parts.length > 0) {
      gsap.to(parts, {
        width: 0,
        opacity: 0,
        duration: 0.4,
        ease: "power3.inOut",
      });
    }
  };

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const navElement = navbarRef.current;
      const current = window.scrollY;
      setIsAtTop(current <= 10);

      if (isActive) return;

      if (current < 50) {
        setIsStickyVisible(true);
        gsap.to(navElement, { y: "0%", duration: 0.4, ease: "power2.out" });
        return;
      }

      if (current > lastScrollY && isStickyVisible) {
        setIsStickyVisible(false);
        gsap.to(navElement, {
          y: "-110%",
          duration: 0.4,
          ease: "power2.inOut",
        });
      } else if (current < lastScrollY && !isStickyVisible) {
        setIsStickyVisible(true);
        gsap.to(navElement, { y: "0%", duration: 0.4, ease: "power2.out" });
      }
      lastScrollY = current;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isStickyVisible, isActive]);

  return (
    <>
      <div
        ref={navbarRef}
        data-site-header="true"
        className={`main-header-wrapper rounded-b-md transition-all duration-500 ease-in-out ${
          (pathname === "/contact" || pathname === "/admin/pages/contact/preview") && !isActive
            ? "bg-off-white/95 md:bg-off-white/90 shadow-sm text-ink-black"
            : isAtTop
            ? "bg-transparent backdrop-blur-none shadow-none"
            : "bg-off-white/15 backdrop-blur-sm shadow-md"
        }`}
        style={{
          zIndex: 9998, // Safely below Loader (10000)
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
        }}
      >
        <div className="navbar-header flex items-center justify-between px-4 lg:px-8">
          <Link
            href="/"
            prefetch={false}
            ref={logoRef}
            className="navbar-logo flex items-center group shrink-0"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          >
            <span
              className="inner-logo-text flex items-center uppercase text-md md:text-xl whitespace-nowrap"
              style={{ fontFamily: "var(--font-karena)" }}
            >
              <div className="flex items-center">
                <span>V</span>
                <span className="expand-part inline-block overflow-hidden whitespace-nowrap w-auto opacity-100 md:w-0 md:opacity-0">
                  asilis
                </span>
              </div>
              <div className="flex items-center ml-1.5 md:ml-1">
                <span>M</span>
                <span className="expand-part inline-block overflow-hidden whitespace-nowrap w-auto opacity-100 md:w-0 md:opacity-0">
                  oumkas
                </span>
              </div>
            </span>
          </Link>

          <div className="flex items-center">

            <button
              type="button"
              className="flex items-center gap-1 md:gap-2 cursor-pointer group"
              onClick={toggleMenu}
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
              aria-label={isActive ? "Close menu" : "Open menu"}
              aria-expanded={isActive}
              aria-controls="site-menu"
            >
              <span className="text-md uppercase tracking-widest flex items-center overflow-hidden">
                <span className="hidden md:flex items-center">M<span className="expand-part inline-block overflow-hidden w-0 opacity-0 whitespace-nowrap">enu</span></span>
                <span className="inline md:hidden text-sm">Menu</span>
              </span>
              <div className="menu-button transition-all duration-700 ease-in-out hover:scale-90 rounded-full p-2" style={{zIndex:100000,pointerEvents:"auto",position:"relative"}}>
                <div className={`burger ${isActive ? "burger-active" : ""}`}></div>
              </div>
            </button>
          </div>
        </div>
      </div>
      <FullScreenMenu isActive={isActive} setIsActive={setIsActive} business={business}/>
    </>
  );
};

export default Navbar;
