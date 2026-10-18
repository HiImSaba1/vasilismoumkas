import ServicesHeroSection from "@/components/sections/ServicesPage/ServicesHeroSection";
import ServicesThreeColSection from "@/components/sections/ServicesPage/ServicesThreeColSection";
import ServicesFaqSection from "@/components/sections/ServicesPage/ServicesFaqSection";
import ServicesStackingCardsSection from "@/components/sections/ServicesPage/ServicesStackingCardsSection";

export default function ServicesPage() {
  return (
    <>
      <h1 className="sr-only">Wedding Photography Services in Greece &amp; Italy</h1>
      <ServicesHeroSection />
      <ServicesThreeColSection />
      <ServicesStackingCardsSection />
      <ServicesFaqSection />
    </>
  );
}
