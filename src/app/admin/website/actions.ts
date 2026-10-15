"use server";
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {requireAdmin} from "@/lib/admin-auth";
import {saveWebsiteSettings,websiteSettingsSchema} from "@/lib/website-settings";
const value=(data:FormData,key:string)=>String(data.get(key)??"").trim();
const image=(data:FormData,key:string)=>({src:value(data,`${key}.src`),alt:value(data,`${key}.alt`)});
const localized=(data:FormData,key:string)=>({en:value(data,`${key}.en`),gr:value(data,`${key}.gr`)});
export async function saveWebsiteSettingsAction(formData:FormData){
  await requireAdmin();
  const offerContent=(type:"wedding"|"baptism")=>{
    const base=`offers.${type}`;
    const faqContent=(lang:"en"|"gr")=>{const count=Math.min(Math.max(Number(formData.get(`${base}.faq.${lang}.count`))||1,1),16);return{title:value(formData,`${base}.faq.${lang}.title`),intro:value(formData,`${base}.faq.${lang}.intro`),items:Array.from({length:count},(_,index)=>({date:value(formData,`${base}.faq.${lang}.${index}.date`),question:value(formData,`${base}.faq.${lang}.${index}.question`),answer:value(formData,`${base}.faq.${lang}.${index}.answer`)}))}};
    return{heroImage:image(formData,`${base}.heroImage`),heroLabel:localized(formData,`${base}.heroLabel`),heroIntro:localized(formData,`${base}.heroIntro`),collectionImages:Array.from({length:3},(_,index)=>image(formData,`${base}.collectionImages.${index}`)),gallery:{eyebrow:localized(formData,`${base}.gallery.eyebrow`),title:localized(formData,`${base}.gallery.title`),images:Array.from({length:3},(_,index)=>image(formData,`${base}.gallery.images.${index}`))},projects:{title:localized(formData,`${base}.projects.title`),buttonLabel:localized(formData,`${base}.projects.buttonLabel`),buttonHref:value(formData,`${base}.projects.buttonHref`),items:Array.from({length:2},(_,index)=>({title:value(formData,`${base}.projects.${index}.title`),location:value(formData,`${base}.projects.${index}.location`),href:value(formData,`${base}.projects.${index}.href`),image:value(formData,`${base}.projects.${index}.image`),alt:value(formData,`${base}.projects.${index}.alt`)}))},faq:{en:faqContent("en"),gr:faqContent("gr")}};
  };
  const footerCount=Math.min(Math.max(Number(formData.get("footer.count"))||3,3),12);
  const parsed=websiteSettingsSchema.safeParse({contact:{image:image(formData,"contact.image")},footer:{images:Array.from({length:footerCount},(_,index)=>image(formData,`footer.images.${index}`))},offers:{wedding:offerContent("wedding"),baptism:offerContent("baptism")}});
  if(!parsed.success)throw new Error(parsed.error.issues[0]?.message??"Check the website fields.");
  await saveWebsiteSettings(parsed.data);
  for(const path of["/","/contact","/admin/website","/offer/[slug]"])revalidatePath(path);
  redirect("/admin/website?saved=1");
}
