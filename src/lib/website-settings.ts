import "server-only";
import type {RowDataPacket} from "mysql2/promise";
import {z} from "zod";
import {getDatabase,isDatabaseConfigured} from "@/lib/database";
import {ProjectsData} from "@/app/(site)/data/ProjectsData";
import {faqBaptismOfferData,faqOfferData} from "@/app/(site)/data/FaqOfferData";
import {baptismProposalMainImages,baptismProposalSmallImages,weddingProposalMainImages,weddingProposalSmallImages} from "@/app/(site)/data/proposal-image-sequence";
import {HOMEPAGE_WHITE_FOOTER} from "@/app/(site)/data/Pages-Photoset/Homepage";

const localPath=z.string().trim().startsWith("/").max(700);
const safeUrl=z.string().trim().max(1000).refine(value=>value.startsWith("/")||value.startsWith("https://"),"Use an internal /path or https:// URL");
const localized=z.object({en:z.string().trim().min(1).max(4000),gr:z.string().trim().min(1).max(4000)});
const image=z.object({src:localPath,alt:z.string().trim().min(3).max(300)});
const project=z.object({title:z.string().trim().min(1).max(160),location:z.string().trim().min(1).max(200),href:safeUrl,image:localPath,alt:z.string().trim().min(3).max(300)});
const faq=z.object({date:z.string().trim().min(1).max(120),question:z.string().trim().min(2).max(500),answer:z.string().trim().min(5).max(4000)});
const languageFaq=z.object({title:z.string().trim().min(2).max(300),intro:z.string().trim().min(10).max(1200),items:z.array(faq).min(1).max(16)});
const offer=z.object({
  heroImage:image,
  heroLabel:localized,
  heroIntro:localized,
  collectionImages:z.array(image).length(3),
  gallery:z.object({eyebrow:localized,title:localized,images:z.array(image).length(3)}),
  projects:z.object({title:localized,buttonLabel:localized,buttonHref:safeUrl,items:z.array(project).length(2)}),
  faq:z.object({en:languageFaq,gr:languageFaq}),
});
export const websiteSettingsSchema=z.object({
  contact:z.object({image:image}),
  footer:z.object({images:z.array(image).min(3).max(12)}),
  offers:z.object({wedding:offer,baptism:offer}),
});
export type WebsiteSettings=z.infer<typeof websiteSettingsSchema>;
export type OfferWebsiteContent=WebsiteSettings["offers"]["wedding"];
export const WEBSITE_SETTINGS_KEY="website_content_v1";

const projectDefaults=(category:"Wedding"|"Baptism")=>ProjectsData.filter(item=>item.category===category).slice(0,2).map(item=>({title:item.title,location:item.location,href:`/portfolio/project/${item.slug}`,image:item.thumbnail,alt:`${item.title} ${category.toLowerCase()} photography in ${item.location}`}));
const faqDefaults=(source:typeof faqOfferData)=>({
  en:{title:"The Process & FAQ",intro:"Discover the process we follow together and clear answers to the questions clients ask most often.",items:source.en},
  gr:{title:"Η Διαδικασία & Συχνές Ερωτήσεις",intro:"Δείτε τη διαδικασία που ακολουθούμε μαζί και σαφείς απαντήσεις στις πιο συχνές ερωτήσεις των πελατών.",items:source.gr},
});

