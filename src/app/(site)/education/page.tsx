import EducationChessSection from "@/components/sections/EducationPage/EducationChessSection";
import EducationCTA from "@/components/sections/EducationPage/EducationCTA";
import EducationHero from "@/components/sections/EducationPage/EducationHero";


export default function EducationPage() {
  return (
    <>
      <h1 className="sr-only">Photography Education &amp; Mentoring</h1>
      <EducationHero />
      <EducationChessSection />
      <EducationCTA />
    </>
  );
}
