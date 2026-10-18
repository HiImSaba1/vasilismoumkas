import type {ReactNode} from "react";
import Link from "next/link";
import {AdminPageHeader} from "@/components/admin/AdminPageHeader";
import {getHomepageSettings} from "@/lib/homepage-settings";
import {listWebsiteImages} from "@/lib/website-media";
import {WebsiteImageSelect} from "@/components/admin/WebsiteImageSelect";
import {saveHomepageSettingsAction,uploadHomepageMediaAction} from "./actions";

const input="mt-2 w-full border border-ink-black/20 bg-white px-4 py-3 text-sm normal-case";
const label="text-[11px] uppercase tracking-[0.12em] text-ink-black/65";

const Panel=({title,copy,children}:{title:string;copy:string;children:ReactNode})=><details className="border border-ink-black/15 bg-white" open><summary className="cursor-pointer px-5 py-4"><span className="text-xl uppercase">{title}</span><span className="ml-3 text-sm normal-case text-ink-black/50">{copy}</span></summary><div className="grid gap-4 border-t border-ink-black/10 p-5 md:grid-cols-2">{children}</div></details>;
const Field=({name,title,value,area=false,wide=false}:{name:string;title:string;value:string;area?:boolean;wide?:boolean})=><label className={`${label} ${wide?"md:col-span-2":""}`}>{title}{area?<textarea name={name} defaultValue={value} rows={4} className={input}/>:<input name={name} defaultValue={value} className={input}/>}</label>;

const cardLabels=["Left first story","Right second story","Left third story"];
const projectLabels=["Left project card","Staggered right project card"];

