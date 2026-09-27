import SeoImage from "@/components/ui/SeoImage";
import { baptismProposalSmallImages } from "@/app/(site)/data/proposal-image-sequence";

export function BaptismOfferGallery({lang}:{lang:"en"|"gr"}){
  return <section className="bg-off-white px-4 py-14 lg:px-8 lg:py-20">
    <div className="mb-8 border-t border-ink-black/30 pt-6">
      <p className="text-[10px] uppercase tracking-[.18em] text-ink-black/50">{lang==="gr"?"Λεπτομερειες της ημερας":"Details of the day"}</p>
      <h2 className="mt-2 text-3xl font-light uppercase md:text-5xl">{lang==="gr"?"Μικρες στιγμες, μεγαλη ιστορια":"Small moments, one meaningful story"}</h2>
    </div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{baptismProposalSmallImages.map((image,index)=><figure key={image.src} className="relative aspect-[3/4] overflow-hidden bg-ink-black/5"><SeoImage src={image.src} alt={image.alt} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover" priority={index===0}/></figure>)}</div>
  </section>;
}
