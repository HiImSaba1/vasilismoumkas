"use client";

import React from "react";
import {useEducationMounted,useEducationDesktop} from "./useEducationViewport";
import EducationCTADesktop from "./EducationCTADesktop";
import EducationCTAMobile from "./EducationCTAMobile";


export default function EducationCTA() {
  const isClient=useEducationMounted();
  const isDesktop=useEducationDesktop();

  if (!isClient) return <div className="h-dvh bg-white" />;

  return (
    <div className="relative w-full overflow-hidden">
      {isDesktop ? <EducationCTADesktop /> : <EducationCTAMobile />}
    </div>
  );
} 