"use client";

import React, { useRef } from "react";
import SeoImage from "@/components/ui/SeoImage";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AnimatedBorder from "@/components/animations/AnimatedBorder";
import { baptismProposalMainImages,weddingProposalMainImages } from "@/app/(site)/data/proposal-image-sequence";
import { useInitialLoad } from "@/providers/InitialLoadContext";
import type {OfferWebsiteContent} from "@/lib/website-settings";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

interface OfferHeroProps {
  names: string;
  date: string;
  location: string;
  planner?: string;
  lang: "en" | "gr";
  type: "wedding" | "baptism";
  imageIndex?: number;
  content:OfferWebsiteContent;
}

const translations = {
  en: {
    collab: "In Collaboration with:",
    wedding: {
      label: "(Private Wedding Offer)",
      intro:
        "First, thank you for inviting me into your story. Your wedding is more than a sequence of events; it is a collection of feelings. Beyond the aesthetic of the day, I focus on the heartbeat of your story capturing the quiet glances and the overwhelming joy with an editorial eye. Below, you will find the collections I have curated specifically for your celebration.",
    },
    baptism: {
      label: "(Private Baptism Offer)",
      intro:
        "The day of the baptism is a story full of light, tenderness, and authentic moments turning into precious memories for a lifetime. My approach is based on a fine-art photojournalistic style, capturing this significant day as it unfolds naturally, with elegance, truth, and a timeless aesthetic. Thank you from the bottom of my heart for considering me for such a special and personal chapter of your family life. It will be my honor to document every single moment.",
    },
  },
  gr: {
    collab: "Σε συνεργασία με:",
    wedding: {
      label: "(Ιδιωτική Προσφορά Γάμου)",
      intro:
        "Σας ευχαριστώ θερμά για το ενδιαφέρον σας και για την ευκαιρία να γίνω μέρος μιας τόσο ξεχωριστής ημέρας. Ο γάμος σας είναι μια μοναδική ιστορία γεμάτη συναίσθημα, αυθεντικές στιγμές και πολύτιμες αναμνήσεις. Στόχος μου είναι να καταγράψω με φυσικότητα και διακριτικότητα όλα όσα κάνουν αυτή την ημέρα ανεπανάληπτη, δημιουργώντας εικόνες που θα διατηρήσουν τη συγκίνηση αναλλοίωτη στον χρόνο. Στις επόμενες σελίδες θα βρείτε τις διαθέσιμες συλλογές φωτογράφισης, σχεδιασμένες ώστε να καλύπτουν διαφορετικές ανάγκες, με την ίδια πάντα φροντίδα, αισθητική και αφοσίωση στη λεπτομέρεια.",
    },
    baptism: {
      label: "(Ιδιωτική Προσφορά Βάπτισης)",
      intro:
        "Η ημέρα της βάπτισης είναι μια ιστορία γεμάτη φως, τρυφερότητα και αυθεντικές στιγμές που μετατρέπονται σε πολύτιμες αναμνήσεις για μια ζωή. Η προσέγγισή μου βασίζεται στο fine-art photojournalistic ύφος, αποτυπώνοντας τη σημαντική αυτή ημέρα όπως ξεδιπλώνεται φυσικά, με κομψότητα, αλήθεια και διαχρονική αισθητική. Σας ευχαριστώ από καρδιάς που με σκέφτεστε για ένα τόσο ιδιαίτερο και προσωπικό κεφάλαιο της οικογενειακής σας ζωής. Θα είναι τιμή μου να καταγράψω κάθε στιγμή με φροντίδα, ευαισθησία και ουσιαστική πρόθεση, από τα πιο ήρεμα βλέμματα μέχρι τα πιο αυθόρμητα χαμόγελα.",
    },  
  },
};

