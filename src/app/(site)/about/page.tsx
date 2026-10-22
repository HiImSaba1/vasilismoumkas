import { publicCopy } from "@/app/(site)/data/ApprovedPublicCopy";
import AboutHeroVideoSection from "@/components/sections/AboutPage/AboutHeroVideoSection";
import AboutQuoteSection from "@/components/sections/AboutPage/AboutQuoteSection";
import AboutGallerySection from "@/components/sections/AboutPage/AboutGallerySection";
import AboutBigImageSection from "@/components/sections/AboutPage/AboutBigImageSection";
import AboutFaqSection from "@/components/sections/AboutPage/AboutFaqSection";

export default function AboutPage() {
  return (
    <>
      <h1 className="sr-only">{publicCopy.aboutTitle}</h1>
      <AboutHeroVideoSection />
      <AboutQuoteSection />
      <AboutGallerySection />
      <AboutBigImageSection />
      <AboutFaqSection />
    </>
  );
}
