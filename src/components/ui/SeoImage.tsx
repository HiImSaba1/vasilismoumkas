"use client";

import Image, { ImageProps } from "next/image";
import { forwardRef } from "react";

interface SeoImageProps extends Omit<ImageProps, 'alt'> {
  description?: string; 
  location?: string;    
  alt?: string;
  fallbackSrc?: string;
}

const SeoImage = forwardRef<HTMLImageElement, SeoImageProps>(
  ({ alt, src, fallbackSrc,description = "portfolio", location = "greece",onError,...props }, ref) => {
    if (!src) return null;

    const generatedAlt = `${description}-${location}-vasilis-moumkas`.toLowerCase();

    return (
      <Image
        {...props}
        ref={ref}
        src={src}
        alt={alt ?? generatedAlt}
        onError={(event)=>{onError?.(event);if(fallbackSrc&&event.currentTarget.dataset.fallbackApplied!=="true"){event.currentTarget.dataset.fallbackApplied="true";event.currentTarget.srcset="";event.currentTarget.src=fallbackSrc}}}
      />
    );
  }
);

SeoImage.displayName = "SeoImage";

export default SeoImage;