export const defaultWebsiteSettings:WebsiteSettings={
  contact:{image:{src:"/vm_img/Preloader/vasilis_moumkas_services_hero_2.webp",alt:"Vasilis Moumkas luxury wedding photography consultation"}},
  footer:{images:HOMEPAGE_WHITE_FOOTER.slice(0,10).map((src,index)=>({src,alt:`Vasilis Moumkas wedding photography portfolio ${index+1}`}))},
  offers:{
    wedding:{
      heroImage:weddingProposalMainImages[0],heroLabel:{en:"(Private Wedding Offer)",gr:"(Ιδιωτική Προσφορά Γάμου)"},
      heroIntro:{en:"First, thank you for inviting me into your story. Your wedding is more than a sequence of events; it is a collection of feelings. Beyond the aesthetic of the day, I focus on the heartbeat of your story capturing the quiet glances and the overwhelming joy with an editorial eye. Below, you will find the collections I have curated specifically for your celebration.",gr:"Σας ευχαριστώ θερμά για το ενδιαφέρον σας και για την ευκαιρία να γίνω μέρος μιας τόσο ξεχωριστής ημέρας. Ο γάμος σας είναι μια μοναδική ιστορία γεμάτη συναίσθημα, αυθεντικές στιγμές και πολύτιμες αναμνήσεις. Στις επόμενες σελίδες θα βρείτε τις διαθέσιμες συλλογές φωτογράφισης."},
      collectionImages:weddingProposalMainImages.slice(1,4),
      gallery:{eyebrow:{en:"Wedding stories",gr:"Ιστορίες γάμου"},title:{en:"Editorial moments, honest connection",gr:"Editorial στιγμές, αληθινή σύνδεση"},images:weddingProposalSmallImages.slice(0,3)},
      projects:{title:{en:"Best of Wedding Portfolio works",gr:"Επιλεγμένες ιστορίες γάμου"},buttonLabel:{en:"Full Portfolio",gr:"Portfolio"},buttonHref:"/portfolio",items:projectDefaults("Wedding")},faq:faqDefaults(faqOfferData),
    },
    baptism:{
      heroImage:baptismProposalMainImages[0],heroLabel:{en:"(Private Baptism Offer)",gr:"(Ιδιωτική Προσφορά Βάπτισης)"},
      heroIntro:{en:"The day of the baptism is a story full of light, tenderness, and authentic moments turning into precious memories for a lifetime. My approach is based on a fine-art photojournalistic style, capturing this significant day as it unfolds naturally, with elegance, truth, and a timeless aesthetic.",gr:"Η ημέρα της βάπτισης είναι μια ιστορία γεμάτη φως, τρυφερότητα και αυθεντικές στιγμές που μετατρέπονται σε πολύτιμες αναμνήσεις για μια ζωή. Η προσέγγισή μου βασίζεται στο fine-art photojournalistic ύφος, με κομψότητα, αλήθεια και διαχρονική αισθητική."},
      collectionImages:baptismProposalMainImages.slice(1,3).concat(baptismProposalSmallImages.slice(0,1)),
      gallery:{eyebrow:{en:"Details of the day",gr:"Λεπτομέρειες της ημέρας"},title:{en:"Small moments, one meaningful story",gr:"Μικρές στιγμές, μεγάλη ιστορία"},images:baptismProposalSmallImages.slice(0,3)},
      projects:{title:{en:"Best of Baptism Portfolio works",gr:"Επιλεγμένες ιστορίες βάπτισης"},buttonLabel:{en:"Full Portfolio",gr:"Portfolio"},buttonHref:"/portfolio",items:projectDefaults("Baptism")},faq:faqDefaults(faqBaptismOfferData),
    },
  },
};

export async function getWebsiteSettings():Promise<WebsiteSettings>{
  if(!isDatabaseConfigured())return defaultWebsiteSettings;
  try{const[rows]=await getDatabase().query<(RowDataPacket&{value_json:string|Record<string,unknown>})[]>("SELECT value_json FROM site_settings WHERE setting_key=? LIMIT 1",[WEBSITE_SETTINGS_KEY]);if(!rows[0])return defaultWebsiteSettings;const raw=typeof rows[0].value_json==="string"?JSON.parse(rows[0].value_json):rows[0].value_json;const parsed=websiteSettingsSchema.safeParse(raw);return parsed.success?parsed.data:defaultWebsiteSettings}catch{return defaultWebsiteSettings}
}
export async function saveWebsiteSettings(value:WebsiteSettings){await getDatabase().execute("INSERT INTO site_settings (setting_key,value_json) VALUES (?,?) ON DUPLICATE KEY UPDATE value_json=VALUES(value_json),updated_at=CURRENT_TIMESTAMP",[WEBSITE_SETTINGS_KEY,JSON.stringify(value)])}
