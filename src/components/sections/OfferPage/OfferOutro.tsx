"use client";

import React from "react";
import SeoImage from "@/components/ui/SeoImage";
import ParallaxImage from "@/components/animations/ParallaxImage";
import RevealAnimation from "@/components/animations/RevealAnimation";
import AnimatedBorder from "@/components/animations/AnimatedBorder";
import { eventImagePool } from "@/app/(site)/data/event-image-pools";
import { weddingProposalSmallImages } from "@/app/(site)/data/proposal-image-sequence";
interface OfferOutroProps {
  lang: "en" | "gr";
  isBaptism?: boolean;
  imageOffset?: number;
}

const translations = {
  en: {
    wedding:
      "Thank you sincerely for your time and trust. It would be my absolute pleasure to capture the moments you will cherish for a lifetime. Let’s create the memories of your day, together.",
    baptism:
      "Thank you sincerely for your time and trust. It would be an absolute honor to preserve your family's beautiful milestone. Let’s create timeless memories of your child's day, together.",
  },
  gr: {
    wedding:
      "Σας ευχαριστώ θερμά για τον χρόνο και την εμπιστοσύνη σας. Θα είναι ιδιαίτερη χαρά μου να καταγράψω τις στιγμές που θα θυμάστε για μια ζωή. Ας δημιουργήσουμε μαζί τις αναμνήσεις της ημέρας σας.",
    baptism:
      "Σας ευχαριστώ θερμά για τον χρόνο και την εμπιστοσύνη σας. Θα είναι ιδιαίτερη τιμή μου να αποτυπώσω αυτόν τον όμορφο σταθμό της οικογένειάς σας. Ας δημιουργήσουμε μαζί τις διαχρονικές αναμνήσεις της ημέρας του παιδιού σας.",
  },
};

const OfferOutro = ({ lang, isBaptism = false, imageOffset = 0 }: OfferOutroProps) => {
  const langSet = translations[lang] || translations.en;
  const textContent = isBaptism ? langSet.baptism : langSet.wedding;
  if(isBaptism)return <section className="bg-off-white px-5 py-16 md:px-10 md:py-24"><div className="mx-auto max-w-4xl border-l border-ink-black/40 pl-6 md:pl-10"><RevealAnimation once><span className="block text-[clamp(1.4rem,3vw,2.5rem)] font-light leading-[1.15] tracking-tight">{textContent}</span></RevealAnimation></div></section>;
  const selectedPool = weddingProposalSmallImages.map(image=>image.src);
  const fallbackPool=eventImagePool("wedding");
  const start=(Math.abs(imageOffset)+3)%selectedPool.length;
  const images = selectedPool.length > 0 ? {
    left: selectedPool[start] || "",
    partner: selectedPool[(start+1)%selectedPool.length] || "",
    right: selectedPool[(start+2)%selectedPool.length] || "",
  } : null;

  if (!images) {
    return <section className="min-h-[50vh] bg-off-white" />;
  }

  return (
    <section className="relative z-20 w-full bg-off-white">
      <div className="min-h-[50vh] w-full py-12 px-4 md:px-8 flex items-center">
        <div className="max-w-full mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch w-full">
          {/* Left Column - Editorial Portrait */}
          <div className="hidden md:flex md:col-span-3 flex-col justify-start items-start">
            <div className="relative w-[18vw] aspect-3/4 overflow-hidden bg-ink-black/5">
              <ParallaxImage
                src={images.left}
                fallbackSrc={fallbackPool[0]}
                description={
                  isBaptism
                    ? "family-portrait-storytelling"
                    : "wedding-storytelling"
                }
                location="greece-italy"
                className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
              />
            </div>
          </div>

          {/* Middle Column - Text Content */}
          <div className="col-span-1 md:col-span-7 flex flex-row group h-full">
            <div className="w-px relative mr-6 md:mr-10 h-full">
              <AnimatedBorder
                origin="top"
                duration={2.5}
                className="bg-ink-black"
                isVertical={true}
              />
            </div>

            <div className="flex flex-col justify-between py-4 flex-1">
              <div className="w-full max-w-4xl">
                <RevealAnimation once>
                  <span
                    className="block text-ink-black/80 text-[clamp(20px,3vw,1.7rem)] leading-[1.1] tracking-tighter font-light"
                    style={{ fontFamily: "var(--font-karena)" }}
                  >
                    {textContent}
                  </span>
                </RevealAnimation>
              </div>

              {/* Small Anchor Image */}
              <div className="mt-12 md:mt-16 flex flex-col items-start">
                <div className="relative w-32 md:w-[10vw] aspect-square overflow-hidden bg-ink-black/5">
                  <SeoImage
                    src={images.partner}
                    fallbackSrc={fallbackPool[1]??fallbackPool[0]}
                    description="vasilis-moumkas-detail"
                    location="greece-italy"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 128px, 10vw"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Secondary Portrait */}
          <div className="hidden md:flex md:col-span-2 flex-col justify-end items-end">
            <div className="relative w-full aspect-3/4 overflow-hidden bg-ink-black/5">
              <ParallaxImage
                src={images.right}
                fallbackSrc={fallbackPool[2]??fallbackPool[0]}
                description={
                  isBaptism
                    ? "cinematic-christening-photography"
                    : "cinematic-wedding-photography"
                }
                location="greece-italy"
                className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OfferOutro;
