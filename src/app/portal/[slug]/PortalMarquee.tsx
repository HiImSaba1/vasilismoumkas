import SeoImage from "@/components/ui/SeoImage";
import type {PhotographyEventType} from "@/app/(site)/data/event-image-pools";
import {baptismProposalImageSequence,weddingProposalSmallImages,type ProposalImage} from "@/app/(site)/data/proposal-image-sequence";
import {portalSlugPath} from "@/lib/portal-url";
import styles from "./portal.module.css";

export function PortalMarquee({language,eventType,identity}:{language:"gr"|"en";eventType:PhotographyEventType;identity:string}){
  const images:ProposalImage[]=eventType==="wedding"?weddingProposalSmallImages:baptismProposalImageSequence;
  const baptism=eventType==="baptism";
  const pdfBase=`/api/portal/${portalSlugPath(identity)}/documents`;
  const labels=language==="gr"?{questionnaire:"Ερωτηματολογιο",contract:"Συμφωνητικο",invoice:"Τιμολογιο",open:"Προβολη",download:"Ληψη"}:{questionnaire:"Questionnaire",contract:"Agreement",invoice:"Invoice",open:"Open",download:"Download"};
  return <>
    <header className="overflow-hidden border-b border-ink-black/20 bg-soft-white">
      <div className="grid min-h-[25rem] md:grid-cols-[40%_60%]">
        <div className="flex flex-col justify-between p-6 sm:p-10 lg:p-14">
          <p className="text-[10px] uppercase tracking-[.2em]">Vasilis Moumkas · Private client portal</p>
          <div><span className="block max-w-xl text-2xl font-light uppercase leading-[1.05] tracking-[-.03em] md:text-3xl lg:text-5xl">{language==="gr"?"Η οργανωση της ημερας σας, σε ενα μερος":baptism?"Your baptism journey, thoughtfully organized":"Your wedding journey, thoughtfully organized"}</span><p className="mt-6 max-w-md text-sm leading-relaxed text-ink-black/60">{language==="gr"?"Εδω θα βρειτε το ερωτηματολογιο, το συμφωνητικο και το τιμολογιο σας. Καθε λεπτομερεια παραμενει συγκεντρωμενη, ξεκαθαρη και παντα προσβασιμη.":"Your questionnaire, agreement, and invoice live here together, keeping every important detail clear, calm, and easy to revisit."}</p></div>
        </div>
        <div className="relative min-h-64 overflow-hidden md:min-h-full"><div className={`${styles.track} absolute inset-y-0 left-0 flex w-max gap-2`}>{[...images,...images].map((image,index)=><div key={`${image.src}-${index}`} className="relative h-full w-60 shrink-0 bg-[#f7f3e9] sm:w-80 lg:w-[28rem]"><SeoImage src={image.src} alt={image.alt} fill sizes="(max-width: 640px) 240px, (max-width: 1024px) 320px, 448px" className={eventType==="wedding"?"object-contain":"object-cover"} loading={index<3?"eager":"lazy"} fetchPriority={index<3?"high":"auto"}/></div>)}</div></div>
      </div>
    </header>
    <nav aria-label={language==="gr"?"PDF εγγραφων πελατη":"Client document PDFs"} className="grid border-b border-ink-black/20 bg-white sm:grid-cols-3">{(["questionnaire","contract","invoice"] as const).map(type=><div key={type} className="flex items-center justify-between gap-3 border-b border-ink-black/10 px-4 py-3 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0"><span className="text-xs uppercase">{labels[type]}</span><span className="flex gap-2"><a href={`${pdfBase}/${type}/pdf`} target="_blank" rel="noreferrer" className="rounded-sm border border-ink-black/20 px-3 py-2 text-xs uppercase transition-colors hover:bg-ink-black hover:text-white">{labels.open}</a><a href={`${pdfBase}/${type}/pdf?download=1`} className="rounded-sm bg-ink-black px-3 py-2 text-xs uppercase text-white transition-colors hover:bg-soft-yellow hover:text-ink-black">{labels.download}</a></span></div>)}</nav>
  </>;
}
