import HomeHero from "@/components/sections/HomePage/HomeHero";
import AboutSplitSectionMain from "@/components/sections/AboutPage/AboutSplitSectionMain";
import HomeProjectsGrid from "@/components/sections/HomePage/HomeProjectsGrid";
import HomeProjectVideoSection from "@/components/sections/HomePage/HomeProjectVideoSection";
import HomeMarqueeImages from "@/components/sections/HomePage/HomeMarqueeImages";
import HomeTestimonialsOnScroll from "@/components/sections/HomePage/HomeTestimonialsOnScroll";
import HomeCurtainTransition from "@/components/sections/HomePage/HomeCurtainTransition";
import type {HomepageSettings} from "@/lib/homepage-settings";
export function ManagedHome({settings}:{settings:HomepageSettings}){
  return (
    <>
      <h1 className="sr-only">{settings.hero.accessibleTitle}</h1>
      <HomeHero content={settings.hero}/>
      <HomeCurtainTransition
        featured={<AboutSplitSectionMain cards={settings.featuredCards} editorial={settings.featuredEditorial}/>}
        video={<HomeProjectVideoSection content={settings.story}/>}
      />
      <div className="relative z-[70] bg-off-white">
        <HomeMarqueeImages images={settings.marqueeImages} copy={settings.marqueeCopy}/>
        <HomeProjectsGrid content={settings.portfolio}/>
        <HomeTestimonialsOnScroll content={settings.testimonials}/>
      </div>
    </>
  );
}
