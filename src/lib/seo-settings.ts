import "server-only";
import {publicMetadata} from "@/lib/seo-overrides";
import type {RowDataPacket} from "mysql2/promise";
import {z} from "zod";
import {getDatabase,isDatabaseConfigured} from "@/lib/database";

const image=z.string().trim().startsWith("/").max(700);
const page=z.object({
  title:z.string().trim().min(10).max(160),
  description:z.string().trim().min(40).max(500),
  image,
  imageAlt:z.string().trim().min(3).max(300),
});
const business=z.object({name:z.string().trim().min(2).max(160),description:z.string().trim().min(20).max(500),telephone:z.string().trim().min(7).max(40),email:z.string().trim().email().max(320),streetAddress:z.string().trim().min(3).max(200),addressLocality:z.string().trim().min(2).max(120),addressRegion:z.string().trim().min(2).max(120),postalCode:z.string().trim().min(3).max(20),addressCountry:z.string().trim().length(2),mapUrl:z.string().trim().url().max(1000),instagram:z.string().trim().url().max(1000),facebook:z.string().trim().url().max(1000),pinterest:z.string().trim().url().max(1000),addressConfirmed:z.boolean()});
export const defaultBusinessSettings:z.infer<typeof business>={name:"Vasilis Moumkas Photography",description:"Luxury wedding and destination photographer based in Greece, specializing in cinematic fine-art storytelling across Europe and Italy.",telephone:"+306972218775",email:"vasilis.moumkas@gmail.com",streetAddress:"Themistokli Sofouli 52",addressLocality:"Thessaloniki",addressRegion:"Central Macedonia",postalCode:"54655",addressCountry:"GR",mapUrl:"https://maps.app.goo.gl/WgcYHohyWbyXDu3R9",instagram:"https://www.instagram.com/vasilismoumkas_weddings/",facebook:"https://www.facebook.com/VasilisMoumkasPhotography",pinterest:"https://gr.pinterest.com/vasilismoumkas/",addressConfirmed:false};

export const seoSettingsSchema=z.object({
  portfolio:page,
  wedding:page,
  editorial:page.default({title:"Editorial Photography Stories | Vasilis Moumkas",description:"Explore refined editorial photography stories shaped by fashion, atmosphere and cinematic visual storytelling by Vasilis Moumkas.",image:"/vm_img/Metadata/og-portfolio.jpg",imageAlt:"Editorial photography stories by Vasilis Moumkas"}),
  engagement:page.default({title:"Engagement Photography Stories | Vasilis Moumkas",description:"Discover engagement and couple photography stories filled with natural emotion, Mediterranean light and timeless visual storytelling.",image:"/vm_img/Metadata/og-portfolio.jpg",imageAlt:"Engagement photography stories by Vasilis Moumkas"}),
  about:page,
  services:page,
  contact:page,
  education:page,
  business:business.default(defaultBusinessSettings),
});
export type SeoSettings=z.infer<typeof seoSettingsSchema>;
export type SeoPageKey=Exclude<keyof SeoSettings,"business">;
export const SEO_SETTINGS_KEY="website_seo_v1";

export const defaultSeoSettings:SeoSettings={
  portfolio:{title:"Wedding Stories & Photography Portfolio | Vasilis Moumkas",description:"Explore cinematic wedding stories and editorial destination wedding photography by Vasilis Moumkas across Greece, Italy and Europe.",image:"/vm_img/Metadata/og-portfolio.jpg",imageAlt:"Wedding photography portfolio by Vasilis Moumkas"},
  wedding:{title:"Wedding Photography Stories | Vasilis Moumkas",description:"Discover wedding photography stories shaped by genuine emotion, Mediterranean light and refined editorial storytelling across Greece and Italy.",image:"/vm_img/Metadata/og-portfolio.jpg",imageAlt:"Wedding photography stories in Greece and Italy"},
  editorial:{title:"Editorial Photography Stories | Vasilis Moumkas",description:"Explore refined editorial photography stories shaped by fashion, atmosphere and cinematic visual storytelling by Vasilis Moumkas.",image:"/vm_img/Metadata/og-portfolio.jpg",imageAlt:"Editorial photography stories by Vasilis Moumkas"},
  engagement:{title:"Engagement Photography Stories | Vasilis Moumkas",description:"Discover engagement and couple photography stories filled with natural emotion, Mediterranean light and timeless visual storytelling.",image:"/vm_img/Metadata/og-portfolio.jpg",imageAlt:"Engagement photography stories by Vasilis Moumkas"},
  about:{title:"Vasilis Moumkas — Wedding Photographer",description:"Meet Vasilis Moumkas, a wedding photographer creating emotional, cinematic and editorial stories for destination celebrations across Greece and Europe.",image:"/vm_img/Metadata/og-about.jpg",imageAlt:"Vasilis Moumkas wedding photographer"},
  services:{title:"Wedding Photography Services in Greece & Italy | Vasilis Moumkas",description:"Explore bespoke wedding photography services for destination weddings, intimate celebrations and editorial stories throughout Greece and Italy.",image:"/vm_img/Homepage/Metadata/og-services.jpg",imageAlt:"Wedding photography services in Greece and Italy"},
  contact:{title:"Let’s Talk About Your Wedding | Vasilis Moumkas",description:"Contact Vasilis Moumkas to discuss destination wedding photography in Greece, Italy or wherever your celebration takes place.",image:"/vm_img/Metadata/og-contact.jpg",imageAlt:"Contact Vasilis Moumkas about wedding photography"},
  education:{title:"Photography Education & Mentoring | Vasilis Moumkas",description:"Photography education and mentoring by Vasilis Moumkas for photographers developing their wedding storytelling, client experience and creative voice.",image:"/vm_img/Homepage/Metadata/og-services.jpg",imageAlt:"Photography education and mentoring by Vasilis Moumkas"},
  business:defaultBusinessSettings,
};

export async function getSeoSettings():Promise<SeoSettings>{
  if(!isDatabaseConfigured())return defaultSeoSettings;
  try{const[rows]=await getDatabase().query<(RowDataPacket&{value_json:string|Record<string,unknown>})[]>("SELECT value_json FROM site_settings WHERE setting_key=? LIMIT 1",[SEO_SETTINGS_KEY]);if(!rows[0])return defaultSeoSettings;const raw=typeof rows[0].value_json==="string"?JSON.parse(rows[0].value_json):rows[0].value_json;const parsed=seoSettingsSchema.safeParse(raw);return parsed.success?parsed.data:defaultSeoSettings}catch{return defaultSeoSettings}
}

export async function saveSeoSettings(value:SeoSettings){await getDatabase().execute("INSERT INTO site_settings (setting_key,value_json) VALUES (?,?) ON DUPLICATE KEY UPDATE value_json=VALUES(value_json),updated_at=CURRENT_TIMESTAMP",[SEO_SETTINGS_KEY,JSON.stringify(value)])}

export const pageMetadata = publicMetadata;
