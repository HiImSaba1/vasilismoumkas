import { brandedEmailSubject,assertResolvedEmail,resolveEmailBody,localizedEmailDate,readEmailComposition } from "./email-composition";
import "server-only";
import {approvedEmailLayout} from "./approved-email-layout";
import {serializeEmailComposition} from "./email-composition";
import type { RowDataPacket } from "mysql2/promise";
import { getDatabase } from "@/lib/database";
import { renderEmailDocument,renderEmailText,type EmailRenderLocale } from "@/lib/email-renderer";

export type EmailTemplateEventType = "wedding" | "baptism";
export type EmailTemplateLocale = "el" | "en";
export type EmailTemplate={id:string;eventType:EmailTemplateEventType;locale:EmailTemplateLocale;name:string;purpose:string;subject:string;bodyHtml:string;bodyText:string;headerImage:string|null;allowedPlaceholders:string[];triggerDescription:string;isActive:boolean;version:number;updatedAt:string};
type TemplateRow=RowDataPacket&{id:string;event_type?:EmailTemplateEventType;locale?:EmailTemplateLocale;name:string;purpose:string|null;subject:string;body_html:string;body_text:string;header_image:string|null;allowed_placeholders:string|string[];trigger_description:string|null;is_active:number;version:number;updated_at:string|Date};

export function normalizeTemplateEventType(value?:string|null):EmailTemplateEventType{return value==="baptism"?"baptism":"wedding"}
export function normalizeTemplateLocale(value?:string|null):EmailTemplateLocale{return value==="en"?"en":"el"}
const map=(row:TemplateRow,eventType:EmailTemplateEventType,locale:EmailTemplateLocale):EmailTemplate=>({id:row.id,eventType:row.event_type??eventType,locale:row.locale??locale,name:row.name,purpose:row.purpose??"",subject:row.subject,bodyHtml:row.body_html,bodyText:row.body_text,headerImage:row.header_image??null,allowedPlaceholders:typeof row.allowed_placeholders==="string"?JSON.parse(row.allowed_placeholders):row.allowed_placeholders,triggerDescription:row.trigger_description??"",isActive:Boolean(row.is_active),version:Number(row.version),updatedAt:new Date(row.updated_at).toISOString()});