const OfferHero = ({
  lang,
  type = "wedding",
  names,
  date,
  location,
  planner,
  content,
}: OfferHeroProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const paragraphRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const visualWrapperRef = useRef<HTMLDivElement>(null);

  const selectedImage=content.heroImage??(type==="baptism"?baptismProposalMainImages[0]:weddingProposalMainImages[0]);
  const staticImg = selectedImage.src;

  const { isFirstVisit } = useInitialLoad();
  const mainEntranceDelay = isFirstVisit ? 0.2 : 0.6;

  const localizedContent = translations[lang] || translations.en;
  const t = {...(localizedContent[type] || localizedContent.wedding),label:content.heroLabel[lang],intro:content.heroIntro[lang]};

  useGSAP(
    () => {
      const labelElement = labelRef.current;
      const titleElement = heroTitleRef.current;
      const paragraphElement = paragraphRef.current;
      const descriptionElement = descriptionRef.current;
      const visualElement = visualWrapperRef.current;

      if (
        !labelElement ||
        !titleElement ||
        !paragraphElement ||
        !descriptionElement ||
        !visualElement
      ) return;

      const revealTitle = () => {
        const titleTargets = [titleElement, ...titleElement.querySelectorAll("*")];
        gsap.set(titleTargets, { yPercent: 0, opacity: 1, visibility: "visible", clearProps: "transform" });
      };
      const titleSafetyTimer = window.setTimeout(revealTitle, 2500);

      const splitLabel = new SplitText(labelElement, { type: "words", mask: "words" });
      const splitTitle = new SplitText(titleElement, { type: "words", mask: "words" });
      const splitPara = new SplitText(paragraphElement, { type: "words", mask: "words" });
      const splitDesc = new SplitText(descriptionElement, {
        type: "words",
        mask: "words",
      });

      const allWords = [
        ...splitLabel.words,
        ...splitTitle.words,
        ...splitPara.words,
        ...splitDesc.words,
      ].filter((word): word is HTMLElement => word instanceof HTMLElement);

      if (allWords.length > 0) gsap.set(allWords, { yPercent: 105 });
      gsap.set(visualElement, { scale: 1.1, opacity: 0 });

      const tl = gsap.timeline({
        delay: mainEntranceDelay,
        onComplete: () => {
          window.clearTimeout(titleSafetyTimer);
          revealTitle();
        },
      });

      tl.to(visualElement, {
        opacity: 1,
        scale: 1,
        duration: 1.5,
        ease: "expo.out",
      });
      if (splitLabel.words.length) tl.to(splitLabel.words, { yPercent: 0, duration: 0.6, stagger: 0.05, ease: "power4.out" }, "-=1.2");
      if (splitTitle.words.length) tl.to(splitTitle.words, { yPercent: 0, duration: 0.8, stagger: 0.08, ease: "power2.out" }, "-=1.0");
      if (splitPara.words.length) tl.to(splitPara.words, { yPercent: 0, duration: 0.6, stagger: 0.01, ease: "power4.out" }, "-=0.8");
      if (splitDesc.words.length) tl.to(splitDesc.words, { yPercent: 0, duration: 0.8, stagger: 0.005, ease: "power3.out" }, "-=0.6");

      return () => {
        window.clearTimeout(titleSafetyTimer);
        tl.kill();
        [splitLabel, splitTitle, splitPara, splitDesc].forEach((s) =>
          s.revert(),
        );
      };
    },
    { scope: containerRef, dependencies: [lang, type] },
  );

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-screen md:h-screen bg-off-white overflow-hidden flex flex-col md:flex-row"
    >
      <div className="flex flex-col justify-center w-full md:w-1/2 px-8 md:px-12 py-10 md:py-0 z-10">
        <div className="space-y-8">
          <div className="w-fit">
            <span
              ref={labelRef}
              className="text-sm  lg:text-xl tracking-widest opacity-60 block pt-16"
            >
              {t.label}
            </span>
            <AnimatedBorder
              className="mt-2 bg-ink-black"
              delay={mainEntranceDelay + 0.3}
            />
          </div>

          <div className="w-fit">
            <span
              ref={heroTitleRef}
              className="text-[10vw] md:text-[4vw] leading-[1.4] tracking-tighter uppercase block [visibility:visible]"
            >
              {names}
            </span>
            <AnimatedBorder
              className="mt-4 bg-ink-black"
              delay={mainEntranceDelay + 0.5}
            />
          </div>

          <div className="max-w-2xl">
            <div
              ref={paragraphRef}
              className="text-md md:text-xl lg:text-2xl leading-[1.4] block opacity-80 tracking-tight"
              style={{ fontFamily: "var(--font-karena)" }}
            >
              <span>
                {date}   {location}
                <br />
              </span>
              {planner && (
                <span className="mt-2">
                  {localizedContent.collab} &nbsp; {planner}
                </span>
              )}
            </div>
          </div>

          <div className="w-full">
            <AnimatedBorder
              className="mb-6 bg-ink-black"
              origin="left"
              delay={mainEntranceDelay + 0.6}
            />
            <p
              ref={descriptionRef}
              className="text-[1.1rem] leading-tight max-w-xl opacity-90"
              style={{ fontFamily: "var(--font-karena)" }}
            >
              {t.intro}
            </p>
            <p
              className="text-[1.1rem] md:text-[1.3rem] leading-tight max-w-xl opacity-90 pt-6"
              style={{ fontFamily: "var(--font-karena)" }}
            >
              {lang === "gr" ? "Με εκτίμηση," : "Best regards,"}
              <br />
              {lang === "gr" ? "Βασίλης Μούμκας" : "Vasilis Moumkas"}
            </p>
          </div>
        </div>
      </div>

      <div
        ref={visualWrapperRef}
        className="relative w-full md:w-1/2 h-[50vh] md:h-full overflow-hidden bg-zinc-200"
      >
        {staticImg && (
          <SeoImage
            src={staticImg.startsWith("/") ? staticImg : `/${staticImg}`}
            fill
            description={`${type === "wedding" ? "wedding" : "baptism"}-photography`}
            location="greece-italy"
            alt={selectedImage.alt}
            className={type==="wedding"?"object-contain":"object-cover"}
            priority
            loading="eager"
            fetchPriority="high"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        )}
      </div>
    </section>
  );
};

export default OfferHero;
