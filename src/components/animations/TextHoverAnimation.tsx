import { useEffect, RefObject } from 'react';
import { gsap } from 'gsap';

/**
 * Custom hook to apply GSAP text-reveal hover animation.
 * Relies on the component setting the initial state (y: 0% and y: 100%).
 * @param linkRef A React RefObject pointing to the anchor tag.
 */
const useTextHoverAnimation = (
  linkRef: RefObject<HTMLAnchorElement>,
) => {
  useEffect(() => {
    const link = linkRef.current;
    if (!link) return;

    // Use querySelectorAll to find all children with the required classes within the link
    const staticTextElements = link.querySelectorAll('.static-text');
    const animatedTextElements = link.querySelectorAll('.animated-text');
    
    if (staticTextElements.length === 0 || animatedTextElements.length === 0) {
      // console.warn('Missing required classes for GSAP text hover animation: static-text or animated-text. Skipping animation.');
      return;
    }

    // Function for hover in
    const handleMouseEnter = () => {
      gsap.timeline({ defaults: { duration: 0.5, ease: 'power3.out' } })
        .to(staticTextElements, { y: '-100%' }, 0) // Static text moves up (out)
        .to(animatedTextElements, { y: '0%' }, 0);  // Animated text moves up (in)
    };

    // Function for hover out
    const handleMouseLeave = () => {
      gsap.timeline({ defaults: { duration: 0.5, ease: 'power3.out' } })
        .to(staticTextElements, { y: '0%' }, 0)    // Static text moves down (in)
        .to(animatedTextElements, { y: '100%' }, 0); // Animated text moves down (out)
    };

    link.addEventListener('mouseenter', handleMouseEnter);
    link.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      link.removeEventListener('mouseenter', handleMouseEnter);
      link.removeEventListener('mouseleave', handleMouseLeave);
      // Clean up any active tweens
      gsap.killTweensOf([...staticTextElements, ...animatedTextElements]);
    };
  }, [linkRef]);
};

export default useTextHoverAnimation;