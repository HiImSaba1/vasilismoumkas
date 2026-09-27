// app/not-found.tsx
"use client";

import React, { useState, useEffect } from "react";
import SeoImage from "@/components/ui/SeoImage";
import Link from "next/link";

export default function NotFound() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <main className="min-h-screen flex flex-col md:flex-row overflow-hidden bg-[#F8F5F2]">
      {/* LEFT COLUMN: STATIC IMAGE */}
      <section className="relative w-full md:w-1/2 h-[50vh] md:h-screen overflow-hidden isolate">
        {isMounted && (
          <SeoImage
            src="/vm_img/About/vasilis_moumkas_about_big_image_2.webp"
            alt="Lost in focus"
            description="Lost in focus"
            location="Greece"
            fill
            priority
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/20 z-10" />
        
        <div className="absolute inset-0 z-20 flex items-end p-8 md:p-20 pointer-events-none">
          <h2 className="text-[15vw] md:text-[12vw] leading-[0.8] tracking-tighter font-bold text-[#ffffc4] uppercase" 
              style={{ fontFamily: 'var(--font-karena)' }}>
            LOST IN <br /> FOCUS
          </h2>
        </div>
      </section>

      {/* RIGHT COLUMN: CONTENT */}
      <section className="w-full md:w-1/2 flex flex-col justify-center items-center px-8 text-center py-20">
        <div className="max-w-xl w-full flex flex-col items-center gap-y-8">
          <span className="text-4xl md:text-8xl font-bold uppercase tracking-tighter leading-none" 
                style={{ fontFamily: 'var(--font-karena)' }}>
            404
          </span>

          <div className="w-24 h-[2px] bg-black/20" />

          <p className="text-lg md:text-xl opacity-80 uppercase tracking-tight" 
             style={{ fontFamily: 'var(--font-bricolage)' }}>
            Oops! Page Not Found. <br />
            The page you are looking for doesn't exist.
          </p>

          <Link 
            href="/" 
            className="px-10 py-4 bg-black text-white uppercase tracking-widest text-sm hover:opacity-80 transition-all"
          >
            Back to Homepage
          </Link>
        </div>
      </section>
    </main>
  );
}