import { z } from "zod";
import { publicCopy } from "@/app/(site)/data/ApprovedPublicCopy";
import { faqAboutData } from "@/app/(site)/data/FaqAboutData";
import { faqData } from "@/app/(site)/data/FaqData";
import { baseServices } from "@/app/(site)/data/ServicesData";

const text = z.string().trim().min(1).max(6000);
export const internalLink = z.string().trim().max(700).regex(/^\/(?!\/)[^\\\s]*$/, "Choose an internal page link.").refine(value => !/[%\u0000-\u001f]/.test(value), "Use a plain internal path.");
const asset = z.string().trim().max(1000).refine(value => value === "" || /^\/(?!\/)[^\\\s]*$/.test(value), "Choose an image from the library.");
const item = z.object({ question: text, answer: text, date: text, hidden: z.boolean().default(false) });
export const aboutVisualDefaults = {
  heroVideo: "/videos/about-vm-video-2.mp4", heroTitle: "Fine\nArtist", heroHoverTitle: "Lover\nof Life",
  heroLeft: "Capturing timeless moments as a destination wedding photographer, focusing on the raw emotions and cinematic beauty.",
  heroRight: "From intimate elopements to grand celebrations, my editorial approach ensures every frame feels like a piece of art.",
  portrait: "/vm_img/About/vasilis_moumkas_profile_image_new.webp", portraitAlt: "Vasilis Moumkas wedding photographer",
  cameraPortrait: "/vm_img/About/vasilis_moumkas_about_profile_camera.jpg", cameraAlt: "Vasilis Moumkas at work",
  biographyImage: "/vm_img/About/vasilis_moumkas_about_big_image_17.webp", biographyAlt: "Vasilis Moumkas wedding photography",
  portraitCaption:"",cameraCaption:"",biographyCaption:"",
  signature: "Vasilis Moumkas", signatureRole: "Lead Photographer & Visionary",
  quote: "I photograph weddings with a calm editorial eye, drawn to real moments, emotion and timeless beauty. Following the light and the feeling of the day documenting life, love and capturing the soul of the world’s most breathtaking landscapes.",
  biographyHeading: "Documenting Life,\nLove & Light", rootsHeading: "Greek Roots", sharedHeading: "Your Shared Truth",
  sharedText: "There will come a time when you will seek words outside words, for moments outside the thread of thoughts, for images that cling to the beating of your heart. That is where you will find your shared truth, your deposited love raw, genuine, new again.",
  tags: ["Luxury", "Editorial", "Greece", "Italy", "Destination", "Timeless", "Authentic"],
  closing: "MEANINGFUL. TIMELESS. DEEPLY CONNECTED.", closingHeading: "A Quiet Visual\nLanguage",
};
const aboutVisualSchema = z.object({
  heroVideo: asset, heroTitle: text, heroHoverTitle: text, heroLeft: text, heroRight: text,
  portrait: asset, portraitAlt: text, cameraPortrait: asset, cameraAlt: text, biographyImage: asset, biographyAlt: text,
  portraitCaption:z.string().max(500),cameraCaption:z.string().max(500),biographyCaption:z.string().max(500),
  signature: text, signatureRole: text, quote: text, biographyHeading: text, rootsHeading: text, sharedHeading: text,
  sharedText: text, tags: z.array(text).min(1).max(15), closing: text, closingHeading: text,
});
export const servicesVisualDefaults = {
  heroImage: "", heroAlt: "Editorial wedding photography", heroLabel: "(Editorial Wedding Photography)",
  heroHeading: "Bridging the gap between elegance and power of photography.",
  leftImage: "", leftAlt:"Editorial wedding details portrait",leftCaption:"", partnerImage: "", partnerAlt:"Vasilis Moumkas editorial detail",partnerCaption:"", rightImage: "", rightAlt:"Destination wedding photography",rightCaption:"",heroCaption:"", video: "/videos/vm_services_video_main.mp4",
  quote: '"Through disciplined creative direction and a focus on cinematic storytelling, I translate our artistic values into an authentic legacy that feels as vivid as the day itself."',
};
const servicesVisualSchema = z.object({ heroImage: asset, heroAlt: text, heroLabel: text, heroHeading: text, leftImage: asset, leftAlt:text.default("Editorial wedding details portrait"),leftCaption:z.string().max(500).default(""),partnerImage: asset,partnerAlt:text.default("Vasilis Moumkas editorial detail"),partnerCaption:z.string().max(500).default(""),rightImage: asset,rightAlt:text.default("Destination wedding photography"),rightCaption:z.string().max(500).default(""),heroCaption:z.string().max(500).default(""),video: asset, quote: text });
export const publicPageSchemas = {
  about: z.object({ title: text, intro: z.array(text).length(2), faqIntro: text, faq: z.array(item).max(40), faqHeading: text.default("Common Questions"), visuals: aboutVisualSchema.default(aboutVisualDefaults), galleryImages: z.array(z.object({src:asset,alt:text,caption:z.string().max(500).default("")})).max(80).refine(items=>items.length===0||new Set(items.map(item=>item.src).filter(Boolean)).size>=4,"Choose at least four distinct gallery photographs.").default([]), galleryQuotes: z.array(text).max(30).default([]) }),
  services: z.object({ title: text, intro: text, items: z.array(z.object({ title: text, description: text, image_main: asset.default(""), image_small: asset.default(""), imageAlt: z.string().max(300).default(""), detailAlt: z.string().max(300).default(""), caption: z.string().max(500).default(""), tags: z.array(text).max(10).default([]) })).length(3), journey: z.array(item).max(40), journeyHeading: text.default("Photography\nProcess & Journey"), buttonLabel: text.default("Inquire Now"), buttonHref: internalLink.default("/contact"), visuals: servicesVisualSchema.default(servicesVisualDefaults) }),
  contact: z.object({ title: text, intro: text, message: text, heading: text.default("Let's Make It Happen"), label: text.default("(CONTACT)"), video: asset.default("/videos/vasilis_moumkas_homepage_section_lousille_video.mp4"), image: asset.default(""), imageAlt: text.default("Contact Vasilis Moumkas"), caption:z.string().max(500).default(""), buttonLabel: text.default("SEND MESSAGE") }),
};
export type PublicPageKey = keyof typeof publicPageSchemas;
export type PublicPageContent = { [K in PublicPageKey]: z.infer<(typeof publicPageSchemas)[K]> };
export const defaultPublicPageContent: PublicPageContent = {
  about: publicPageSchemas.about.parse({ title: publicCopy.aboutTitle, intro: [...publicCopy.aboutIntro], faqIntro: publicCopy.aboutFaqIntro, faq: faqAboutData }),
  services: publicPageSchemas.services.parse({ title: "Wedding Photography Services in Greece & Italy", intro: publicCopy.servicesIntro, items: baseServices.map(({ title, description, tags }) => ({ title, description, tags })), journey: faqData }),
  contact: publicPageSchemas.contact.parse({ title: "Let’s Talk About Your Wedding", intro: publicCopy.contactIntro, message: publicCopy.contactMessage }),
};
