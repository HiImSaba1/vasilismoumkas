import {InlineContent} from "@/components/ui/InlineContent";
import AboutFaq from "./AboutPage/AboutFaqSection";
import type { DestinationContent } from "@/lib/destinations";
import type { Project } from "@/app/(site)/data/ProjectsData";
import SeoImage from "@/components/ui/SeoImage";
import ProjectCard from "@/components/sections/Projects/ProjectCard";
import CTAButton from "@/components/ui/CTAButton";
import RevealAnimation from "@/components/animations/RevealAnimation";
export function DestinationPage({ content, projects }: { content: DestinationContent; projects: Project[] }) {
  return <main className="bg-off-white px-5 pb-20 pt-32 md:px-[5%]">
    <header className="mx-auto max-w-5xl text-center"><h1>{content.title}</h1><p className="my-8 whitespace-pre-line text-base md:text-xl"><InlineContent text={content.intro}/></p></header>
    {content.image && <div className="relative my-12 aspect-[16/9] overflow-hidden"><SeoImage src={content.image} alt={content.imageAlt} fill sizes="90vw" className="object-cover"/></div>}
    {!!content.images.length&&<div className="grid gap-6 md:grid-cols-2">{content.images.map((image,index)=><figure key={index}><div className="relative aspect-[4/3]"><SeoImage src={image.src} alt={image.alt} fill sizes="45vw" className="object-cover"/></div>{image.caption&&<figcaption className="mt-2 text-xs">{image.caption}</figcaption>}</figure>)}</div>}
    {content.sections.map((section, index) => <section key={index} className="mx-auto my-16 max-w-4xl"><RevealAnimation><h2>{section.heading}</h2></RevealAnimation><p className="whitespace-pre-line text-base md:text-xl"><InlineContent text={section.text}/></p></section>)}
    {!!projects.length && <section className="my-16"><h2 className="text-center">Real wedding stories</h2><div className="grid gap-8 md:grid-cols-2">{projects.map((project,index) => <ProjectCard key={project.slug} project={project} index={index}/>)}</div></section>}
    {content.faq.some(item=>!item.hidden)&&<AboutFaq items={content.faq.filter(item=>!item.hidden)} introduction="" heading="Common Questions"/>}
    <div className="flex justify-center"><CTAButton href={content.buttonHref}>{content.buttonLabel}</CTAButton></div>
  </main>;
}
