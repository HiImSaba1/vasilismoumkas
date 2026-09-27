"use client";

import React, { useState, useEffect } from "react";
import InstagramHeroDesktop from "./InstagramHeroDesktop";
import InstagramHeroMobile from "./InstagramHeroMobile";

export default function InstagramHero() {
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

  if (!isClient) return <div className="h-dvh bg-off-white" />;

  return (
    <div className="relative w-full overflow-hidden">
      {isDesktop ? <InstagramHeroDesktop /> : <InstagramHeroMobile />}
    </div>
  );
}