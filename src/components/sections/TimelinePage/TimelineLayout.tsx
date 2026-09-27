// FILE: src/components/sections/TimelinePage/TimelineLayout.tsx
"use client";

import React from "react";
import TimelineHero from "./TimelineHero";
import TimelineScheduleBoard from "./TimelineScheduleBoard";
import TimelineOutro from "./TimelineOutro";
import Footer from "@/components/core/Footer";

interface TimelineLayoutProps {
  data: {
    names_gr: string;
    names_en: string;
    date: string;
    items: Array<{
      time: string;
      title_gr: string;
      title_en: string;
      location_gr: string;
      location_en: string;
      desc_gr: string;
      desc_en: string;
    }>;
  } | null;
  lang?: "en" | "gr"; // Derived safely from page route parameters ([slug])
}

export default function TimelineLayout({ data, lang: customLang }: TimelineLayoutProps) {
  // Determine target localized context safely. Defaults to 'en' if not explicitly passed by the slug route
  const lang: "en" | "gr" = customLang || "en";
  
  if (!data) {
    return (
      <div className="h-screen flex items-center justify-center bg-soft-white  ">
        <p className="text-[10px] uppercase tracking-[0.3em] text-black">
          {lang === "gr"
            ? "Το χρονοδιάγραμμα δεν βρέθηκε ή ο σύνδεσμος δεν είναι έγκυρος"
            : "Timeline Not Found or Invalid Link"}
        </p>
      </div>
    );
  }

  // Switch name bindings based on dynamic layout locale context parameters
  const names = lang === "gr" ? data.names_gr : data.names_en;
  const milestones = data.items || [];

  return (
    <main className="bg-soft-white text-ink-black min-h-screen selection:bg-ink-black selection:text-off-white">
      <TimelineHero
        lang={lang}
        names={names}
        date={data.date}
      />
      
      <TimelineScheduleBoard 
        lang={lang} 
        milestones={milestones} 
      />
      
      <TimelineOutro lang={lang} />
      <Footer />
    </main>
  );
}