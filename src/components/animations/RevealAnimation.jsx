"use client";
/* eslint-disable react-hooks/refs -- the component intentionally forwards its animation scope ref through cloneElement */
import React, { useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(SplitText, ScrollTrigger);

const RevealAnimation = ({ children, animateOnScroll = true, delay = 0, once = false }) => {
  const containerRef = useRef(null);
  const elementRef = useRef([]);
  const splitRef = useRef([]);
  const lines = useRef([]);

  useGSAP(
    () => {
      // Early exit if ref is null
      if (!containerRef.current) return;

      document.fonts.ready.then(() => {
        // CRITICAL: Check again inside the promise. 
        // Navigation might have happened while waiting for fonts.
        if (!containerRef.current) return;

        splitRef.current = [];
        elementRef.current = [];
        lines.current = [];
        let elements = [];

        if (containerRef.current.hasAttribute("data-copy-wrapper")) {
          elements = Array.from(containerRef.current.children);
        } else {
          elements = [containerRef.current];
        }

        elements.forEach((element) => {
          if (!element) return; // Guard for children
          elementRef.current.push(element);
          
          const split = SplitText.create(element, {
            type: "lines",
            mask: "lines",
            linesClass: "line++",
          });
          
          splitRef.current.push(split);
          
          const computedStyle = window.getComputedStyle(element);
          const textIndent = computedStyle.textIndent;
          
          if (textIndent && textIndent !== "0px") {
            if (split.lines.length > 0) {
              split.lines[0].style.paddingLeft = textIndent;
            }
            element.style.textIndent = "0";
          }
          lines.current.push(...split.lines);
        });

        gsap.set(lines.current, { y: "100%" });

        const animationProps = {
          y: "0%",
          duration: 1.7,
          stagger: 0.3,
          ease: "power4.out",
          delay: delay,
        };

        if (animateOnScroll) {
          gsap.to(lines.current, {
            ...animationProps,
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 85%",
              end: "top 15%",
              scrub: once ? false : true,
              toggleActions: once ? "play none none none" : "play none none reverse",
              once,
            },
          });
        } else {
          gsap.to(lines.current, animationProps);
        }
      });

      return () => {
        // Ensure split objects exist before reverting
        if (splitRef.current) {
          splitRef.current.forEach((split) => {
            if (split && typeof split.revert === "function") {
              split.revert();
            }
          });
        }
      };
    },
    {
      scope: containerRef,
      dependencies: [animateOnScroll, delay, once],
    }
  );

  if (React.Children.count(children) === 1) {
    return React.cloneElement(children, {
      ref: containerRef,
      style: { ...children.props.style, position: children.props.style?.position || "relative" },
    });
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', overflow: 'hidden' }} data-copy-wrapper="true">
      {children}
    </div>
  );
};

export default RevealAnimation;
