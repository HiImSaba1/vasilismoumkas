import { homeServices, type HomeService } from "@/app/(site)/data/ServicesData";
import { ProjectsData } from "@/app/(site)/data/ProjectsData";

const baptism=ProjectsData.find(project=>/^baptisms?$/i.test(project.category.trim()));
// Public category navigation is separate from the three designed Home services.
export const portfolioCategories:HomeService[]=[...homeServices,{
  title:"Baptism",slug:"baptism",projectSlug:baptism?.slug??"",
  description:"Baptism photography stories by Vasilis Moumkas.",keywords:[],
  image:baptism?.thumbnail??"",categoryHeroImage:baptism?.thumbnail??"",
}];
