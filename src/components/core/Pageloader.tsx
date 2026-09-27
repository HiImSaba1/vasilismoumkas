// components/core/PageLoader.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import SplitText from "gsap/dist/SplitText";
import { PRELOADER_SELECTION } from "@/app/(site)/data/Project-Photoset/preloader";
import { useInitialLoad } from "@/providers/InitialLoadContext";

gsap.registerPlugin(SplitText);

export default function PageLoader({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isFirstVisit, completeFirstVisit } = useInitialLoad();
  const [loaderImages, setLoaderImages] = useState<string[]>([]);
  const [isAnimating, setIsAnimating] = useState(true);

  const loaderRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const footerTextRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLParagraphElement>(null);
  const topBarRef = useRef<HTMLDivElement>(null);
  const bottomBarRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);

  const positions = [
    { pos: "top-[8%] left-[5%] w-[45vw] md:w-[12vw] lg:w-[14vw] aspect-[3/4]" },
    {
      pos: "top-[58%] lg:top-[50%] left-[5%] md:left-[7%] w-[30vw] md:w-[16vw] lg:w-[15vw] aspect-[4/5]",
    },
    {
      pos: "top-[12%] left-[30%] w-[45vw] md:w-[20vw] lg:w-[19vw] aspect-[4/5]",
      mobileHidden: true,
    },
    {
      pos: "top-[52%] right-[9%] md:right-[40%] w-[40vw] md:w-[14vw] lg:w-[15vw] aspect-[4/5]",
    },
    {
      pos: "top-[45%] right-[4%] w-[42vw] md:w-[18vw] lg:w-[17vw] aspect-[1/1]",
      mobileHidden: true,
    },
    {
      pos: "top-[15%] md:top-[12%] right-[5%] md:right-[15%] lg:right-[24%] w-[35vw] md:w-[13vw] aspect-[3/4]",
    },
  ];

  useEffect(() => {
    if (isFirstVisit) {
      const shuffled = [...PRELOADER_SELECTION].sort(() => 0.5 - Math.random());
      setLoaderImages(shuffled.slice(0, 6));
    }
  }, [isFirstVisit]);

  useEffect(() => {
    if (!isFirstVisit || loaderImages.length === 0 || !loaderRef.current)
      return;

    const tl = gsap.timeline({
      onComplete: () => {
        setIsAnimating(false);
        completeFirstVisit();
      },
    });

    // Setup
    gsap.set([topBarRef.current, bottomBarRef.current], { scaleX: 0 });
    const images = imageRefs.current.filter(
      (el): el is HTMLDivElement => el !== null,
    );
    gsap.set(images, { y: 300, opacity: 0 });
    const titleSplit = new SplitText(".inner-text", { type: "chars" });
    gsap.set(titleSplit.chars, { yPercent: 100, opacity: 0 });

    // Timeline
    tl.to(overlayRef.current, { opacity: 0, duration: 0.3, delay: 0.3 });
    tl.to(
      [topBarRef.current, bottomBarRef.current],
      {
        scaleX: 1,
        duration: 1.5,
        ease: "power4.inOut",
        transformOrigin: (i) => (i === 0 ? "right" : "left"),
      },
      ">",
    );

    tl.to(
      titleSplit.chars,
      {
        yPercent: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.02,
        ease: "power3.out",
      },
      "-=0.8",
    );

    tl.to(
      images,
      { y: 0, opacity: 1, duration: 1.8, stagger: 0.1, ease: "power4.out" },
      "-=1.2",
    );

    const counterObj = { value: 0 };
    tl.to(
      counterObj,
      {
        value: 100,
        duration: 3.5,
        ease: "none",
        onUpdate: () => {
          if (counterRef.current)
            counterRef.current.textContent = `${counterObj.value.toFixed(0)}%`;
        },
      },
      0.5,
    );

    tl.to(
      [
        images,
        ".pageloader-text",
        footerTextRef.current,
        topBarRef.current,
        bottomBarRef.current,
      ],
      {
        opacity: 0,
        y: -100,
        duration: 1,
        stagger: 0.1,
        ease: "power2.in",
      },
      3.8,
    ).to(
      loaderRef.current,
      { yPercent: -100, duration: 1, ease: "power4.inOut" },
      4.2,
    );

    return () => {
      tl.kill();
      titleSplit.revert();
    };
  }, [loaderImages, isFirstVisit, completeFirstVisit]);

  if (!isFirstVisit) return <>{children}</>;

  return (
    <>
      <div
        ref={loaderRef}
        className="fixed inset-0 z-99999 bg-off-white overflow-hidden"
      >
        <div
          ref={overlayRef}
          className="absolute inset-0 bg-off-white z-100"
        />
        <div
          ref={topBarRef}
          className="fixed top-8 left-8 right-8 h-px bg-ink-black z-20"
        />
        <div
          ref={bottomBarRef}
          className="fixed bottom-24 left-8 right-8 h-px bg-ink-black z-20"
        />

        <div className="absolute inset-0 w-full h-full pointer-events-none">
          {loaderImages.map((url, i) => (
            <div
              key={i}
              ref={(el) => {
                imageRefs.current[i] = el;
              }}
              className={`absolute overflow-hidden ${positions[i].pos} ${positions[i].mobileHidden ? "hidden md:block" : "block"}`}
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>

        <h1
          ref={textRef}
          className="pageloader-text relative z-10 text-center flex flex-col items-center justify-center h-full"
        >
          <span className="inner-text block text-5xl md:text-8xl font-light tracking-tighter">
            VASILIS
          </span>
          <span className="inner-text block text-5xl md:text-8xl font-light tracking-tighter">
            MOUMKAS
          </span>
        </h1>

        <div className="absolute bottom-12 w-full px-8 flex justify-between items-end text-ink-black uppercase text-sm ">
          <div ref={footerTextRef} className="opacity-80">
            ©2026 — Professional Wedding Photographer
          </div>
          <div ref={counterRef} className="text-2xl md:text-4xl font-light">
            0%
          </div>
        </div>
      </div>
      <div style={{ opacity: isAnimating ? 0 : 1 }}>{children}</div>
    </>
  );
}
