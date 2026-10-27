import {PageStructuredData} from "@/components/seo/PageStructuredData";
import type { PublicPageContent } from "@/lib/public-page-content";
import AboutHero from "./AboutPage/AboutHeroVideoSection";
import AboutQuote from "./AboutPage/AboutQuoteSection";
import AboutGallery from "./AboutPage/AboutGallerySection";
import AboutBio from "./AboutPage/AboutBigImageSection";
import AboutFaq from "./AboutPage/AboutFaqSection";
import ServicesHero from "./ServicesPage/ServicesHeroSection";
import ServicesColumns from "./ServicesPage/ServicesThreeColSection";
import ServicesCards from "./ServicesPage/ServicesStackingCardsSection";
import ServicesJourney from "./ServicesPage/ServicesFaqSection";

export function ManagedAbout({ content }: { content: PublicPageContent["about"] }) {
  return <><PageStructuredData title={content.title} canonical="/about" faq={content.faq.filter(item=>!item.hidden)}/><h1 className="sr-only">{content.title}</h1><AboutHero content={content.visuals}/><AboutQuote content={content.visuals}/><AboutGallery galleryImages={content.galleryImages} galleryQuotes={content.galleryQuotes} galleryDescriptions={content.galleryDescriptions}/><AboutBio intro={content.intro} content={content.visuals}/><AboutFaq items={content.faq.filter(item => !item.hidden)} introduction={content.faqIntro} heading={content.faqHeading}/></>;
}
export function ManagedServices({ content }: { content: PublicPageContent["services"] }) {
  return <><PageStructuredData title={content.title} canonical="/services"/><h1 className="sr-only">{content.title}</h1><ServicesHero introduction={content.intro} content={content.visuals}/><ServicesColumns content={content.visuals}/><h2 className="sr-only">Photography services</h2><ServicesCards content={content.items}/><ServicesJourney items={content.journey.filter(item => !item.hidden)} heading={content.journeyHeading} buttonLabel={content.buttonLabel} buttonHref={content.buttonHref}/></>;
}
