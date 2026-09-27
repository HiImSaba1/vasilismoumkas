// File: src/lib/gsap.ts

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Registers GSAP plugins globally.
 * GSAP automatically prevents re-registration, so we call this safely once.
 */
export const registerGSAPPlugins = () => {
  // We can remove the check 'if (!gsap.config().plugins.find(...))' 
  // as GSAP is designed to handle multiple calls to registerPlugin() safely.
  gsap.registerPlugin(ScrollTrigger);
  
  // Add other plugins here (e.g., SplitText, Draggable) as needed.
};