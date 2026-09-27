"use client";

import React, { useState, useEffect } from "react";
import HomeHeroDesktop from "./HomeHeroDesktop";
import HomeHeroMobile from "./HomeHeroMobile";

export default function HomeHero() {
  const [isClient, setIsClient] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true); // Default to desktop to avoid flickering

  useEffect(() => {
    setIsClient(true);
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!isClient) return <div className="h-dvh bg-white" />;

  return (
    <div className="relative w-full overflow-hidden">
      {isDesktop ? <HomeHeroDesktop /> : <HomeHeroMobile />}
    </div>
  );
}