"use client";

import React, { useRef, useActionState, useEffect, useState } from "react";
import SeoImage from "@/components/ui/SeoImage";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { loginAction } from "./actions";

if (typeof window !== "undefined") {
  gsap.registerPlugin(SplitText);
}

export default function AdminLoginPage() {
  const container = useRef(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const bgImageRef = useRef<HTMLDivElement>(null);

  const [state, formAction, isPending] = useActionState(loginAction, null);

  useGSAP(
    () => {
      // Initial States
      gsap.set(bgImageRef.current, { clipPath: "inset(100% 0% 0% 0%)" });

      const splitTitle = new SplitText(heroTitleRef.current, {
        type: "chars,words",
      });
      const splitPara = new SplitText(paragraphRef.current, { type: "words" });

      // Wrap words for overflow hidden effect
      [splitTitle.words, splitPara.words].forEach((words) => {
        words.forEach((word) => {
          const wrapper = document.createElement("div");
          wrapper.style.cssText =
            "display:inline-block; overflow:hidden; vertical-align:top;";
          word.parentNode?.insertBefore(wrapper, word);
          wrapper.appendChild(word);
        });
      });

      gsap.set([splitTitle.chars, splitPara.words], { yPercent: 105 });

      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

      tl.to(bgImageRef.current, {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 1.8,
        ease: "power4.inOut",
      })
        .to(
          splitTitle.chars,
          {
            yPercent: 0,
            duration: 1,
            stagger: 0.02,
            ease: "expo.out",
          },
          "-=0.8",
        )
        .to(
          splitPara.words,
          {
            yPercent: 0,
            duration: 0.8,
            stagger: 0.01,
            ease: "power2.out",
          },
          "-=0.6",
        )
        .from(
          ".form-card",
          {
            y: 40,
            opacity: 0,
            duration: 1.2,
            ease: "power3.out",
          },
          "-=0.8",
        );

      return () => {
        splitTitle.revert();
        splitPara.revert();
      };
    },
    { scope: container },
  );

  return (
    <main
      ref={container}
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden"
    >
      {/* BACKGROUND IMAGE WITH OVERLAY */}
      <div ref={bgImageRef} className="absolute inset-0 z-0">
        <SeoImage
          src="/vm_img/Projects/Amadita_Vasilis/vasilis_moumkas_amadita_vasilis_17.webp"
          description="admin-login-background"
          location="greece"
          fill
          priority
          className="object-cover scale-105"
        />
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 w-full max-w-[2000px] px-8 flex flex-col md:flex-row items-center justify-between gap-12">
        {/* LEFT COLUMN: TEXT */}
        <div className="w-full md:w-1/2 text-white space-y-6">
          <span
            ref={heroTitleRef}
            className="text-[12vw] md:text-[7vw] leading-[0.85] uppercase tracking-tighter"
            style={{ fontFamily: "var(--font-karena)" }}
          >
            Welcome
            <br />
            Back
          </span>
          <p
            ref={paragraphRef}
            className="max-w-sm md:text-lg opacity-80 leading-none font-light pt-6"
          >
            Sign back in to your account to access your curated wedding offers
            and embody the art of being human.
          </p>
        </div>

        {/* RIGHT COLUMN: FORM CARD */}
        <div className="form-card w-full md:w-[650px] bg-[#f2e8da] p-10 shadow-2xl">
          <h2 className="text-2xl font-bold uppercase tracking-tighter mb-10 text-ink-black">
            Your Account
          </h2>

          <form action={formAction} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[14px] uppercase  tracking-widest text-ink-black/60">
                Admin Name
              </label>
              <input
                type="text"
                name="adminName"
                required
                placeholder="Your Name"
                className="w-full bg-transparent border-b text-2xl border-ink-black/20 py-2 outline-none focus:border-black text-ink-black transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[14px] uppercase tracking-widest text-ink-black/60">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                className="w-full bg-transparent border-b border-ink-black/20 py-2 outline-none text-2xl focus:border-ink-black text-ink-black transition-colors"
              />
            </div>

            {state?.error && (
              <p className="text-red-600 text-[10px] uppercase font-bold tracking-tight">
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-fit px-8 py-3 bg-ink-black text-white text-[16px] font-bold uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50"
            >
              {isPending ? "Connecting..." : "Log In"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
