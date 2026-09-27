import ServicesHeroSection from "@/components/sections/ServicesPage/ServicesHeroSection";
import ServicesThreeColSection from "@/components/sections/ServicesPage/ServicesThreeColSection";
import ServicesFaqSection from "@/components/sections/ServicesPage/ServicesFaqSection";
import ServicesStackingCardsSection from "@/components/sections/ServicesPage/ServicesStackingCardsSection";

export default function ServicesPage() {
  return (
    <>
      <ServicesHeroSection />
      <ServicesThreeColSection />
      <ServicesStackingCardsSection />
      <ServicesFaqSection />
    </>
  );
}