export async function listEmailTemplates(eventType:EmailTemplateEventType="wedding",locale:EmailTemplateLocale="el"){
  const[rows]=await getDatabase().query<TemplateRow[]>("SELECT template_id id,event_type,locale,name,purpose,subject,body_html,body_text,header_image,allowed_placeholders,trigger_description,is_active,version,updated_at FROM email_template_variants WHERE event_type=? AND locale=? ORDER BY template_id",[eventType,locale]);
  if(rows.length)return rows.map(row=>map(row,eventType,locale));
  const[legacy]=await getDatabase().query<TemplateRow[]>("SELECT * FROM email_templates ORDER BY id");
  return legacy.map(row=>map(row,eventType,locale));
}
export async function listAllEmailTemplates(){
  const[rows]=await getDatabase().query<TemplateRow[]>("SELECT template_id id,event_type,locale,name,purpose,subject,body_html,body_text,header_image,allowed_placeholders,trigger_description,is_active,version,updated_at FROM email_template_variants ORDER BY event_type,locale,template_id");
  if(rows.length)return rows.map(row=>map(row,row.event_type??"wedding",row.locale??"el"));
  return listEmailTemplates();
}
export async function getEmailTemplate(id:string,eventType:EmailTemplateEventType="wedding",locale:EmailTemplateLocale="el"){
  const[rows]=await getDatabase().query<TemplateRow[]>("SELECT template_id id,event_type,locale,name,purpose,subject,body_html,body_text,header_image,allowed_placeholders,trigger_description,is_active,version,updated_at FROM email_template_variants WHERE template_id=? AND event_type=? AND locale=? LIMIT 1",[id,eventType,locale]);
  if(rows[0])return map(rows[0],eventType,locale);
  const[legacy]=await getDatabase().query<TemplateRow[]>("SELECT * FROM email_templates WHERE id=? LIMIT 1",[id]);
  return legacy[0]?map(legacy[0],eventType,locale):null;
}
function textToHtml(input:string){const escaped=input.replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[char]!);return escaped.split(/\n{2,}/).map(block=>`<p>${block.replaceAll("\n","<br>")}</p>`).join("\n").replace(/{{\s*([a-z0-9_]+_url)\s*}}/gi,'<a href="{{$1}}">{{$1}}</a>').replace(/https?:\/\/[^\s<]+/gi,url=>`<a href="${url}" style="color:#221f20;text-decoration:underline">${url}</a>`)}
export async function updateEmailTemplate(id:string,eventType:EmailTemplateEventType,locale:EmailTemplateLocale,input:{subject:string;bodyText:string;headerImage:string|null;isActive:boolean}){const current=await getEmailTemplate(id,eventType,locale);if(!current)throw new Error("Template not found");await getDatabase().execute("UPDATE email_template_variants SET subject=?,body_text=?,body_html=?,header_image=?,is_active=?,version=version+1 WHERE template_id=? AND event_type=? AND locale=?",[input.subject,input.bodyText,readEmailComposition(input.bodyText)?renderEmailDocument(input.bodyText,{locale,headerImageUrl:input.headerImage??undefined}):textToHtml(input.bodyText),input.headerImage,input.isActive?1:0,id,eventType,locale])}
export function placeholdersIn(value:string){return[...value.matchAll(/{{\s*([a-z0-9_]+)\s*}}/gi)].map(match=>match[1])}
export async function applyEmailCollectionStyle(eventType:EmailTemplateEventType,locale:EmailTemplateLocale,expected:{id:string;version:number}[]){
  const connection=await getDatabase().getConnection();
  try{
    await connection.beginTransaction();
    const[rows]=await connection.query<TemplateRow[]>("SELECT template_id id,event_type,locale,name,purpose,subject,body_html,body_text,header_image,allowed_placeholders,trigger_description,is_active,version,updated_at FROM email_template_variants WHERE event_type=? AND locale=? AND template_id REGEXP '^00[0-9]$' ORDER BY template_id FOR UPDATE",[eventType,locale]);
    if(rows.length!==expected.length||rows.some(row=>!expected.some(item=>item.id===row.id&&item.version===Number(row.version))))throw new Error("A template changed since this page opened. Reload before applying the collection style.");
    for(const row of rows){const template=map(row,eventType,locale);const body=serializeEmailComposition(approvedEmailLayout(template));const html=renderEmailDocument(body,{locale,headerImageUrl:template.headerImage??undefined});await connection.execute("UPDATE email_template_variants SET body_text=?,body_html=?,version=version+1 WHERE template_id=? AND event_type=? AND locale=?",[body,html,template.id,eventType,locale])}
    await connection.commit();return rows.length;
  }catch(error){await connection.rollback();throw error}finally{connection.release()}
}
export async function saveTestEmailLayout(eventType:EmailTemplateEventType,locale:EmailTemplateLocale,input:{subject:string;bodyText:string;headerImage:string|null}){
  const html=renderEmailDocument(input.bodyText,{locale,headerImageUrl:input.headerImage??undefined});
  const allowed=JSON.stringify([...new Set([...placeholdersIn(input.subject),...placeholdersIn(input.bodyText)])]);
  const connection=await getDatabase().getConnection();
  try{
    await connection.beginTransaction();
    await connection.execute("INSERT INTO email_templates (id,name,purpose,subject,body_html,body_text,allowed_placeholders,trigger_description,is_active) VALUES ('010',?,?,?,?,?,?,?,0) ON DUPLICATE KEY UPDATE id=VALUES(id)",["TEST — three-photo layout","Test only",input.subject,html,input.bodyText,allowed,"No automation trigger"]);
    await connection.execute("INSERT INTO email_template_variants (template_id,event_type,locale,name,purpose,subject,body_html,body_text,header_image,allowed_placeholders,trigger_description,is_active) VALUES ('010',?,?,?,?,?,?,?,?,?,?,0) ON DUPLICATE KEY UPDATE subject=VALUES(subject),body_html=VALUES(body_html),body_text=VALUES(body_text),header_image=VALUES(header_image),allowed_placeholders=VALUES(allowed_placeholders),is_active=0,version=version+1",[eventType,locale,"TEST — 000 content / three-photo layout","Test only",input.subject,html,input.bodyText,input.headerImage,allowed,"No automation trigger"]);
    await connection.commit();
  }catch(error){await connection.rollback();throw error}finally{connection.release()}
}
function renderOptions(locale:EmailRenderLocale,values:Record<string,string>,headerImage?:string|null){return{locale,siteUrl:process.env.NEXT_PUBLIC_SITE_URL,headerImageUrl:headerImage??process.env.NEXT_PUBLIC_EMAIL_HEADER_IMAGE_URL,offerUrl:values.offer_url,portalUrl:values.portal_url,galleryUrl:values.wedding_gallery_url||values.baptism_gallery_url||values.recent_gallery_url}}
export function renderTemplate(template:EmailTemplate,values:Record<string,string>){const resolved:Record<string,string>={...values};resolved.couple_names=resolved.couple_names?.trim()||resolved.parents_names?.trim()||"";resolved.parents_names=resolved.parents_names?.trim()||resolved.couple_names;resolved.child_name=resolved.child_name?.trim()||resolved.first_name?.trim()||resolved.couple_names;resolved.event_date=resolved.event_date?.trim()||resolved.wedding_date?.trim()||"";resolved.wedding_date=resolved.wedding_date?.trim()||resolved.event_date;resolved.recent_gallery_url=resolved.recent_gallery_url?.trim()||process.env.NEXT_PUBLIC_RECENT_GALLERY_URL?.trim()||"https://vasilismoumkas.pixieset.com/stamatisandnatasa/";resolved.baptism_gallery_url=resolved.baptism_gallery_url?.trim()||resolved.recent_gallery_url;resolved.event_date=localizedEmailDate(resolved.event_date,template.locale);resolved.wedding_date=localizedEmailDate(resolved.wedding_date,template.locale);const required=[...new Set([...placeholdersIn(template.subject),...placeholdersIn(template.bodyText)])];const missing=required.filter(key=>!resolved[key]?.trim());if(missing.length)throw new Error(`Missing placeholders: ${missing.join(", ")}`);const replace=(value:string)=>value.replace(/{{\s*([a-z0-9_]+)\s*}}/gi,(_match,key)=>resolved[key]??"");const bodyText=resolveEmailBody(template.bodyText,resolved);assertResolvedEmail(replace(template.subject),bodyText);return{subject:brandedEmailSubject(replace(template.subject),template.eventType),bodyText,text:renderEmailText(bodyText,renderOptions(template.locale,resolved,template.headerImage)),html:renderEmailDocument(bodyText,renderOptions(template.locale,resolved,template.headerImage))}}
export function renderEditedEmail(subject:string,bodyText:string,locale?:EmailRenderLocale,values:Record<string,string>={}){const clean=bodyText.trim();assertResolvedEmail(subject,clean);const urls=[...clean.matchAll(/https?:\/\/[^\s<]+/gi)].map(match=>match[0].replace(/[),.;!?]+$/g,""));const resolvedLocale=locale??(/[\u0370-\u03ff]/.test(`${subject} ${clean}`)?"el":"en");const resolvedValues={...values,offer_url:values.offer_url||urls.find(url=>/\/offer\//i.test(url))||"",portal_url:values.portal_url||urls.find(url=>/\/portal\//i.test(url))||"",recent_gallery_url:values.recent_gallery_url||urls.find(url=>/pixieset|\/gallery\//i.test(url))||""};return{subject:values.email_event_type?brandedEmailSubject(subject,values.email_event_type==="baptism"?"baptism":"wedding"):subject.trim(),bodyText:clean,text:renderEmailText(clean,renderOptions(resolvedLocale,resolvedValues,values.email_header_image)),html:renderEmailDocument(clean,renderOptions(resolvedLocale,resolvedValues,values.email_header_image))}}
