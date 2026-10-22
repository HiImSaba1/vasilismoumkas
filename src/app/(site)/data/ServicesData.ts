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
    title: "Wedding Day Photography",
    description: "From getting ready to the celebration, coverage is planned around your wedding schedule. I document the day as it unfolds, with time for couple portraits, family photographs and the details you have chosen.",
    href: "/services/luxury-weddings",
    tags: [
      "WEDDING DAY PHOTOGRAPHY"
    ]
  },
  {
    title: "Destination Weddings & Additional Events",
    description: "For weddings in Greece and Italy, we agree on travel and photography arrangements in advance. Welcome celebrations and additional days can be discussed as part of your personalised proposal.",
    href: "/services/destination",
    tags: [
      "DESTINATION WEDDINGS"
    ]
  },
  {
    title: "Couple Portraits & After-Wedding Sessions",
    description: "A separate couple session gives us time to explore a location and create portraits beyond the wedding-day schedule. Timing and coverage are agreed as part of your personalised proposal.",
    href: "/services/editorial",
    tags: [
      "COUPLE PORTRAITS"
    ]
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