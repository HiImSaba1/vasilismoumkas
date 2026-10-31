import type {EmailTemplate} from "./email-templates";
import {initialEmailComposition,serializeEmailComposition,type EmailSection} from "./email-composition";

// Read-only starting draft. Only explicitly saving 010 writes a new, paused variant.
export function buildTestEmailLayout(source:EmailTemplate,images:readonly {src:string;alt:string}[]):EmailTemplate {
  const base=initialEmailComposition(source.bodyText,source.locale,source.id);
  const previousText=base.sections.flatMap(section=>section.type==="text"||section.type==="columns"?[section.title,section.text]:section.type==="button"?[section.label,section.url]:[]).filter(Boolean);
  const paragraphs=[base.introduction,...previousText].filter(Boolean).join("\n\n").split(/\n\s*\n/).filter(Boolean);
  const size=Math.max(1,Math.ceil(paragraphs.length/3));
  const chunks=[paragraphs.slice(0,size).join("\n\n"),paragraphs.slice(size,size*2).join("\n\n"),paragraphs.slice(size*2).join("\n\n")];
  const first=images.find(image=>image.src===source.headerImage)??images[0];
  const alternatives=images.filter(image=>image.src!==first?.src);
  const second=alternatives[0]??first,third=alternatives[1]??second;
  const sections:EmailSection[]=[{id:"test010-image-2",type:"image",image:second?.src??"",alt:second?.alt||"Photography by Vasilis Moumkas"},{id:"test010-text-2",type:"text",title:"",text:chunks[1]??""},{id:"test010-image-3",type:"image",image:third?.src??"",alt:third?.alt||"Photography by Vasilis Moumkas"},{id:"test010-text-3",type:"text",title:"",text:chunks[2]??""}];
  // Very short source messages remain exact; no filler copy is invented.
  const nonempty=sections.filter(section=>section.type!=="text"||Boolean(section.text));
  return {...source,id:"010",name:"TEST — 000 content / three-photo layout",purpose:"Private design experiment copied from 000. Never an automatic workflow email.",triggerDescription:"TEST ONLY — no automation trigger",subject:source.subject,bodyText:serializeEmailComposition({...base,style:"editorial",introduction:chunks[0]??"",imageAlt:first?.alt||base.imageAlt,sections:nonempty}),headerImage:first?.src??source.headerImage,isActive:false,version:0};
}
