import type {Metadata} from "next";
import HomeHero from "@/components/sections/HomePage/HomeHero";
import AboutSplitSectionMain from "@/components/sections/AboutPage/AboutSplitSectionMain";
import HomeProjectsGrid from "@/components/sections/HomePage/HomeProjectsGrid";
import HomeProjectVideoSection from "@/components/sections/HomePage/HomeProjectVideoSection";
import HomeMarqueeImages from "@/components/sections/HomePage/HomeMarqueeImages";
import HomeTestimonialsOnScroll from "@/components/sections/HomePage/HomeTestimonialsOnScroll";
import HomeCurtainTransition from "@/components/sections/HomePage/HomeCurtainTransition";
import {getHomepageSettings} from "@/lib/homepage-settings";
export async function generateMetadata():Promise<Metadata>{const{seo,hero}=await getHomepageSettings();return{title:{absolute:seo.title},description:seo.description,alternates:{canonical:"/"},openGraph:{title:seo.title,description:seo.description,url:"/",type:"website",images:[{url:hero.desktopImage,alt:hero.imageAlt}]},twitter:{card:"summary_large_image",title:seo.title,description:seo.description,images:[hero.desktopImage]}}}
export default async function HomePage() {
  const settings=await getHomepageSettings();
  return (
    <>
      <h1 className="sr-only">Wedding Photographer in Greece &amp; Italy</h1>
      <HomeHero content={settings.hero}/>
      <HomeCurtainTransition
        featured={<AboutSplitSectionMain cards={settings.featuredCards} editorial={settings.featuredEditorial}/>}
        video={<HomeProjectVideoSection content={settings.story}/>}
      />
      <div className="relative z-[70] bg-off-white">
        <HomeMarqueeImages images={settings.marqueeImages}/>
        <HomeProjectsGrid content={settings.portfolio}/>
        <HomeTestimonialsOnScroll content={settings.testimonials}/>
      </div>
    </>
  );
}
