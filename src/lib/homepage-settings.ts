import "server-only";
import {getPublishedContentSnapshot,getContentWorkspace,writeContentWorkspace} from "@/lib/content-workspace";
import {z} from "zod";

import {publicCopy} from "@/app/(site)/data/ApprovedPublicCopy";
import {homeServices} from "@/app/(site)/data/ServicesData";
import {TestimonialsData} from "@/app/(site)/data/TestimonialsData";
import {ProjectsData} from "@/app/(site)/data/ProjectsData";
import {HOMEPAGE_BLACK_FOOTER} from "@/app/(site)/data/Pages-Photoset/Homepage";

const localPath=z.string().trim().startsWith("/").max(700);
const safeUrl=z.string().trim().max(1000).refine(value=>value.startsWith("/")||value.startsWith("https://"),"Use an internal /path or https:// URL");
const card=z.object({caption:z.string().max(500).default(""),title:z.string().trim().min(1).max(160),subtitle:z.string().trim().min(1).max(200),ctaLabel:z.string().trim().min(1).max(80).default("View story"),href:localPath,image:localPath,alt:z.string().trim().min(3).max(300)});
const portfolioCard=z.object({caption:z.string().max(500).default(""),title:z.string().trim().min(1).max(160),location:z.string().trim().min(1).max(200),href:safeUrl,image:localPath,alt:z.string().trim().min(3).max(300)});
const service=z.object({title:z.string().trim().min(1).max(100),projectSlug:z.string().trim().min(1).max(190),description:z.string().trim().min(10).max(1200),keywords:z.array(z.string().trim().min(1).max(100)).min(1).max(8),image:localPath});
const testimonial=z.object({caption:z.string().max(500).default(""),couple:z.string().trim().min(1).max(160),location:z.string().trim().min(1).max(180),quote:z.string().trim().min(10).max(1600),image:localPath,alt:z.string().trim().min(3).max(300)});
const marqueeImage=z.union([localPath,z.object({src:localPath,alt:z.string().trim().min(3).max(300),caption:z.string().max(500).default("")})]).transform(value=>typeof value==="string"?{src:value,alt:"Wedding editorial photography by Vasilis Moumkas",caption:""}:value);
const defaultPortfolioCards=ProjectsData.filter(project=>project.category==="Wedding").slice(0,2).map(project=>({caption:"",title:project.title,location:project.location,href:`/portfolio/project/${project.slug}`,image:project.thumbnail,alt:`${project.title} wedding photography in ${project.location}`}));
const defaultFeaturedEditorial={eyebrow:"Selected stories",title:"Love, light & legacy",subtitle:"Three celebrations shaped by place, emotion and the quiet beauty found between the defining moments.",items:[{title:"Documenting love",subtitle:"Honest gestures and modern romance, preserved with an editorial sensitivity."},{title:"Following light",subtitle:"Celebrations shaped by landscape, atmosphere and the unmistakable light of Greece."},{title:"Creating legacy",subtitle:"Timeless photographs that hold the feeling of the day long after it has passed."}]};

const defaultMarqueeCopy={lines:publicCopy.homeStyle,destinations:publicCopy.homeDestinations,keywords:["Family","Destination","Portraits","Thessaloniki","Wedding ","Photographer"]};
export const homepageSettingsSchema=z.object({
  marqueeCopy:z.object({lines:z.array(z.string().min(1).max(500)).length(2),destinations:z.string().min(1).max(600),keywords:z.array(z.string().min(1).max(80)).length(6)}).default(defaultMarqueeCopy),
  footerCtaLines:z.array(z.string().min(1).max(500)).length(2).default(publicCopy.homeCta),
  seo:z.object({title:z.string().trim().min(5).max(160),description:z.string().trim().min(20).max(500),image:localPath.default("/vm_img/Metadata/og-main.jpg"),imageAlt:z.string().trim().min(3).max(300).default("Luxury wedding photography by Vasilis Moumkas in Greece and Italy")}),
  hero:z.object({imageCaption:z.string().max(500).default(""),headlineEditorial:z.string().trim().min(1).max(160).default("EDITORIAL"),headlineWedding:z.string().trim().min(1).max(160).default("WEDDING"),headlinePhotography:z.string().trim().min(1).max(160).default("PHOTOGRAPHY"),headlineAcross:z.string().trim().min(1).max(160).default("ACROSS"),headlineDestinations:z.string().trim().min(1).max(160).default("GREECE & ITALY"),accessibleTitle:z.string().trim().min(1).max(160).default("Wedding Photographer in Greece & Italy"),desktopImage:localPath,mobileImage:localPath,projectHref:localPath,imageAlt:z.string().trim().min(3).max(300),topLeft:z.string().trim().min(1).max(80),topCenter:z.string().trim().min(1).max(80),topRight:z.string().trim().min(1).max(80),bottomLeft:z.string().trim().min(1).max(120),bottomRight:z.string().trim().min(1).max(120)}),
  featuredCards:z.array(card).length(3),
  featuredEditorial:z.object({eyebrow:z.string().trim().min(1).max(100),title:z.string().trim().min(2).max(240),subtitle:z.string().trim().min(10).max(600),items:z.array(z.object({title:z.string().trim().min(2).max(180),subtitle:z.string().trim().min(10).max(500)})).length(3)}).default(defaultFeaturedEditorial),
  services:z.object({eyebrow:z.string().trim().min(1).max(100),intro:z.string().trim().min(10).max(800),items:z.array(service).length(3)}),
  portfolio:z.object({title:z.string().trim().min(2).max(160),subtitle:z.string().trim().max(500).default(""),buttonLabel:z.string().trim().min(1).max(100),buttonHref:localPath,items:z.array(portfolioCard).length(2).default(defaultPortfolioCards)}),
  story:z.object({eyebrow:z.string().trim().min(2).max(400),title:z.string().trim().min(10).max(1800),buttonLabel:z.string().trim().min(1).max(100),buttonHref:localPath,videoUrl:safeUrl}),
  marqueeImages:z.array(marqueeImage).length(12).default(HOMEPAGE_BLACK_FOOTER.slice(0,12).map((src,index)=>({caption:"",src,alt:`Wedding editorial story ${index+1} by Vasilis Moumkas`}))),
  testimonials:z.object({title:z.string().trim().min(2).max(120),items:z.array(testimonial).min(1).max(12)}),
});
export type HomepageSettings=z.infer<typeof homepageSettingsSchema>;
export const HOMEPAGE_SETTINGS_KEY="homepage_content_v1";

