"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import ParallaxImage from "@/components/animations/ParallaxImage";
import CTAButton from "@/components/ui/CTAButton";
import {
  collectionConstants,
  baptismConstants,
} from "@/app/(site)/data/OfferData";
import { baptismProposalMainImages,weddingProposalMainImages } from "@/app/(site)/data/proposal-image-sequence";
import type {ProposalImage} from "@/app/(site)/data/proposal-image-sequence";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

interface ChessRowProps {
  item: any;
  idx: number;
  total: number;
  lang: "en" | "gr";
  eventType: "wedding" | "baptism";
  images:ProposalImage[];
}

const ChessRow = ({ item, idx, total, lang, eventType,images }: ChessRowProps) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // FIXED HERE: Safely pull the static description text from the correct dataset array
  const constantsSource =
    eventType === "baptism"
      ? baptismConstants[lang]
      : collectionConstants[lang];

  // Maps indices correctly safely fallback across dynamic structures
  const targetKey =
    eventType === "baptism"
      ? idx === 0
        ? "essential"
        : "signature"
      : `c${idx + 1}`;

  const constants = (constantsSource as any)?.[targetKey];

  // Dynamic Calendly Links
  const calendlyLink =
    lang === "gr"
      ? "https://calendly.com/vasilis-moumkas/online"
      : "https://calendly.com/vasilis-moumkas/online";

  // Dynamic image path string resolution
  const selectedImage=images[idx]??(eventType==="baptism"?baptismProposalMainImages[idx+1]:weddingProposalMainImages[idx+1]);
  const imageSrc=selectedImage?.src??"";

  useGSAP(
    () => {
      if (!titleRef.current || !contentRef.current) return;
      let cancelled = false;
      let splitTitle: SplitText | undefined;
      let splitContent: SplitText | undefined;
      let timeline: gsap.core.Timeline | undefined;

      const setup = async () => {
        await document.fonts.ready;
        if (cancelled || !titleRef.current || !contentRef.current || !rowRef.current) return;

        splitTitle = new SplitText(titleRef.current, { type: "lines" });
        splitContent = new SplitText(
          contentRef.current.querySelectorAll("p, li, span, h4"),
          { type: "lines" },
        );

        const allLines = [...splitTitle.lines, ...splitContent.lines].filter(
          (line): line is HTMLElement => line instanceof HTMLElement,
        );
        if (!allLines.length) return;

        allLines.forEach((el) => {
          const wrap = document.createElement("div");
          wrap.style.cssText = "display:block; overflow:hidden; vertical-align:top;";
          el.parentNode?.insertBefore(wrap, el);
          wrap.appendChild(el);
        });

        timeline = gsap.timeline({
          scrollTrigger: {
            trigger: rowRef.current,
            start: "top 75%",
            end: "bottom 15%",
            toggleActions: "play none none none",
            once: true,
          },
        });
        timeline.fromTo(allLines, { yPercent: 105 }, { yPercent: 0, duration: 1.2, stagger: 0.02, ease: "power4.out" });
      };

      void setup();
      return () => {
        cancelled = true;
        timeline?.kill();
        splitTitle?.revert();
        splitContent?.revert();
      };
    },
    { scope: rowRef, dependencies: [item, lang] },
  );

  // FIXED HERE: Labels adapt conditionally based on eventType
  const labels = {
    en: {
      collection: "Collection",
      inclusions: "Package Included",
      specifics: "Collection Specifics",
      extras: "Also Included ",
      hours:
        eventType === "baptism"
          ? "Hours of Baptism Coverage"
          : "Hours of Wedding Coverage",
      edited: "Individually Edited Images",
      investment: "Investment",
      cta: "Book a Consultation",
    },
    gr: {
      collection: "Συλλογή",
      inclusions: "ΠΑΚΕΤΟ ΠΕΡΙΛΑΜΒΑΝΕΙ",
      specifics: "ΧΑΡΑΚΤΗΡΙΣΤΙΚΑ ΣΥΛΛΟΓΗΣ",
      extras: "Περιλαμβάνεται Επίσης ",
      hours:
        eventType === "baptism"
          ? "Ώρες Κάλυψης Βάπτισης"
          : "Ώρες Κάλυψης Γάμου",
      edited: "Επεξεργασμένες Φωτογραφίες",
      investment: "Επένδυση",
      cta: "Προγραμματισμός Ραντεβού",
    },
  }[lang];

  const rawExtraServices=Array.isArray(item.cs)
    ? item.cs.map(String).map((service:string)=>service.trim()).filter(Boolean)
    : typeof item.cs==="string"
      ? item.cs.split(/\r?\n/).map((service:string)=>service.replace(/^\s*[-•]\s*/,"").trim()).filter(Boolean)
      : [];
  const extraServices=rawExtraServices.filter((service:string)=>!/(?:^(?:1\s+)?(?:master|κυριος|κύριος)\s+(?:photographer|φωτογραφος|φωτογράφος)|private online gallery|wedding timeline planning|preview gallery (?:with|με) 25|priority editing and delivery|full wedding planning support|ιδιωτικη online gallery|σχεδιασμος χρονοδιαγραμματος|προτεραιοτητα επεξεργασιας|πληρης υποστηριξη σχεδιασμου)/i.test(service));
  const hasSecondPhotographer=/^(yes|true|1|ναι)$/i.test(String(item.phot??"").trim());
  const hasBox=item.bx&&!/^(no|none|false|0|όχι|οχι)$/i.test(String(item.bx).trim());
  const dynamicSpecifics=[
    item.h&&`${item.h} ${labels.hours}`,
    item.img&&`${item.img} ${labels.edited}`,
    hasBox&&String(item.bx),
  ].filter(Boolean) as string[];
  const weddingStandardBase=Array.isArray(constants?.included)
    ? constants.included.map(String).filter((value:string)=>!/(?:second photographer|δευτερος φωτογραφος|δεύτερος φωτογράφος)/i.test(value))
    : [];
  const packageIncluded=eventType==="wedding"
    ? hasSecondPhotographer&&weddingStandardBase.length
      ? [weddingStandardBase[0],lang==="gr"?"1 Δευτερος Φωτογραφος":"1 Second Photographer",...weddingStandardBase.slice(1)]
      : weddingStandardBase
    : dynamicSpecifics;
  const collectionSpecifics=eventType==="wedding"?dynamicSpecifics:[];

  return (
    <section
      ref={rowRef}
      lang={lang==="gr"?"el":"en"}
      className={`relative w-full flex flex-col-reverse md:flex-col md:flex-row items-stretch overflow-hidden border-b border-ink-black/5 min-h-screen ${
        idx % 2 === 1 ? "md:flex-row-reverse" : ""
      }`}
    >
      <div className="w-full md:w-1/2 relative overflow-hidden h-[60vh] md:h-auto z-0 order-1 md:order-none">
        <ParallaxImage
          src={imageSrc}
          alt={selectedImage?.alt??`${eventType} photography collection ${idx+1} by Vasilis Moumkas`}
          fit={eventType==="wedding"?"contain":"cover"}
          description={
            item.ph
              ? item.ph.toLowerCase().replace(/ /g, "-")
              : `collection-photography-${idx + 1}`
          }
          location="greece-italy"
          fill={true}
          priority={idx === 0}
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      <div className="w-full md:w-1/2 flex flex-col justify-center px-6 md:px-10 py-10 md:py-8 bg-off-white z-10 order-2 md:order-none">
        <div>
          <span className="block text-[12px] md:text-[14px] tracking-[0.2em] uppercase text-ink-black/60 mb-4">
            — {labels.collection} 0{idx + 1}
          </span>
          <span
            ref={titleRef}
            className="text-[10vw] md:text-[4vw] leading-[0.9] text-ink-black uppercase tracking-tighter block mb-4"
          >
            {item.ph || constants?.title}
          </span>
        </div>

        <div className="space-y-6" ref={contentRef}>
          <div className="pt-4 border-t border-ink-black/10">
            <span className="text-[18px] md:text-[20px]  text-ink-black/80 leading-tight block">
              {constants?.description}
            </span>
            <div className="pt-6">
              <h4 className="text-[16px] uppercase tracking-[0.2em] text-ink-black/60 mb-4">
                {labels.inclusions}
              </h4>
              <ul className="grid grid-cols-1 gap-1 max-w-md">
                {packageIncluded.map((inc: string, i: number) => (
                  <li
                    key={i}
                    className="text-[16px] md:text-[20px] text-ink-black/90 flex items-center gap-1 max-w-md"
                  >
                    <span className="w-1 h-1 bg-ink-black/30 rounded-full" />-{" "}
                    {inc}
                  </li>
                ))}
              </ul>
            </div>
            {collectionSpecifics.length>0&&<div className="pt-6">
              <h4 className="mb-4 text-[16px] uppercase tracking-[0.2em] text-ink-black/60">
                {labels.specifics}
              </h4>
              <ul className="grid max-w-md grid-cols-1 gap-1">
                {collectionSpecifics.map((specific:string,index:number)=><li key={`${specific}-${index}`} className="flex max-w-md items-center gap-1 text-[16px] text-ink-black/90 md:text-[20px]"><span className="h-1 w-1 rounded-full bg-ink-black/30"/>- {specific}</li>)}
              </ul>
            </div>}
            {extraServices.length>0&&<div className="pt-6">
              <h4 className="mb-4 text-[16px] uppercase tracking-[0.2em] text-ink-black/60">
                {labels.extras}
              </h4>
              <ul className="grid max-w-md grid-cols-1 gap-1">
                {extraServices.map((service:string,index:number)=><li key={`${service}-${index}`} className="flex max-w-md items-center gap-1 text-[16px] text-ink-black/90 md:text-[20px]"><span className="h-1 w-1 rounded-full bg-ink-black/30"/>- {service}</li>)}
              </ul>
            </div>}
          </div>

          <div className="pt-2">
            <div className="mb-6 flex justify-between items-end">
              <span className="text-[18px] uppercase tracking-[0.15em] text-ink-black/40 block pb-1">
                {labels.investment}
              </span>
              {/* AFTER */}
              <span className="price-text text-ink-black text-2xl leading-normal uppercase tracking-tighter block">
                €{item.p}
              </span>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-6 w-full">
              <div className="w-full md:w-2/3">
                <CTAButton
                  className="w-full"
                  href={calendlyLink}
                  target="_blank"
                >
                  {labels.cta}
                </CTAButton>
              </div>
              <span className="font-mono text-[14px] text-ink-black/30">
                0{idx + 1} / 0{total}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

interface OfferChessProps {
  collection1: any;
  collection2: any;
  collection3: any;
  lang?: "en" | "gr";
  eventType?: "wedding" | "baptism";
  imageOffset?: number;
  images?:ProposalImage[];
}

export default function OfferChess({
  collection1,
  collection2,
  collection3,
  lang = "en",
  eventType = "wedding",
  images=[],
}: OfferChessProps) {
  const collections = [collection1, collection2, collection3].filter(
    (item) => item && (item.ph || item.p),
  );

  const awaitingLabel =
    lang === "gr"
      ? "Αναμονή δεδομένων συλλογής..."
      : "Awaiting collection data...";

  return (
    <div className="relative w-full bg-off-white">
      {collections.length === 0 ? (
        <div className="py-40 text-center">
          <p className="text-ink-black uppercase tracking-widest text-sm  opacity-40">
            {awaitingLabel}
          </p>
        </div>
      ) : (
        collections.map((item, idx) => (
          <ChessRow
            key={idx}
            item={item}
            idx={idx}
            total={collections.length}
            lang={lang}
            eventType={eventType}
            images={images}
          />
        ))
      )}
    </div>
  );
}
