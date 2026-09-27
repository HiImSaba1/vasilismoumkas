import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";

interface NavItem {
  title: string;
  href: string;
  image: string;
  imageIndex: number;
}

interface MenuImagePreviewProps {
  activeImageIndex: number | null;
  currentPageImageIndex: number | null;
  navItems: NavItem[];
  className?: string;
}

const MenuImagePreview: React.FC<MenuImagePreviewProps> = ({
  activeImageIndex,
  currentPageImageIndex,
  navItems,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const [visibleIndex, setVisibleIndex] = useState<number | null>(null);

  // Preload images for instant switching
  useEffect(() => {
    navItems.forEach((item) => {
      const img = new Image();
      img.src = item.image;
    });
  }, [navItems]);

  // Set initial visible image
  useEffect(() => {
    setVisibleIndex(currentPageImageIndex);
  }, [currentPageImageIndex]);

  useEffect(() => {
    const nextIndex =
      activeImageIndex !== null ? activeImageIndex : currentPageImageIndex;

    if (nextIndex === null) return;

    const images = Array.from(
      containerRef.current?.querySelectorAll(".preview-image") || []
    ) as HTMLElement[];

    const nextImage = images.find(
      (img) => Number(img.dataset.imageIndex) === nextIndex
    );
    const prevImage = images.find(
      (img) => Number(img.dataset.imageIndex) === visibleIndex
    );

    // Kill previous timeline instantly
    if (tlRef.current) tlRef.current.kill();

    // Create new timeline
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tlRef.current = tl;

    // Reset previous image
    if (prevImage && visibleIndex !== nextIndex) {
      gsap.set(prevImage, {
        clipPath: "inset(0% 0% 0% 0%)",
        opacity: 1,
        scale: 1,
        zIndex: 1,
      });

      tl.to(
        prevImage,
        {
          clipPath: "inset(50% 50% 50% 50%)",
          opacity: 0,
          scale: 0.95,
          duration: 0.65,
        },
        0
      );
    }

    // Animate next image
    if (nextImage) {
      gsap.set(nextImage, {
        clipPath: "inset(50% 50% 50% 50%)",
        opacity: 0,
        scale: 1.1,
        zIndex: 2,
      });

      tl.to(
        nextImage,
        {
          clipPath: "inset(0% 0% 0% 0%)",
          opacity: 1,
          scale: 1,
          duration: 0.5,
        },
        0
      );
    }

    setVisibleIndex(nextIndex);
  }, [activeImageIndex, currentPageImageIndex]);

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none hidden md:block ${className}`}
    >
      <div className="w-full h-full relative overflow-hidden">
        {navItems.map((item) => (
          <div
            key={item.imageIndex}
            data-image-index={item.imageIndex}
            className="preview-image absolute inset-0 opacity-0"
            style={{
              backgroundImage: `url(${item.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              clipPath: "inset(50% 50% 50% 50%)",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default MenuImagePreview;