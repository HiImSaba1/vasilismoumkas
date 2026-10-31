"use client";

import Link from "next/link";
import React from "react";

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

// Replace only arrow glyphs, including the emoji presentation selector.
// Saved labels, surrounding text and the existing hover layers stay intact.
function monochromeArrows(node: React.ReactNode): React.ReactNode {
  if (typeof node === "string") return node.split(/([↗➚]\uFE0F?)/u).map((part,index) => /^[↗➚]\uFE0F?$/u.test(part) ? <svg key={index} aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="ml-1 inline-block h-[1em] w-[1em] align-[-0.1em]"><path d="M5 19 19 5M5 5h14v14"/></svg> : part.replace(/^\uFE0F/u,""));
  // Children.map supplies stable React keys when rebuilding static JSX siblings.
  if (Array.isArray(node)) return React.Children.map(node, child => monochromeArrows(child));
  if (React.isValidElement<{children?:React.ReactNode}>(node) && typeof node.type === "string") return React.cloneElement(node, {}, monochromeArrows(node.props.children));
  return node;
}

interface CTAButtonProps {
  children: React.ReactNode;
  className?: string;
  href?: string;
  asButton?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  target?: string; // Added target prop
  "aria-label"?: string;
}

const CTAButton: React.FC<CTAButtonProps> = ({ 
  children, 
  className, 
  href, 
  asButton, 
  disabled,
  onClick,
  target,
  "aria-label": ariaLabel,
}) => {

  const revealEase = "ease-[0.19,1,0.22,1]";
  const label = monochromeArrows(children);
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
        {label}
      </span>

      {/* HOVER TEXT */}
      <span className={cn(
        "absolute inset-0 z-30 flex items-center justify-center gap-2 -translate-x-6 opacity-0 transition-all",
        duration,
        revealEase,
        "group-hover:translate-x-0 group-hover:opacity-100 group-hover:text-[#f8f5f2]"
      )}>
        {label}
      </span>
    </>
  );

  if (asButton) {
    return (
      <button type="submit" disabled={disabled} onClick={onClick} className={styles} aria-label={ariaLabel}>
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
      aria-label={ariaLabel}
    >
      {content}
    </Link>
  );
};

export default CTAButton;
