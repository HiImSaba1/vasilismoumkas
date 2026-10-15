import SeoImage from "@/components/ui/SeoImage";
import { baptismProposalSmallImages } from "@/app/(site)/data/proposal-image-sequence";
import type {OfferWebsiteContent} from "@/lib/website-settings";

export function BaptismOfferGallery({lang,content}:{lang:"en"|"gr";content:OfferWebsiteContent["gallery"]}){
  return <section className="bg-off-white px-4 py-14 lg:px-8 lg:py-20">
    <div className="mb-8 border-t border-ink-black/30 pt-6">
      <p className="text-[10px] uppercase tracking-[.18em] text-ink-black/50">{content.eyebrow[lang]}</p>
      <h2 className="mt-2 text-3xl font-light uppercase md:text-5xl">{content.title[lang]}</h2>
    </div>
    <div className="grid gap-3 sm:grid-cols-3">{(content.images.length?content.images:baptismProposalSmallImages.slice(0,3)).map((image,index)=><figure key={image.src} className="relative aspect-[3/4] overflow-hidden bg-ink-black/5"><SeoImage src={image.src} alt={image.alt} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" priority={index===0}/></figure>)}</div>
  </section>;
}
