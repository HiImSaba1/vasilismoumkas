"use server";
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {requireAdmin} from "@/lib/admin-auth";
import {saveSeoSettings,seoSettingsSchema,type SeoPageKey} from "@/lib/seo-settings";
import {getHomepageSettings,saveHomepageSettings} from "@/lib/homepage-settings";
import {listPortfolioProjects,savePortfolioSeoFields} from "@/lib/portfolio";
import {z} from "zod";

const keys:SeoPageKey[]=["portfolio","wedding","editorial","engagement","about","services","contact","education"];
const value=(data:FormData,key:string)=>String(data.get(key)??"").trim();
export async function saveSeoSettingsAction(formData:FormData){
  await requireAdmin();
  const candidate={...Object.fromEntries(keys.map(key=>[key,{title:value(formData,`${key}.title`),description:value(formData,`${key}.description`),image:value(formData,`${key}.image`),imageAlt:value(formData,`${key}.imageAlt`)}])),business:{name:value(formData,"business.name"),description:value(formData,"business.description"),telephone:value(formData,"business.telephone"),email:value(formData,"business.email"),streetAddress:value(formData,"business.streetAddress"),addressLocality:value(formData,"business.addressLocality"),addressRegion:value(formData,"business.addressRegion"),postalCode:value(formData,"business.postalCode"),addressCountry:value(formData,"business.addressCountry").toUpperCase(),mapUrl:value(formData,"business.mapUrl"),instagram:value(formData,"business.instagram"),facebook:value(formData,"business.facebook"),pinterest:value(formData,"business.pinterest"),addressConfirmed:formData.get("business.addressConfirmed")==="on"}};
  const parsed=seoSettingsSchema.safeParse(candidate);
  if(!parsed.success)redirect(`/admin/seo?error=${encodeURIComponent(parsed.error.issues[0]?.message??"Check the SEO fields.")}`);
  const homeTitle=value(formData,"home.title");const homeDescription=value(formData,"home.description");const homeImage=value(formData,"home.image");const homeImageAlt=value(formData,"home.imageAlt");
  if(homeTitle.length<5||homeTitle.length>160||homeDescription.length<20||homeDescription.length>500||!homeImage.startsWith("/")||homeImageAlt.length<3)redirect("/admin/seo?error=Check%20the%20homepage%20SEO%20fields.");
  const projectCount=Math.min(Math.max(Number(formData.get("projectCount"))||0,0),100);const projectSchema=z.object({slug:z.string().trim().min(2).max(190).regex(/^[a-z0-9-]+$/),seoTitle:z.string().trim().max(255),metaDescription:z.string().trim().max(500),headerImageAlt:z.string().trim().max(500),published:z.boolean()});const projects=Array.from({length:projectCount},(_,index)=>projectSchema.parse({slug:value(formData,`project.${index}.slug`),seoTitle:value(formData,`project.${index}.seoTitle`),metaDescription:value(formData,`project.${index}.metaDescription`),headerImageAlt:value(formData,`project.${index}.headerImageAlt`),published:formData.get(`project.${index}.published`)==="on"}));
  try{const homepage=await getHomepageSettings();const currentProjects=await listPortfolioProjects({includeUnpublished:true});const marqueeImages=homepage.marqueeImages.map((image,index)=>({src:value(formData,`marquee.${index}.src`)||image.src,alt:value(formData,`marquee.${index}.alt`)}));await Promise.all([saveSeoSettings(parsed.data),saveHomepageSettings({...homepage,seo:{title:homeTitle,description:homeDescription,image:homeImage,imageAlt:homeImageAlt},marqueeImages})]);for(const project of projects){const current=currentProjects.find(item=>item.slug===project.slug);if(!current||(current.seoTitle??"")!==project.seoTitle||(current.metaDescription??"")!==project.metaDescription||(current.headerImageAlt??"")!==project.headerImageAlt||(current.published!==false)!==project.published)await savePortfolioSeoFields(project.slug,project)}}catch(error){redirect(`/admin/seo?error=${encodeURIComponent(error instanceof Error?error.message:"Unable to save SEO settings.")}`)}
  ["/","/portfolio","/portfolio/wedding","/portfolio/editorial","/portfolio/engagement","/about","/services","/contact","/education","/sitemap.xml"].forEach(path=>revalidatePath(path));for(const project of projects)revalidatePath(`/portfolio/project/${project.slug}`);
  redirect("/admin/seo?saved=1");
}
