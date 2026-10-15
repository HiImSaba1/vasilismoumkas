import type {Metadata} from "next";
import HomeHero from "@/components/sections/HomePage/HomeHero";
import AboutSplitSectionMain from "@/components/sections/AboutPage/AboutSplitSectionMain";
import HomeProjectsGrid from "@/components/sections/HomePage/HomeProjectsGrid";
import HomeProjectVideoSection from "@/components/sections/HomePage/HomeProjectVideoSection";
import HomeMarqueeImages from "@/components/sections/HomePage/HomeMarqueeImages";
import HomeTestimonialsOnScroll from "@/components/sections/HomePage/HomeTestimonialsOnScroll";
import HomeCurtainTransition from "@/components/sections/HomePage/HomeCurtainTransition";
import {getHomepageSettings} from "@/lib/homepage-settings";
export async function generateMetadata():Promise<Metadata>{const{seo}=await getHomepageSettings();return{title:seo.title,description:seo.description}}
export default async function HomePage() {
  const settings=await getHomepageSettings();
  return (
    <>
      <HomeHero content={settings.hero}/>
      <HomeCurtainTransition
        featured={<AboutSplitSectionMain cards={settings.featuredCards}/>}
        video={<HomeProjectVideoSection content={settings.story}/>}
      />
      <div className="relative z-[70] bg-off-white">
        <HomeMarqueeImages/>
        <HomeProjectsGrid content={settings.portfolio}/>
        <HomeTestimonialsOnScroll content={settings.testimonials}/>
      </div>
    </>
  );
}
