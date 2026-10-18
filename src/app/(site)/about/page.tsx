import AboutHeroVideoSection from "@/components/sections/AboutPage/AboutHeroVideoSection";
import AboutQuoteSection from "@/components/sections/AboutPage/AboutQuoteSection";
import AboutGallerySection from "@/components/sections/AboutPage/AboutGallerySection";
import AboutBigImageSection from "@/components/sections/AboutPage/AboutBigImageSection";
import AboutFaqSection from "@/components/sections/AboutPage/AboutFaqSection";

export default function AboutPage() {
  return (
    <>
      <h1 className="sr-only">Vasilis Moumkas — Wedding Photographer</h1>
      <AboutHeroVideoSection />
      <AboutQuoteSection />
      <AboutGallerySection />
      <AboutBigImageSection />
      <AboutFaqSection />
    </>
  );
}
