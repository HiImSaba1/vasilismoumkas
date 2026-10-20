"use client";
import React, { useEffect, useRef, FC } from "react";
import SeoImage from "@/components/ui/SeoImage";

interface ParallaxImageProps {
  src: string;
  description?: string; // Προσθήκη για SEO
  location?: string; // Προσθήκη για SEO
  className?: string;
  sizes?: string;
  fill?: boolean;
  priority?: boolean;
  alt?: string;
  fit?: "cover" | "contain";
  fallbackSrc?: string;
  unoptimized?: boolean;
}

const lerp = (start: number, end: number, factor: number): number =>
  start + (end - start) * factor;

const ParallaxImage: FC<ParallaxImageProps> = ({
  src,
  description,
  location,
  className,
  sizes,
  fill = true,
  priority,
  alt,
  fit = "cover",
  fallbackSrc,
  unoptimized = false,
}) => {
  const imageRef = useRef<HTMLDivElement>(null);
  const bounds = useRef<{ top: number; bottom: number } | null>(null);
  const currentTranslateY = useRef<number>(0);
  const targetTranslateY = useRef<number>(0);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const updateBounds = () => {
      if (!imageRef.current) return;
      const wrapper = imageRef.current.parentElement;
      if (!wrapper) return;

      const rect = wrapper.getBoundingClientRect();
      bounds.current = {
        top: rect.top + window.scrollY,
        bottom: rect.bottom + window.scrollY,
      };
    };

    updateBounds();
    window.addEventListener("resize", updateBounds);
    window.addEventListener("scroll", updateBounds, { passive: true });

    const animate = () => {
      if (imageRef.current && bounds.current) {
        const centerOffset =
          bounds.current.top +
          (bounds.current.bottom - bounds.current.top) / 2 -
          (window.scrollY + window.innerHeight / 2);

        targetTranslateY.current = -centerOffset * 0.12;

        currentTranslateY.current = lerp(
          currentTranslateY.current,
          targetTranslateY.current,
          0.1,
        );

        imageRef.current.style.transform = fit==="contain"?"none":`translateY(${currentTranslateY.current}px) scale(1.15)`;
      }

      rafId.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", updateBounds);
      window.removeEventListener("scroll", updateBounds);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [fit]);

  return (
    <div
      className={`${className || ""} relative overflow-hidden h-full w-full`}
    >
      <div
        ref={imageRef}
        className="relative w-full h-full will-change-transform"
      >
        <SeoImage
          src={src}
          description={description || "photography-portfolio"}
          location={location || "greece-italy"}
          fill={fill}
          priority={priority}
          alt={alt}
          fallbackSrc={fallbackSrc}
          unoptimized={unoptimized}
          className={fit==="contain"?"object-contain":"object-cover"}
          style={{objectFit:fit}}
          sizes={sizes || "(max-width: 768px) 100vw, 50vw"}
        />
      </div>
    </div>
  );
};

export default ParallaxImage;
