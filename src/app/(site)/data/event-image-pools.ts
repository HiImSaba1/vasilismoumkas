import { ProjectsData } from "./ProjectsData";

export type PhotographyEventType = "wedding" | "baptism";

const fallback: Record<PhotographyEventType, string[]> = {
  wedding: [
    "/uploads/portfolio/suzanna-alexis/f7817736-a4e2-46a9-8f97-f98274e49d12.webp",
    "/uploads/portfolio/natasa-stamatis/7099163a-198e-4cf5-ab4c-799e6ae5757a.webp",
  ],
  baptism: [
    "/vm_img/Offer/vasilis_moumkas_offer_baptism_1.webp",
    "/vm_img/Offer/vasilis_moumkas_offer_baptism_2.webp",
    "/vm_img/Offer/vasilis_moumkas_offer_baptism_3.webp",
    "/vm_img/Offer/vasilis_moumkas_offer_baptism_4.webp",
    "/vm_img/Offer/vasilis_moumkas_offer_baptism_5.webp",
    "/vm_img/Offer/vasilis_moumkas_offer_baptism_6.webp",
    "/vm_img/Offer/vasilis_moumkas_offer_baptism_7.webp",
  ],
};

export function eventImagePool(eventType: PhotographyEventType) {
  const category = eventType === "baptism" ? "baptism" : "wedding";
  const projectImages = ProjectsData
    .filter((project) => project.category.trim().toLocaleLowerCase() === category)
    .flatMap((project) => [project.thumbnail, ...project.photoset.map((photo) => photo.src)]);
  return [...new Set([...projectImages, ...fallback[eventType]])].filter(Boolean);
}

export function stableImageOffset(value: string, poolLength: number) {
  if (!poolLength) return 0;
  let hash = 0;
  for (const character of value) hash = (Math.imul(hash, 31) + character.codePointAt(0)!) | 0;
  return Math.abs(hash) % poolLength;
}