export const defaultHomepageSettings=homepageSettingsSchema.parse({
  seo:{title:"Vasilis Moumkas Photography | Weddings in Greece & Italy",description:"Luxury fine-art wedding photography in Greece, the Greek islands and Italy by Vasilis Moumkas.",image:"/vm_img/Metadata/og-main.jpg",imageAlt:"Luxury wedding photography by Vasilis Moumkas in Greece and Italy"},
  hero:{headlineEditorial:"EDITORIAL",headlineWedding:"WEDDING",headlinePhotography:"PHOTOGRAPHY",headlineAcross:"ACROSS",headlineDestinations:"GREECE & ITALY",accessibleTitle:"Wedding Photographer in Greece & Italy",desktopImage:"/uploads/portfolio/natasa-stamatis/b85c1421-3758-44f5-bc57-d6b5bf761807.webp",mobileImage:"/uploads/portfolio/natasa-stamatis/7099163a-198e-4cf5-ab4c-799e6ae5757a.webp",projectHref:"/portfolio/project/natasa-stamatis",imageAlt:"Natasa and Stamatis wedding photography",topLeft:"For modern",topCenter:"Romantic souls",topRight:"Emotional & timeless",bottomLeft:"Scroll for portraits",bottomRight:"with passion & elegance"},
  featuredCards:[
    {title:"Suzanna & Alexis",subtitle:"Greece",ctaLabel:"View story",href:"/portfolio/project/suzanna-alexis",image:"/uploads/portfolio/suzanna-alexis/aac71937-16fa-49a4-b564-0e4ab82563b6.webp",alt:"Suzanna and Alexis wedding photography in Greece"},
    {title:"Kim & Lee",subtitle:"Santorini Island, Greece",ctaLabel:"View story",href:"/portfolio/project/kim-lee",image:"/vm_img/Projects/Kim_Lee/vasilis_moumkas_kim_lee_2.webp",alt:"Kim and Lee wedding photography in Santorini"},
    {title:"Eva & George",subtitle:"Greece",ctaLabel:"View story",href:"/portfolio/project/eva-george",image:"/uploads/portfolio/eva-george/6276177f-1335-488b-8546-ffe92398f7c6.webp",alt:"Eva and George wedding photography in Greece"},
  ],
  featuredEditorial:defaultFeaturedEditorial,
  services:{eyebrow:"Expertise",intro:"Capturing the art of human connection through a lens of sophistication transforming moments into a permanent visual legacy.",items:homeServices.map(item=>({title:item.title,projectSlug:item.projectSlug,description:item.description,keywords:item.keywords,image:item.image}))},
  portfolio:{title:"A CLOSER LOOK AT THE CELEBRATIONS",subtitle:"",buttonLabel:"Full Portfolio",buttonHref:"/portfolio",items:defaultPortfolioCards},
  story:{eyebrow:"Luxury Fine Art Wedding Photography in Greece. For modern souls. Quiet. Emotional. Timeless",title:"For couples who value emotion, elegance, and authenticity. I am Vasilis Moumkas, a luxury destination wedding photographer based in Thessaloniki, Greece. I document refined celebrations across Santorini, Mykonos, Naxos, and Italy from Lake Como and Tuscany to the Amalfi Coast. I also specialise in intimate elopements across the Greek islands. With a calm, intuitive eye, I transform fleeting feelings into timeless artistry. Because these are not just photographs, they are your legacy.",buttonLabel:"Learn More",buttonHref:"/about",videoUrl:"https://player.vimeo.com/video/1159684670?h=ac91465937&autoplay=1&muted=1&loop=1&background=1&badge=0&autopause=0&quality=1080p"},
  marqueeImages:HOMEPAGE_BLACK_FOOTER.slice(0,12).map((src,index)=>({caption:"",src,alt:`Wedding editorial story ${index+1} by Vasilis Moumkas`})),
  testimonials:{title:"Wedding photography reviews from our couples",items:TestimonialsData.map(item=>({couple:item.couple,location:item.location,quote:item.quote,image:item.profileImage,alt:`${item.couple} wedding testimonial portrait`}))},
});


export async function getHomepageSnapshot(){
  const snapshot=await getPublishedContentSnapshot(HOMEPAGE_SETTINGS_KEY,defaultHomepageSettings);
  return {content:homepageSettingsSchema.parse(snapshot.content),version:snapshot.version};
}
export async function getHomepageSettings():Promise<HomepageSettings>{
  try{return(await getHomepageSnapshot()).content}catch{return defaultHomepageSettings}
}
export async function saveHomepageSettings(value:HomepageSettings,expectedVersion:string){
  const work=await getContentWorkspace(HOMEPAGE_SETTINGS_KEY);
  await writeContentWorkspace({key:HOMEPAGE_SETTINGS_KEY,content:homepageSettingsSchema.parse(value),expectedVersion,expectedWorkspaceVersion:work.version,mode:"publish",fallback:defaultHomepageSettings,preserveDraft:true});
}
