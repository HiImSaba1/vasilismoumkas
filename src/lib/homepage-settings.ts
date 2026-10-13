import "server-only";
import type {RowDataPacket} from "mysql2/promise";
import {z} from "zod";
import {getDatabase,isDatabaseConfigured} from "@/lib/database";
import {homeServices} from "@/app/(site)/data/ServicesData";
import {TestimonialsData} from "@/app/(site)/data/TestimonialsData";

const localPath=z.string().trim().startsWith("/").max(700);
const safeUrl=z.string().trim().max(1000).refine(value=>value.startsWith("/")||value.startsWith("https://"),"Use an internal /path or https:// URL");
const card=z.object({title:z.string().trim().min(1).max(160),subtitle:z.string().trim().min(1).max(200),href:localPath,image:localPath,alt:z.string().trim().min(3).max(300)});
const service=z.object({title:z.string().trim().min(1).max(100),projectSlug:z.string().trim().min(1).max(190),description:z.string().trim().min(10).max(1200),keywords:z.array(z.string().trim().min(1).max(100)).min(1).max(8),image:localPath});
const testimonial=z.object({couple:z.string().trim().min(1).max(160),location:z.string().trim().min(1).max(180),quote:z.string().trim().min(10).max(1600),image:localPath,alt:z.string().trim().min(3).max(300)});

export const homepageSettingsSchema=z.object({
  seo:z.object({title:z.string().trim().min(5).max(160),description:z.string().trim().min(20).max(500)}),
  hero:z.object({desktopImage:localPath,mobileImage:localPath,projectHref:localPath,imageAlt:z.string().trim().min(3).max(300),topLeft:z.string().trim().min(1).max(80),topCenter:z.string().trim().min(1).max(80),topRight:z.string().trim().min(1).max(80),bottomLeft:z.string().trim().min(1).max(120),bottomRight:z.string().trim().min(1).max(120)}),
  featuredCards:z.array(card).length(3),
  services:z.object({eyebrow:z.string().trim().min(1).max(100),intro:z.string().trim().min(10).max(800),items:z.array(service).length(3)}),
  portfolio:z.object({title:z.string().trim().min(2).max(160),buttonLabel:z.string().trim().min(1).max(100),buttonHref:localPath}),
  story:z.object({eyebrow:z.string().trim().min(2).max(400),title:z.string().trim().min(10).max(1800),buttonLabel:z.string().trim().min(1).max(100),buttonHref:localPath,videoUrl:safeUrl}),
  testimonials:z.object({title:z.string().trim().min(2).max(120),items:z.array(testimonial).min(1).max(12)}),
});
export type HomepageSettings=z.infer<typeof homepageSettingsSchema>;
export const HOMEPAGE_SETTINGS_KEY="homepage_content_v1";

export const defaultHomepageSettings:HomepageSettings={
  seo:{title:"Vasilis Moumkas Photography | Weddings in Greece & Italy",description:"Luxury fine-art wedding photography in Greece, the Greek islands and Italy by Vasilis Moumkas."},
  hero:{desktopImage:"/uploads/portfolio/natasa-stamatis/b85c1421-3758-44f5-bc57-d6b5bf761807.webp",mobileImage:"/uploads/portfolio/natasa-stamatis/7099163a-198e-4cf5-ab4c-799e6ae5757a.webp",projectHref:"/portfolio/project/natasa-stamatis",imageAlt:"Natasa and Stamatis wedding photography",topLeft:"For modern",topCenter:"Romantic souls",topRight:"Emotional & timeless",bottomLeft:"Scroll for portraits",bottomRight:"with passion & elegance"},
  featuredCards:[
    {title:"Suzanna & Alexis",subtitle:"Greece",href:"/portfolio/project/suzanna-alexis",image:"/uploads/portfolio/suzanna-alexis/aac71937-16fa-49a4-b564-0e4ab82563b6.webp",alt:"Suzanna and Alexis wedding photography in Greece"},
    {title:"Kim & Lee",subtitle:"Santorini Island, Greece",href:"/portfolio/project/kim-lee",image:"/vm_img/Projects/Kim_Lee/vasilis_moumkas_kim_lee_2.webp",alt:"Kim and Lee wedding photography in Santorini"},
    {title:"Eva & George",subtitle:"Greece",href:"/portfolio/project/eva-george",image:"/uploads/portfolio/eva-george/6276177f-1335-488b-8546-ffe92398f7c6.webp",alt:"Eva and George wedding photography in Greece"},
  ],
  services:{eyebrow:"Expertise",intro:"Capturing the art of human connection through a lens of sophistication transforming moments into a permanent visual legacy.",items:homeServices.map(item=>({title:item.title,projectSlug:item.projectSlug,description:item.description,keywords:item.keywords,image:item.image}))},
  portfolio:{title:"Best of Wedding Portfolio works",buttonLabel:"Full Portfolio",buttonHref:"/portfolio"},
  story:{eyebrow:"Luxury Fine Art Wedding Photography in Greece. For modern souls. Quiet. Emotional. Timeless",title:"For couples who value emotion, elegance, and authenticity. I am Vasilis Moumkas, a luxury destination wedding photographer based in Thessaloniki, Greece. I document refined celebrations across Santorini, Mykonos, Naxos, and Italy from Lake Como and Tuscany to the Amalfi Coast. I also specialise in intimate elopements across the Greek islands. With a calm, intuitive eye, I transform fleeting feelings into timeless artistry. Because these are not just photographs, they are your legacy.",buttonLabel:"Learn More",buttonHref:"/about",videoUrl:"https://player.vimeo.com/video/1159684670?h=ac91465937&autoplay=1&muted=1&loop=1&background=1&badge=0&autopause=0&quality=1080p"},
  testimonials:{title:"Couple Testimonials",items:TestimonialsData.map(item=>({couple:item.couple,location:item.location,quote:item.quote,image:item.profileImage,alt:`${item.couple} wedding testimonial portrait`}))},
};

export async function getHomepageSettings():Promise<HomepageSettings>{
  if(!isDatabaseConfigured())return defaultHomepageSettings;
  try{const[rows]=await getDatabase().query<(RowDataPacket&{value_json:string|Record<string,unknown>})[]>("SELECT value_json FROM site_settings WHERE setting_key=? LIMIT 1",[HOMEPAGE_SETTINGS_KEY]);if(!rows[0])return defaultHomepageSettings;const raw=typeof rows[0].value_json==="string"?JSON.parse(rows[0].value_json):rows[0].value_json;const parsed=homepageSettingsSchema.safeParse(raw);return parsed.success?parsed.data:defaultHomepageSettings}catch{return defaultHomepageSettings}
}

export async function saveHomepageSettings(value:HomepageSettings){await getDatabase().execute("INSERT INTO site_settings (setting_key,value_json) VALUES (?,?) ON DUPLICATE KEY UPDATE value_json=VALUES(value_json),updated_at=CURRENT_TIMESTAMP",[HOMEPAGE_SETTINGS_KEY,JSON.stringify(value)])}
