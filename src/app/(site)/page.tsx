import HomeHero from "@/components/sections/HomePage/HomeHero";
import AboutSplitSectionMain from "@/components/sections/AboutPage/AboutSplitSectionMain";
import HomeProjectsGrid from "@/components/sections/HomePage/HomeProjectsGrid";
import HomeProjectVideoSection from "@/components/sections/HomePage/HomeProjectVideoSection";
import HomeServicesSection from "@/components/sections/HomePage/HomeServicesSection";
import HomeTestimonialsOnScroll from "@/components/sections/HomePage/HomeTestimonialsOnScroll";
export default function HomePage() {
  return (
    <>
      <HomeHero />
      <AboutSplitSectionMain />
      <HomeServicesSection />
      <HomeProjectsGrid />
      <HomeProjectVideoSection />
      <HomeTestimonialsOnScroll />
    </>
  );
}