export default async function Page({searchParams}:{searchParams:Promise<{saved?:string;uploaded?:string;error?:string}>}){
  const[settings,query,images]=await Promise.all([getHomepageSettings(),searchParams,listWebsiteImages()]);

  return <main className="px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
    <AdminPageHeader eyebrow="Website content" title="Homepage editor" description="Edit the exact content used by the current homepage sections. Layout, card positions and animations remain protected." action={<Link href="/" target="_blank" className="border border-ink-black px-4 py-3 text-[11px] uppercase">Preview homepage ↗</Link>}/>
    {query.saved&&<p className="mt-5 border-l-4 border-green-600 bg-green-50 px-4 py-3 text-sm text-green-900">Homepage settings saved and public cache refreshed.</p>}
    {query.uploaded&&<p className="mt-5 border-l-4 border-green-600 bg-green-50 px-4 py-3 text-sm text-green-900">Image uploaded to the reusable website media library.</p>}
    {query.error&&<p className="mt-5 border-l-4 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-900">Could not complete the action: {query.error}</p>}
    <form action={uploadHomepageMediaAction} className="mt-7 grid gap-3 border border-ink-black/15 bg-white p-5 md:grid-cols-2"><div className="md:col-span-2"><h2 className="text-xl uppercase">Reusable website media</h2><p className="mt-1 text-sm normal-case text-ink-black/60">Upload without creating or changing a portfolio project.</p></div><label className={label}>Image<input name="mediaFile" type="file" accept="image/jpeg,image/png,image/webp,image/avif" required className={input}/></label><Field name="mediaAlt" title="Descriptive alt text" value=""/><button className="justify-self-start bg-ink-black px-6 py-3 text-xs uppercase text-white">Upload to media library</button></form>

    <form action={saveHomepageSettingsAction} className="mt-7 grid gap-4">
      <Panel title="SEO metadata" copy="Browser title and search description">
        <Field name="seo.title" title="SEO title" value={settings.seo.title} wide/>
        <Field name="seo.description" title="Meta description" value={settings.seo.description} area wide/>
      </Panel>

      <Panel title="Hero" copy="Main images, project link and labels">
        <WebsiteImageSelect name="hero.desktopImage" label="Desktop image" value={settings.hero.desktopImage} images={images}/><WebsiteImageSelect name="hero.mobileImage" label="Mobile image" value={settings.hero.mobileImage} images={images}/>{Object.entries(settings.hero).filter(([key])=>!key.endsWith("Image")).map(([key,val])=><Field key={key} name={`hero.${key}`} title={key.replaceAll(/([A-Z])/g," $1")} value={val}/>)}</Panel>

      <Panel title="Featured metro cards" copy="Three editable cards in center, right and left rows">
        <Field name="featured.eyebrow" title="Section eyebrow" value={settings.featuredEditorial.eyebrow}/>
        <Field name="featured.title" title="Section title" value={settings.featuredEditorial.title}/>
        <Field name="featured.subtitle" title="Section subheading" value={settings.featuredEditorial.subtitle} area wide/>
        {settings.featuredCards.map((item,index)=><fieldset key={index} className="grid gap-3 border border-ink-black/10 p-4 md:col-span-2 md:grid-cols-2">
          <legend className="px-2 uppercase">{cardLabels[index]}</legend>
          <Field name={`featured.${index}.title`} title="Editorial title above card" value={settings.featuredEditorial.items[index].title}/>
          <Field name={`featured.${index}.subtitle`} title="Editorial subheading above card" value={settings.featuredEditorial.items[index].subtitle} area/>
          <Field name={`card.${index}.title`} title="Name" value={item.title}/>
          <Field name={`card.${index}.subtitle`} title="Location / metadata" value={item.subtitle}/>
          <Field name={`card.${index}.ctaLabel`} title="CTA label" value={item.ctaLabel}/>
          <Field name={`card.${index}.href`} title="Card URL" value={item.href} wide/>
          <WebsiteImageSelect name={`card.${index}.image`} label="Card image" value={item.image} images={images}/>
          <Field name={`card.${index}.alt`} title="Image alt text" value={item.alt} wide/>
        </fieldset>)}
      </Panel>

      <Panel title="Cinematic story" copy="Introduction, CTA and Vimeo video">
        <Field name="story.eyebrow" title="Eyebrow" value={settings.story.eyebrow} area wide/>
        <Field name="story.title" title="Main text" value={settings.story.title} area wide/>
        <Field name="story.buttonLabel" title="Button label" value={settings.story.buttonLabel}/>
        <Field name="story.buttonHref" title="Button link" value={settings.story.buttonHref}/>
        <Field name="story.videoUrl" title="Video embed URL" value={settings.story.videoUrl} wide/>
      </Panel>

      <Panel title="Projects grid" copy="Heading, CTA and the two visible project cards">
        <Field name="portfolio.title" title="Section title" value={settings.portfolio.title}/>
        <Field name="portfolio.subtitle" title="Section description" value={settings.portfolio.subtitle} area wide/>
        <Field name="portfolio.buttonLabel" title="Button label" value={settings.portfolio.buttonLabel}/>
        <Field name="portfolio.buttonHref" title="Button link" value={settings.portfolio.buttonHref} wide/>
        {settings.portfolio.items.map((item,index)=><fieldset key={index} className="grid gap-3 border border-ink-black/10 p-4 md:col-span-2 md:grid-cols-2">
          <legend className="px-2 uppercase">{projectLabels[index]}</legend>
          <Field name={`portfolio.${index}.title`} title="Project name" value={item.title}/>
          <Field name={`portfolio.${index}.location`} title="Location / metadata" value={item.location}/>
          <Field name={`portfolio.${index}.href`} title="Project URL" value={item.href} wide/>
          <WebsiteImageSelect name={`portfolio.${index}.image`} label="Project image" value={item.image} images={images}/>
          <Field name={`portfolio.${index}.alt`} title="Image alt text" value={item.alt} wide/>
        </fieldset>)}
      </Panel>

      <Panel title="Homepage marquee" copy="Twelve images selected from the portfolio library">
        {settings.marqueeImages.map((image,index)=><fieldset key={`${index}-${image.src}`} className="grid gap-3 border border-ink-black/10 p-4 md:grid-cols-2"><WebsiteImageSelect name={`marquee.${index}.src`} label={`Marquee image ${index+1}`} value={image.src} images={images}/><Field name={`marquee.${index}.alt`} title="Unique image alt text" value={image.alt}/></fieldset>)}
      </Panel>

      <Panel title="Testimonials carousel" copy="Names, locations, quotes and portraits">
        <input type="hidden" name="testimonialCount" value={settings.testimonials.items.length}/>
        <Field name="testimonials.title" title="Section title" value={settings.testimonials.title} wide/>
        {settings.testimonials.items.map((item,index)=><fieldset key={index} className="grid gap-3 border border-ink-black/10 p-4 md:col-span-2 md:grid-cols-2">
          <legend className="px-2 uppercase">Testimonial {index+1}</legend>
          <Field name={`testimonial.${index}.couple`} title="Couple" value={item.couple}/>
          <Field name={`testimonial.${index}.location`} title="Location" value={item.location}/>
          <Field name={`testimonial.${index}.quote`} title="Quote" value={item.quote} area wide/>
          <WebsiteImageSelect name={`testimonial.${index}.image`} label="Portrait image" value={item.image} images={images}/>
          <Field name={`testimonial.${index}.alt`} title="Image alt text" value={item.alt}/>
        </fieldset>)}
      </Panel>

      <div hidden aria-hidden="true">
        <input name="services.eyebrow" defaultValue={settings.services.eyebrow}/>
        <textarea name="services.intro" defaultValue={settings.services.intro}/>
        {settings.services.items.map((item,index)=><div key={index}>
          <input name={`service.${index}.title`} defaultValue={item.title}/>
          <input name={`service.${index}.projectSlug`} defaultValue={item.projectSlug}/>
          <input name={`service.${index}.image`} defaultValue={item.image}/>
          <textarea name={`service.${index}.description`} defaultValue={item.description}/>
          <textarea name={`service.${index}.keywords`} defaultValue={item.keywords.join("\n")}/>
        </div>)}
      </div>

      <div className="sticky bottom-4 z-20 flex justify-end"><button className="bg-ink-black px-8 py-4 text-sm uppercase text-white shadow-xl">Save homepage</button></div>
    </form>
  </main>;
}
