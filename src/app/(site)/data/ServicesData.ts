import { PORTRAIT_PHOTO_POOL } from "@/app/(site)/data/Project-Photoset/photoPool";
import { HOMEPAGE_BLACK_FOOTER } from "./Pages-Photoset/Homepage";
export type Service = {
  title: string;
  description: string;
  image_main: string;
  image_small: string;
  href: string;
  tags: string[];
};

export type HomeService = {
  title: string;
  slug: string;
  projectSlug: string; // Added for project page navigation
  description: string;
  keywords: string[];
  image: string; 
  categoryHeroImage: string; 
};

export const homeServices: HomeService[] = [
  {
    title: "Wedding",
    slug: "wedding",
    projectSlug: "nikolina-george", // Example: /portfolio/project/nikolina-george
    description:
      "Premier editorial wedding photography for couples seeking a high-fashion, cinematic aesthetic. We specialize in luxury wedding storytelling, blending fine-art direction with sophisticated visual narratives across Greece, Mykonos, Santorini, Naxos and Europe.",
    keywords: [
      "Luxury Wedding Photographer Greece",
      "Greek Islands Wedding Photography",
      "Mykonos Wedding Photographer",
      "Santorini Wedding Photography",
      "Destination Wedding Greece"
    ],
    image: "/vm_img/Projects/Nikolina_George/vasilis_moumkas_nikolina_george_2.webp",
    categoryHeroImage: "/vm_img/Projects/Nikolina_George/vasilis_moumkas_nikolina_george_1.webp",
  },
  {
    title: "Editorial",
    slug: "editorial",
    projectSlug: "claire-thanos", // Matches your requested example
    description:
      "High-end fashion and lifestyle portraiture crafted with cinematic lighting and refined artistic direction. Our editorial work blends luxury aesthetics with modern storytelling for brands, designers and individuals across Greece and the Greek islands.",
    keywords: [
      "Editorial Photography Greece",
      "Fashion Photographer Greece",
      "Lifestyle Editorial Portraits",
      "Commercial Fashion Photography",
      "Artistic Direction"
    ],
    image: "/uploads/portfolio/suzanna-alexis/f3f5ea39-ed37-45e8-8779-33647c7edfad.webp",
    categoryHeroImage: "/uploads/portfolio/suzanna-alexis/f3f5ea39-ed37-45e8-8779-33647c7edfad.webp",
  },
  {
    title: "Engagement",
    slug: "engagement",
    projectSlug: "olga-alex", // Example: /portfolio/project/olga-alex
    description:
      "Refined engagement photography capturing the quiet anticipation, intimacy and emotion of your story. Crafted with an editorial eye across Greece, Mykonos, Naxos, Santorini and the Greek islands.",
    keywords: [
      "Engagement Photographer Greece",
      "Greek Islands Engagement",
      "Mykonos Engagement Photography",
      "Santorini Engagement Photos",
      "Pre-Wedding Photography"
    ],
    image: "/vm_img/Projects/Olga_Alex/vasilis_moumkas_olga_alex_20.webp",
    categoryHeroImage: "/vm_img/Projects/Kymara_Pantelis/vasilis_moumkas_kymara_pantelis_3.webp",
  }
];

const baseServices = [
  {
    title: "Luxury Wedding Experience",
    description: "A BESPOKE PHOTOGRAPHY SERVICE TAILORED FOR HIGH-END CELEBRATIONS. WE FOCUS ON THE GRANDEUR, THE LUXE DETAILS, AND THE UNCOMPROMISING STANDARDS OF DISCERNING COUPLES.",
    href: "/services/luxury-weddings",
    tags: ["ULTRA-LUXE EVENTS", "WHITE-GLOVE SERVICE", "DETAIL ARCHIVING", "EXCLUSIVE ESTATES"]
  },
  {
    title: "Editorial Wedding Photography",
    description: "WE CURATE EVERY FRAME WITH A FASHION-FORWARD LENS, ENSURING YOUR CELEBRATION IS CAPTURED WITH THE SOPHISTICATION AND COMPOSITION OF A HIGH-END VOGUE EDITORIAL.",
    href: "/services/editorial",
    tags: ["FASHION AESTHETIC", "ART DIRECTION", "LIGHTING DESIGN", "EDITORIAL STYLING"]
  },
  {
    title: "Global Destination Weddings",
    description: "FROM THE SUN-DRENCHED AMALFI COAST TO HISTORIC CHATEAUS IN PROVENCE, WE SPECIALIZE IN THE COMPLEX LOGISTICS AND STUNNING VISUALS OF LUXURY TRAVEL WEDDINGS.",
    href: "/services/destination",
    tags: ["TRAVEL LOGISTICS", "MULTI-DAY COVERAGE", "SCOUTING", "ELOPEMENTS"]
  },
  {
    title: "Candid Photojournalism",
    description: "CAPTURING THE SOUL OF THE DAY THROUGH AN UNOBTRUSIVE LENS. WE DOCUMENT THE RAW EMOTIONS, THE UNSCRIPTED TEARS, AND THE QUIET MOMENTS THAT OFTEN GO UNNOTICED.",
    href: "/services/photojournalism",
    tags: ["DOCUMENTARY STYLE", "RAW EMOTION", "UNSCRIPTED MOMENTS", "STORYTELLING"]
  },
  {
    title: "Fine Art Imagery",
    description: "WHERE PHOTOGRAPHY MEETS CLASSICAL ART. UTILIZING SOFT LIGHT AND THOUGHTFUL COMPOSITION TO CREATE TIMELESS MASTERPIECES THAT FEEL LIKE A GALLERY EXHIBITION.",
    href: "/services/fine-art",
    tags: ["MUSEUM QUALITY", "SOFT LIGHTING", "CLASSICAL COMPOSITION", "TIMELESS ART"]
  }
];

export const getDynamicServices = (): Service[] => {
  const portraitPool = [...PORTRAIT_PHOTO_POOL].sort(() => Math.random() - 0.5);
  const horizontalPool = [...HOMEPAGE_BLACK_FOOTER].sort(() => Math.random() - 0.5);

  return baseServices.map((service, i) => ({
    ...service,
    image_main: portraitPool[i] || PORTRAIT_PHOTO_POOL[0],
    image_small: horizontalPool[i] || HOMEPAGE_BLACK_FOOTER[0],
  }));
};

export const services = getDynamicServices();