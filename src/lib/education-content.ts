import { z } from "zod";
import { EDUCATION_SECTIONS } from "@/app/(site)/data/EducationData";

const text=z.string().trim().min(1).max(6000);
const optionalText=z.string().max(6000);
const image=z.object({src:z.string().startsWith("/").max(700),alt:z.string().trim().min(3).max(300)});
const link=z.string().max(700).regex(/^\/(?!\/)[^\\\s%\u0000-\u001f]*$/,"Choose an internal page link.");
const sequence=z.array(text).length(4);
export const educationContentSchema=z.object({
  title:text,
  hero:z.object({label:text,introduction:text,keywords:z.object({photography:sequence,sessions:sequence,oneOnOne:sequence,bill:sequence,seminar:sequence}),images:z.array(image).length(3),mobileImage:image}),
  sections:z.array(z.object({title:text,category:text,paragraph:text,detail:optionalText,list:z.array(text).max(20),footer:optionalText,image:z.string().startsWith("/").max(700),imageAlt:text,slug:z.string().regex(/^[a-z0-9-]+$/),id:z.string().regex(/^[a-z0-9-]+$/),buttonLabel:text,buttonHref:link,headingHref:link})).length(4).refine(items=>new Set(items.map(item=>item.id)).size===4,"Section IDs must be unique."),
  closing:z.object({titleLines:z.array(text).length(3),label:text,description:text,desktopImage:image,mobileImage:image}),
});
export type EducationContent=z.infer<typeof educationContentSchema>;

const heroImages=[
  {src:"/vm_img/Projects/Eirini_Fotis/vasilis_moumkas_eirini_fotis_5.webp",alt:"Bride carrying a bouquet walks arm in arm with a man across a sunlit lawn"},
  {src:"/vm_img/Projects/Eirini_Fotis/vasilis_moumkas_eirini_fotis_22.webp",alt:"Black and white portrait of the groom and friends wearing light-coloured hats outdoors"},
  {src:"/vm_img/Projects/Eirini_Fotis/vasilis_moumkas_eirini_fotis_9.webp",alt:"Colourful floral arrangements and orange napkins on a wooden wedding reception table"},
];
const sectionAlts=["Black and white photograph of a bride holding a bouquet beside wedding reception guests","Black and white bridal preparation portrait beside a curtained window","Bride and groom dancing with guests at their evening wedding celebration","Wedding dress hanging beside a framed painting above a wooden grand piano"];
export const defaultEducationContent:EducationContent={
  title:"Photography Education & Mentoring",
  hero:{label:"(About my services)",introduction:"I provide a bespoke educational environment to help creators\nmaster high-end artistry and build a sustainable business.",keywords:{photography:["Photography","Fine Art","Editorial","Luxury"],sessions:["Sessions","Mentorship","Workshops","Masterclass"],oneOnOne:["1 on 1","Private","Bespoke","Personal"],bill:["A Day with Me","Expert Guidance","Creative Coaching","Pro Workflow"],seminar:["Tailored Seminars","Learn Online","Group Training","Artist Talks"]},images:heroImages,mobileImage:heroImages[1]},
  sections:EDUCATION_SECTIONS.map((item,index)=>({...item,id:item.id??item.slug,imageAlt:sectionAlts[index],buttonLabel:index===0?"INQUIRE ABOUT MENTORING":"INQUIRE",buttonHref:"/inquiry",headingHref:`/education#${item.id??item.slug}`,...(index===0?{
    title:"Online One-to-One Mentoring",
    paragraph:"Personal online mentoring for wedding photographers, tailored to your experience, questions and creative goals. Together, we review your work and explore natural light, storytelling, working with couples and developing a consistent visual identity.",
    detail:"Each session takes place live, by appointment, with practical feedback focused on your photography and the areas you want to improve.",list:[],footer:"",
  }:{})})),
  closing:{titleLines:["Elevate your","Artistry &","Business."],label:"Mentorship",description:"One-on-One education for the modern photographer by Vasilis Moumkas.",desktopImage:{src:"/vm_img/Projects/Kymara_Pantelis/vasilis_moumkas_kymara_pantelis_11.webp",alt:"Bride standing beside white curved walls and flowering bougainvillea"},mobileImage:{src:"/vm_img/Projects/Eirini_Fotis/vasilis_moumkas_eirini_fotis_7.webp",alt:"Black and white portrait of a groom kissing the bride's head as she holds her bouquet"}},
};
