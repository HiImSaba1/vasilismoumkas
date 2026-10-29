"use client";

import React from "react";
import {useEducationMounted,useEducationDesktop} from "./useEducationViewport";
import EducationHeroDesktop from "./EducationHeroDesktop";
import EducationHeroMobile from "./EducationHeroMobile";

export default function EducationCTA() {
  const isClient=useEducationMounted();
  const isDesktop=useEducationDesktop();

  if (!isClient) return <div className="h-dvh bg-white" />;

  return (
    <div className="relative w-full overflow-hidden">
      {isDesktop ? <EducationHeroDesktop /> : <EducationHeroMobile />}
    </div>
  );
} 