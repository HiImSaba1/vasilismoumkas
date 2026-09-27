import type { MetadataRoute } from "next";
import { listPortfolioProjects } from "@/lib/portfolio";
import { ProjectsData } from "@/app/(site)/data/ProjectsData";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://vasilismoumkas.com";
  const projects = await listPortfolioProjects().catch(() => ProjectsData);
  const projectUrls = projects.map((project) => ({
    url: `${baseUrl}/portfolio/project/${project.slug}`,
    lastModified: project.dateShot ? new Date(project.dateShot) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));
  const pages = [["", 1, "always"], ["/portfolio", 0.9, "daily"], ["/services", 0.8, "monthly"], ["/about", 0.7, "monthly"], ["/contact", 0.8, "monthly"], ["/education", 0.8, "monthly"]] as const;
  return [...pages.map(([path, priority, changeFrequency]) => ({ url: `${baseUrl}${path}`, lastModified: new Date(), changeFrequency, priority })), ...projectUrls];
}
