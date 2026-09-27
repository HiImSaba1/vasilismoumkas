"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import React from "react";

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

interface CTAButtonProps {
  children: React.ReactNode;
  className?: string;
  href?: string;
  asButton?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  target?: string; // Added target prop
}

const CTAButton: React.FC<CTAButtonProps> = ({ 
  children, 
  className, 
  href, 
  asButton, 
  disabled,
  onClick,
  target // Destructure target
}) => {

  const revealEase = "ease-[0.19,1,0.22,1]";
  const duration = "duration-[600ms]";

  const styles = cn(
    "group relative inline-flex items-center justify-center overflow-hidden border border-ink-black/40 transition-all duration-500 disabled:opacity-50",
    "px-4 py-2.5 text-sm  md:text-md md:px-7 md:py-3.5  uppercase tracking-wide",
    className
  );

  const content = (
    <>
      <span 
        className={cn(
          "absolute inset-0 bg-ink-black z-0 transition-all",
          duration,
          revealEase,
          "[clip-path:inset(0_100%_0_0)] group-hover:[clip-path:inset(0_0%_0_0)]"
        )} 
      />

      {/* DEFAULT TEXT */}
      <span className={cn(
        "relative z-20 inline-block transition-all",
        duration,
        revealEase,
        "group-hover:translate-x-8 group-hover:opacity-0"
      )}>
        {children}
      </span>

      {/* HOVER TEXT */}
      <span className={cn(
        "absolute inset-0 z-30 flex items-center justify-center gap-2 -translate-x-6 opacity-0 transition-all",
        duration,
        revealEase,
        "group-hover:translate-x-0 group-hover:opacity-100 group-hover:text-[#f8f5f2]"
      )}>
        {children}
        <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
      </span>
    </>
  );

  if (asButton) {
    return (
      <button type="submit" disabled={disabled} onClick={onClick} className={styles}>
        {content}
      </button>
    );
  }

  // Check if it's an external link to apply security rel attribute
  const isExternal = href?.startsWith("http") || target === "_blank";

  return (
    <Link 
      href={href || "#"} 
      className={styles}
      target={target}
      rel={isExternal ? "noopener noreferrer" : undefined}
    >
      {content}
    </Link>
  );
};

export default CTAButton;