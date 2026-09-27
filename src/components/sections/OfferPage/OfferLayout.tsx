"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import OfferHero from "./OfferHero";
import HomeProjectsGrid from "../HomePage/HomeProjectsGrid";
import OfferChess from "./OfferChess";
import OfferFaqSection from "./OfferFaq";
import OfferOutro from "./OfferOutro";
import Footer from "@/components/core/Footer";
import { GreekUppercaseNormalizer } from "@/components/GreekUppercaseNormalizer";
import { BaptismOfferGallery } from "./BaptismOfferGallery";

import {
  collectionConstants,
  baptismConstants,
} from "@/app/(site)/data/OfferData";

interface OfferLayoutProps {
  initialData: any;
  imageSeed?: number;
}

const defaultCollections = {
  wedding: [
    { ph: "Essential", p: "1600", h: "10", img: "1000+", bx: "No", phot: "No", cs: "" },
    { ph: "Most Popular", p: "1900", h: "10", img: "1200+", bx: "50 Prints", phot: "Yes", cs: "" },
    { ph: "Full Wedding Experience", p: "2300", h: "12", img: "1500+", bx: "100 Prints", phot: "Yes", cs: "" },
  ],
  baptism: [
    { ph: "The Essential Collection", p: "500", h: "3", img: "700+", bx: null, cs: null },
    { ph: "The Signature Collection", p: "850", h: "5", img: "900+", bx: "50", cs: null },
  ],
} as const;

// REMOVED eventType here since the box naming logic only needs the language
const formatCollectionData = (
  collection: any,
  lang: "en" | "gr",
) => {
  if (!collection) return null;

  const formatted = { ...collection };

  if (formatted.bx) {
    if (formatted.bx.includes("30")) {
      formatted.bx =
        lang === "gr"
          ? "Πολυτελές χειροποίητο κουτί Fine Art με 30 εκτυπώσεις και premium USB"
          : "Luxury Handmade Fine Art Box with 30 Prints & Matching Premium USB";
    } else if (formatted.bx.includes("50")) {
      formatted.bx =
        lang === "gr"
          ? "Πολυτελές ξύλινο κουτί Fine Art με 50 εκτυπώσεις και ξύλινο USB"
          : "Luxury Fine Art Wooden Box with 50 Prints & Matching Wooden USB";
    } else if (formatted.bx.includes("100")) {
      formatted.bx =
        lang === "gr"
          ? "Πολυτελές ξύλινο κουτί Fine Art με 100 εκτυπώσεις και ξύλινο USB"
          : "Luxury Fine Art Wooden Box with 100 Prints & Matching Wooden USB";
    }
  }

  return formatted;
};

export default function OfferLayout({ initialData, imageSeed = 0 }: OfferLayoutProps) {
  const data = initialData;

  const lang: "en" | "gr" = data?.lang === "gr" ? "gr" : "en";
  const eventType: "wedding" | "baptism" =
    data?.type === "baptism" ? "baptism" : "wedding";

  if (!data) {
    return (
      <div className="h-screen flex items-center justify-center bg-soft-white  ">
        <p className="text-[10px] uppercase tracking-[0.3em]">
          {lang === "gr"
            ? "Η πρόσκληση έληξε ή ο σύνδεσμος δεν είναι έγκυρος"
            : "Invitation Expired or Invalid Link"}
        </p>
      </div>
    );
  }

  const isBaptism = eventType === "baptism";
  const fallbackCollections = defaultCollections[eventType];

  const rawCollection1 = (isBaptism ? data.b1 : data.c1) ?? fallbackCollections[0];
  const rawCollection2 = (isBaptism ? data.b2 : data.c2) ?? fallbackCollections[1];
  const rawCollection3 = isBaptism ? data.b3 : (data.c3 ?? fallbackCollections[2]);

  const constantsSource = isBaptism
    ? baptismConstants[lang]
    : collectionConstants[lang];

  // REMOVED eventType from the function calls here
  const c1 = rawCollection1
    ? {
        ...formatCollectionData(rawCollection1, lang),
        ...(isBaptism
          ? (constantsSource as any).b1
          : (constantsSource as any).c1),
      }
    : null;

  const c2 = rawCollection2
    ? {
        ...formatCollectionData(rawCollection2, lang),
        ...(isBaptism
          ? (constantsSource as any).b2
          : (constantsSource as any).c2),
      }
    : null;

  const c3 = rawCollection3
    ? {
        ...formatCollectionData(rawCollection3, lang),
        ...(isBaptism
          ? (constantsSource as any).b3
          : (constantsSource as any).c3),
      }
    : null;

  return (
    <GreekUppercaseNormalizer active={lang==="gr"}><main className="bg-soft-white ">
      <OfferHero
        lang={lang}
        type={eventType}
        names={data.n}
        date={data.d}
        location={data.loc}
        planner={data.pl}
        imageIndex={imageSeed}
      />
      <OfferChess
        lang={lang}
        eventType={eventType}
        collection1={c1}
        collection2={c2}
        collection3={c3}
        imageOffset={imageSeed}
      />
      {isBaptism?<BaptismOfferGallery lang={lang}/>:<HomeProjectsGrid compact />}
      <OfferFaqSection lang={lang} type={eventType} />
      <OfferOutro lang={lang} isBaptism={isBaptism} imageOffset={imageSeed}/>
      <Footer isBaptism={isBaptism} proposalMode={!isBaptism} hideMarquee={isBaptism}/>
    </main></GreekUppercaseNormalizer>
  );
}
