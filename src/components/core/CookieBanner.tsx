"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  const revealEase = "ease-[0.19,1,0.22,1]";
  const duration = "duration-[600ms]";

  useEffect(() => {
    const consent = localStorage.getItem("vm_cookie_consent");
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("vm_cookie_consent", "accepted");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:max-w-md z-100 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-off-white border border-ink-black/10 p-8 shadow-2xl rounded-sm">
        <div className="flex flex-col space-y-6">
          <div className="space-y-3">
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-ink-black/40">
              Cookie Policy
            </h4>
            <p className="text-[14px] leading-snug text-ink-black font-light ">
              "We use cookies to enhance your experience and analyze our traffic. 
              By clicking Accept, you consent to our use of cookies."
            </p>
            <Link href="/cookies" className="inline-block text-[11px] uppercase tracking-widest underline underline-offset-4 hover:text-red-600 transition-colors">
              Cookies Policy
            </Link>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            
            {/* ACCEPT BUTTON: Ink Black BG -> Red Hover */}
            <button
              onClick={acceptCookies}
              className="group relative flex-1 overflow-hidden border border-ink-black bg-ink-black px-6 py-3.5 text-[10px] uppercase tracking-[0.2em] text-off-white transition-all duration-500"
            >
              <span 
                className={cn(
                  "absolute inset-0 z-0 transition-all bg-red-500",
                  duration,
                  revealEase,
                  "[clip-path:inset(0_100%_0_0)] group-hover:[clip-path:inset(0_0%_0_0)]"
                )} 
              />
              <span className={cn("relative z-20 inline-block transition-all", duration, revealEase, "group-hover:translate-x-8 group-hover:opacity-0")}>
                Accept
              </span>
              <span className={cn("absolute inset-0 z-30 flex items-center justify-center gap-2 -translate-x-6 opacity-0 transition-all text-off-white", duration, revealEase, "group-hover:translate-x-0 group-hover:opacity-100")}>
                Accept <ArrowRight className="w-3 h-3" />
              </span>
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="group relative flex-1 overflow-hidden border border-ink-black/20 bg-white px-6 py-3.5 text-[10px] uppercase tracking-[0.2em] text-ink-black transition-all duration-500"
            >
              <span 
                className={cn(
                  "absolute inset-0 z-0 transition-all bg-ink-black/50",
                  duration,
                  revealEase,
                  "[clip-path:inset(0_100%_0_0)] group-hover:[clip-path:inset(0_0%_0_0)]"
                )} 
              />
              <span className={cn("relative z-20 inline-block transition-all", duration, revealEase, "group-hover:translate-x-8 group-hover:opacity-0")}>
                Decline
              </span>
              <span className={cn("absolute inset-0 z-30 flex items-center justify-center gap-2 -translate-x-6 opacity-0 transition-all text-off-white", duration, revealEase, "group-hover:translate-x-0 group-hover:opacity-100")}>
                Decline <ArrowRight className="w-3 h-3" />
              </span>
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;