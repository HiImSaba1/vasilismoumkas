import "server-only";
import {listDestinations} from "@/lib/destinations";
import { listPortfolioProjects } from "@/lib/portfolio";
export async function listInternalLinks() {
  const projects = await listPortfolioProjects();
  return [
    ...["/", "/about", "/services", "/contact", "/portfolio", "/education", "/cookies", "/privacy-policy", "/instagram", "/inquiry"].map(href => ({ href, label: href === "/" ? "Homepage" : href.slice(1) })),
    ...(await listDestinations()).map(item => ({href:`/destinations/${item.slug}`,label:item.content.title})),
    ...projects.map(project => ({ href: `/portfolio/project/${project.slug}`, label: `${project.title} · ${project.location}`, category:project.category })),
  ];
}
