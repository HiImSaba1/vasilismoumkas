import { notFound } from "next/navigation";
import { listPortfolioProjects } from "@/lib/portfolio";
import ProjectLayout from "@/components/sections/Projects/ProjectLayout";
export default async function ProjectPage({params}:{params:Promise<{slug:string}>}){const{slug}=await params;const projects=await listPortfolioProjects();const index=projects.findIndex(item=>item.slug===slug);if(index<0)notFound();return <ProjectLayout project={projects[index]} nextProject={projects[(index+1)%projects.length]} prevProject={projects[(index-1+projects.length)%projects.length]}/>}
