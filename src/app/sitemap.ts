import type { MetadataRoute } from "next";
import { listPortfolioProjects } from "@/lib/portfolio";
import { ProjectsData } from "@/app/(site)/data/ProjectsData";
import {homeServices} from "@/app/(site)/data/ServicesData";

export const dynamic="force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://vasilismoumkas.com";
  const projects = await listPortfolioProjects().catch(() => ProjectsData);
  const projectUrls = projects.map((project) => ({
    url: `${baseUrl}/portfolio/project/${project.slug}`,
    lastModified: project.updatedAt ? new Date(project.updatedAt) : undefined,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));
  const publicCategories=new Set(homeServices.map(service=>service.slug.toLowerCase()));
  const categoryUrls=Array.from(new Set(projects.map(project=>project.category.toLowerCase().replace(/s$/,"")).filter(category=>publicCategories.has(category)))).map(category=>({url:`${baseUrl}/portfolio/${category}`,changeFrequency:"weekly" as const,priority:0.75}));
  const pages = [["", 1, "weekly"], ["/portfolio", 0.9, "daily"], ["/services", 0.8, "monthly"], ["/about", 0.7, "monthly"], ["/contact", 0.8, "monthly"], ["/education", 0.8, "monthly"]] as const;
  return [...pages.map(([path, priority, changeFrequency]) => ({ url: `${baseUrl}${path}`, changeFrequency, priority })),...categoryUrls,...projectUrls];
}
