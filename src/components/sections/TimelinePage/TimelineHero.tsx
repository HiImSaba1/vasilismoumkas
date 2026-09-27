// FILE: src/components/sections/TimelinePage/TimelineHero.tsx
"use client";

import React, { useRef, useState, useEffect } from "react";
import SeoImage from "@/components/ui/SeoImage";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import AnimatedBorder from "@/components/animations/AnimatedBorder";
import { OFFER_SERVICE_POOL } from "@/app/(site)/data/Pages-Photoset/Servicespage";
import { useInitialLoad } from "@/providers/InitialLoadContext";

if (typeof window !== "undefined") {
  gsap.registerPlugin(SplitText);
}

interface TimelineHeroProps {
  names: string;
  date: string;
  lang: "en" | "gr";
}

const translations = {
  en: {
    label: "(Official Wedding Timeline)",
    intro:
      "Planning a celebration is a magnificent art form of alignment, moments, and atmosphere. Below, you will find the real-time, curated schedule structure of your day. We have architected this framework to let your celebration breathe beautifully, ensuring every fleeting glance, fine art detail, and honest interaction is seamlessly documented.",
  },
  gr: {
    label: "(Επίσημο Χρονοδιάγραμμα Γάμου)",
    intro:
      "Ο σχεδιασμός μιας γιορτής είναι μια εξαιρετική τέχνη συντονισμού, στιγμών και ατμόσφαιρας. Παρακάτω θα βρείτε το επιμελημένο πρόγραμμα της ημέρας σας σε πραγματικό χρόνο. Έχουμε δομήσει αυτό το πλαίσιο ώστε η ημέρα σας να κυλήσει αβίαστα, διασφαλίζοντας ότι κάθε αυθεντική ματιά, καλλιτεχνική λεπτομέρεια και ειλικρινής αλληλεπίδραση θα καταγραφεί με απόλυτη αρμονία.",
  },
};

export default function TimelineHero({ lang, names, date }: TimelineHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const paragraphRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const visualWrapperRef = useRef<HTMLDivElement>(null);

  const [staticImg] = useState(() => {
    if (!OFFER_SERVICE_POOL || OFFER_SERVICE_POOL.length === 0) return "";
    return OFFER_SERVICE_POOL[
      Math.floor(Math.random() * OFFER_SERVICE_POOL.length)
    ];
  });

  const [hasMounted, setHasMounted] = useState(false);
  const { isFirstVisit } = useInitialLoad();
  const mainEntranceDelay = isFirstVisit ? 0.2 : 0.6;

  const t = translations[lang] || translations.en;

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useGSAP(
    () => {
      if (!hasMounted || !visualWrapperRef.current) return;

      const splitLabel = new SplitText(labelRef.current, { type: "words" });
      const splitTitle = new SplitText(heroTitleRef.current, { type: "words" });
      const splitPara = new SplitText(paragraphRef.current, { type: "words" });
      const splitDesc = new SplitText(descriptionRef.current, {
        type: "words",
      });

      [splitLabel, splitTitle, splitPara, splitDesc].forEach((split) => {
        const elements = split.words;
        if (!elements) return;

        elements.forEach((el) => {
          const wrapper = document.createElement("div");
          wrapper.style.cssText =
            "display:inline-block; overflow:hidden; vertical-align:top; white-space:nowrap;";
          el.parentNode?.insertBefore(wrapper, el);
          wrapper.appendChild(el);
        });
      });

      gsap.set(
        [splitLabel.words, splitTitle.words, splitPara.words, splitDesc.words],
        { yPercent: 105 },
      );
      gsap.set(visualWrapperRef.current, { scale: 1.1, opacity: 0 });

      const tl = gsap.timeline({ delay: mainEntranceDelay });

      tl.to(visualWrapperRef.current, {
        opacity: 1,
        scale: 1,
        duration: 1.5,
        ease: "expo.out",
      })
        .to(
          splitLabel.words,
          {
            yPercent: 0,
            duration: 0.6,
            stagger: 0.05,
            ease: "power4.out",
          },
          "-=1.2",
        )
        .to(
          splitTitle.words,
          {
            yPercent: 0,
            duration: 0.8,
            stagger: 0.08,
            ease: "power2.out",
          },
          "-=1.0",
        )
        .to(
          splitPara.words,
          {
            yPercent: 0,
            duration: 0.6,
            stagger: 0.01,
            ease: "power4.out",
          },
          "-=0.8",
        )
        .to(
          splitDesc.words,
          {
            yPercent: 0,
            duration: 0.8,
            stagger: 0.005,
            ease: "power3.out",
          },
          "-=0.6",
        );

      return () => {
        [splitLabel, splitTitle, splitPara, splitDesc].forEach((s) =>
          s.revert(),
        );
      };
    },
    { scope: containerRef, dependencies: [hasMounted, lang, names] },
  );

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-screen md:h-screen bg-off-white overflow-hidden flex flex-col md:flex-row"
    >
      <div className="flex flex-col justify-center w-full md:w-1/2 px-4 py-12 md:py-0 z-10">
        <div className="space-y-8">
          <div className="w-fit">
            <span
              ref={labelRef}
              className="text-sm  lg:text-sm  tracking-[0.2em] opacity-60 block pt-12"
            >
              {t.label}
            </span>
            <AnimatedBorder
              className="mt-2 bg-ink-black opacity-30"
              delay={mainEntranceDelay + 0.3}
            />
          </div>

          <div className="w-full">
            <span
              ref={heroTitleRef}
              className="text-[10vw] md:text-[3vw] block font-light w-full"
            >
              {names}
            </span>
            <AnimatedBorder
              className="mt-4 bg-ink-black opacity-30"
              delay={mainEntranceDelay + 0.5}
            />
          </div>

          <div className="max-w-md">
            <div
              ref={paragraphRef}
              className="text-md md:text-xl lg:text-2xl leading-tight block opacity-80 "
              style={{ fontFamily: "var(--font-karena)" }}
            >
              <span>{date}</span>
            </div>
          </div>

          <div className="w-full md:max-w-xl">
            <AnimatedBorder
              className="mb-6 bg-ink-black opacity-30"
              origin="left"
              delay={mainEntranceDelay + 0.6}
            />
            <span
              ref={descriptionRef}
              className="text-md leading-none opacity-80"
              style={{ fontFamily: "var(--font-karena)" }}
            >
              {t.intro}
            </span>
            <p
              className="text-[1.05rem] leading-tight max-w-xl opacity-90 pt-6"
              style={{ fontFamily: "var(--font-karena)" }}
            >
              {lang === "gr" ? "Με εκτίμηση," : "Best regards,"}
              <br />
              <span className="tracking-tight block mt-1">
                {lang === "gr" ? "ΒΑΣΙΛΗΣ ΜΟΥΜΚΑΣ" : "VASILIS MOUMKAS"}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div
        ref={visualWrapperRef}
        className="relative w-full md:w-1/2 h-[50vh] md:h-full overflow-hidden bg-zinc-100"
      >
        {staticImg && (
          <SeoImage
            src={staticImg.startsWith("/") ? staticImg : `/${staticImg}`}
            // Δυναμικό description βασισμένο στο context του project
            description={`cinematic-wedding-timeline-photography-${names.toLowerCase().replace(/ /g, "-")}`}
            location="greece-italy"
            fill
            className="object-cover filtering-editorial grayscale-[20%]"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        )}
      </div>
    </section>
  );
}
