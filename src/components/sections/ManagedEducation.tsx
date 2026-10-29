import type {EducationContent} from "@/lib/education-content";
import {EducationContentProvider} from "@/providers/EducationContentContext";
import EducationHero from "./EducationPage/EducationHero";
import EducationChessSection from "./EducationPage/EducationChessSection";
import EducationCTA from "./EducationPage/EducationCTA";
export function ManagedEducation({content}:{content:EducationContent}){
  return <EducationContentProvider value={content}><h1 className="sr-only">{content.title}</h1><EducationHero/><EducationChessSection/><EducationCTA/></EducationContentProvider>;
}
