import "server-only";
import type { EmailTemplate } from "@/lib/email-templates";
import type { Lead } from "@/lib/leads";
import type { OfferRecord } from "@/lib/offers";

type PortalSummary={leadId:string|null;clientId:string;slug:string;status:string};
const replace=(value:string,values:Record<string,string>)=>value.replace(/{{\s*([a-z0-9_]+)\s*}}/gi,(_match,key)=>values[key]||`[MISSING: ${key}]`);

export function personalizedLeadTemplates(all:EmailTemplate[],lead:Lead,offer:OfferRecord|null,portal:PortalSummary|null){
  const origin=(process.env.NEXT_PUBLIC_SITE_URL??"http://localhost:3000").replace(/\/$/,"");
  const offerUrl=offer?`${origin}/offer/${offer.slug}`:"";
  const portalUrl=portal?`${origin}/portal/${portal.slug}`:"";
  const firstName=lead.coupleNames.split(/\s+(?:and|και|&)\s+/i)[0]?.trim()||lead.coupleNames;
  const values={couple_names:lead.coupleNames,parents_names:lead.coupleNames,child_name:firstName,first_name:firstName,event_date:lead.eventDate??"",wedding_date:lead.eventDate??"",ceremony_location:lead.ceremonyLocation??"",reception_location:lead.receptionLocation??"",offer_url:offerUrl,portal_url:portalUrl,questionnaire_url:portalUrl?`${portalUrl}?tab=questionnaire`:"",agreement_url:portalUrl?`${portalUrl}?tab=contract`:"",invoice_url:portalUrl?`${portalUrl}?tab=invoice`:"",timeline_url:"",recent_gallery_url:process.env.NEXT_PUBLIC_RECENT_GALLERY_URL??"https://vasilismoumkas.pixieset.com/stamatisandnatasa/",baptism_gallery_url:process.env.NEXT_PUBLIC_RECENT_GALLERY_URL??"https://vasilismoumkas.pixieset.com/stamatisandnatasa/"};
  const locale=lead.workflowLocale??(offer?.language==="en"?"en":"el");
  return all.filter(item=>item.isActive&&item.eventType===lead.eventType&&item.locale===locale).map(item=>({...item,subject:replace(item.subject,values),bodyText:replace(item.bodyText,values)}));
}
