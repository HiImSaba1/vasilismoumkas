import {notFound} from "next/navigation";
import type {Metadata} from "next";
import {listPortfolioProjects} from "@/lib/portfolio";
import {homeServices} from "../../data/ServicesData";
import {getSeoSettings,pageMetadata} from "@/lib/seo-settings";
import CategoryPortfolioClient from "./CategoryPortfolioClient";

const matches=(value:string,target:string)=>{const a=value.toLowerCase();const b=target.toLowerCase();return a===b||a===b.replace(/s$/,"")||b===a.replace(/s$/,"")};
export async function generateMetadata({params}:{params:Promise<{category:string}>}):Promise<Metadata>{const{category}=await params;const settings=await getSeoSettings();if(category.toLowerCase()==="wedding")return pageMetadata(settings.wedding,"/portfolio/wedding");const service=homeServices.find(item=>item.slug.toLowerCase()===category.toLowerCase());if(!service)return{};const title=`${service.title} Photography Stories | Vasilis Moumkas`;return{title:{absolute:title},description:service.description,alternates:{canonical:`/portfolio/${category}`}}}
export default async function CategoryPage({params}:{params:Promise<{category:string}>}){const{category}=await params;const service=homeServices.find(item=>item.slug.toLowerCase()===category.toLowerCase());if(!service)notFound();const projects=(await listPortfolioProjects()).filter(project=>matches(project.category,category));if(!projects.length)notFound();return <CategoryPortfolioClient category={category} projects={projects}/>}
