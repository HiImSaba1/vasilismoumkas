"use server";
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {requireAdmin} from "@/lib/admin-auth";
import {homepageSettingsSchema,saveHomepageSettings} from "@/lib/homepage-settings";

const value=(data:FormData,key:string)=>String(data.get(key)??"").trim();
export async function saveHomepageSettingsAction(formData:FormData){
  await requireAdmin();
  const testimonialCount=Math.min(Math.max(Number(formData.get("testimonialCount"))||1,1),12);
  const parsed=homepageSettingsSchema.safeParse({
    seo:{title:value(formData,"seo.title"),description:value(formData,"seo.description")},
    hero:{desktopImage:value(formData,"hero.desktopImage"),mobileImage:value(formData,"hero.mobileImage"),projectHref:value(formData,"hero.projectHref"),imageAlt:value(formData,"hero.imageAlt"),topLeft:value(formData,"hero.topLeft"),topCenter:value(formData,"hero.topCenter"),topRight:value(formData,"hero.topRight"),bottomLeft:value(formData,"hero.bottomLeft"),bottomRight:value(formData,"hero.bottomRight")},
    featuredCards:Array.from({length:3},(_,index)=>({title:value(formData,`card.${index}.title`),subtitle:value(formData,`card.${index}.subtitle`),href:value(formData,`card.${index}.href`),image:value(formData,`card.${index}.image`),alt:value(formData,`card.${index}.alt`)})),
    featuredEditorial:{eyebrow:value(formData,"featured.eyebrow"),title:value(formData,"featured.title"),subtitle:value(formData,"featured.subtitle"),items:Array.from({length:3},(_,index)=>({title:value(formData,`featured.${index}.title`),subtitle:value(formData,`featured.${index}.subtitle`)}))},
    services:{eyebrow:value(formData,"services.eyebrow"),intro:value(formData,"services.intro"),items:Array.from({length:3},(_,index)=>({title:value(formData,`service.${index}.title`),projectSlug:value(formData,`service.${index}.projectSlug`),description:value(formData,`service.${index}.description`),keywords:value(formData,`service.${index}.keywords`).split(/\r?\n|,/).map(item=>item.trim()).filter(Boolean),image:value(formData,`service.${index}.image`)}))},
    portfolio:{title:value(formData,"portfolio.title"),buttonLabel:value(formData,"portfolio.buttonLabel"),buttonHref:value(formData,"portfolio.buttonHref"),items:Array.from({length:2},(_,index)=>({title:value(formData,`portfolio.${index}.title`),location:value(formData,`portfolio.${index}.location`),href:value(formData,`portfolio.${index}.href`),image:value(formData,`portfolio.${index}.image`),alt:value(formData,`portfolio.${index}.alt`)}))},
    story:{eyebrow:value(formData,"story.eyebrow"),title:value(formData,"story.title"),buttonLabel:value(formData,"story.buttonLabel"),buttonHref:value(formData,"story.buttonHref"),videoUrl:value(formData,"story.videoUrl")},
    marqueeImages:Array.from({length:12},(_,index)=>value(formData,`marquee.${index}`)),
    testimonials:{title:value(formData,"testimonials.title"),items:Array.from({length:testimonialCount},(_,index)=>({couple:value(formData,`testimonial.${index}.couple`),location:value(formData,`testimonial.${index}.location`),quote:value(formData,`testimonial.${index}.quote`),image:value(formData,`testimonial.${index}.image`),alt:value(formData,`testimonial.${index}.alt`)}))},
  });
  if(!parsed.success)throw new Error(parsed.error.issues[0]?.message??"Check the homepage fields.");
  await saveHomepageSettings(parsed.data);
  revalidatePath("/");revalidatePath("/admin/homepage");
  redirect("/admin/homepage?saved=1");
}
