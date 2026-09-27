"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface RevealButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  isExternal?: boolean;
}

const RevealButton: React.FC<RevealButtonProps> = ({
  href,
  children,
  className = "",
  isExternal = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const content = (
    <>
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ clipPath: "inset(0 100% 0 0)" }}
            animate={{ clipPath: "inset(0 0% 0 0)" }}
            exit={{ clipPath: "inset(0 100% 0 0)" }}
            transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
            className="absolute inset-0 bg-off-white z-0" // Changed to soft-yellow to pop in the footer
          />
        )}
      </AnimatePresence>
      <motion.span
        animate={{ color: isHovered ? "#221F20" : "#f2efe4" }}
        transition={{ duration: 0.4 }}
        className="uppercase relative z-10 flex items-center gap-2 whitespace-nowrap pointer-events-none"
      >
        {children}
      </motion.span>
    </>
  );

  // Added bg-ink-black as the static base
  const containerClasses = `relative flex items-center justify-center px-4 py-2 overflow-hidden group bg-ink-black ${className}`;

  if (isExternal || href.startsWith("tel:") || href.startsWith("mailto:")) {
    return (
      <a
        href={href}
        className={containerClasses}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className={containerClasses}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {content}
    </Link>
  );
};

export default RevealButton;
