import type {Metadata} from "next";
import HomeHero from "@/components/sections/HomePage/HomeHero";
import AboutSplitSectionMain from "@/components/sections/AboutPage/AboutSplitSectionMain";
import HomeProjectsGrid from "@/components/sections/HomePage/HomeProjectsGrid";
import HomeProjectVideoSection from "@/components/sections/HomePage/HomeProjectVideoSection";
import HomeServicesSection from "@/components/sections/HomePage/HomeServicesSection";
import HomeTestimonialsOnScroll from "@/components/sections/HomePage/HomeTestimonialsOnScroll";
import {getHomepageSettings} from "@/lib/homepage-settings";
export async function generateMetadata():Promise<Metadata>{const{seo}=await getHomepageSettings();return{title:seo.title,description:seo.description}}
export default async function HomePage() {
  const settings=await getHomepageSettings();
  return (
    <>
      <HomeHero content={settings.hero}/>
      <AboutSplitSectionMain cards={settings.featuredCards}/>
      <HomeServicesSection content={settings.services}/>
      <HomeProjectsGrid content={settings.portfolio}/>
      <HomeProjectVideoSection content={settings.story}/>
      <HomeTestimonialsOnScroll content={settings.testimonials}/>
    </>
  );
}
