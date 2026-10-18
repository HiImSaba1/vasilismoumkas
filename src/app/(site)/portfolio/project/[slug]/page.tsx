import {notFound} from "next/navigation";
import {listPortfolioProjects} from "@/lib/portfolio";
import ProjectLayout from "@/components/sections/Projects/ProjectLayout";
import type {Metadata} from "next";

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
  const{slug}=await params;
  const project=(await listPortfolioProjects()).find(item=>item.slug===slug);
  if(!project)return{};
  const title=project.seoTitle?.trim()||`${project.title} | ${project.location||"Wedding Story"} | Vasilis Moumkas`;
  const description=project.metaDescription?.trim()||project.description?.trim().slice(0,500)||`Explore ${project.title}, photographed by Vasilis Moumkas${project.location?` in ${project.location}`:""}.`;
  const canonical=`/portfolio/project/${project.slug}`;
  const imageAlt=project.headerImageAlt||`${project.title}${project.location?` in ${project.location}`:""}`;
  return{title:{absolute:title},description,alternates:{canonical},openGraph:{title,description,url:canonical,type:"article",images:[{url:project.thumbnail,alt:imageAlt}]},twitter:{card:"summary_large_image",title,description,images:[project.thumbnail]}};
}

export default async function ProjectPage({params}:{params:Promise<{slug:string}>}){
  const{slug}=await params;
  const projects=await listPortfolioProjects();
  const index=projects.findIndex(item=>item.slug===slug);
  if(index<0)notFound();
  return <><h1 className="sr-only">{projects[index].title}</h1><ProjectLayout project={projects[index]} nextProject={projects[(index+1)%projects.length]} prevProject={projects[(index-1+projects.length)%projects.length]}/></>;
}
