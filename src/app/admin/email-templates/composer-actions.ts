"use server";
import {inlineEmailBrandAssets} from "@/lib/email-inline-assets";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { getClient } from "@/lib/clients";
import { getLead } from "@/lib/leads";
import { getLatestOfferForLead } from "@/lib/offers";
import { getPortalForLead } from "@/lib/client-portals";
import { getEmailTemplate,renderEditedEmail } from "@/lib/email-templates";
import { listPortfolioEmailImages } from "@/lib/portfolio";
import { getSmtpTransport,smtpConfigured } from "@/lib/email-delivery";
import { assertRenderedEmail,assertResolvedEmail,assertEmailSectionImages,assertCompositionDestination,readEmailComposition } from "@/lib/email-composition";

// Deliberately bypasses tracked customer deliveries and all workflow reconciliation.
export async function sendComposerTestAction(_state:{success:boolean;message:string},formData:FormData){
  try{
    await requireAdmin();
    if(!smtpConfigured())throw new Error("SMTP is disabled.");
    const input=z.object({entityField:z.enum(["id","clientId"]),id:z.uuid().optional(),clientId:z.uuid().optional(),templateId:z.string().regex(/^00\d$/),locale:z.enum(["el","en"]),subject:z.string().trim().min(1).max(500),bodyText:z.string().min(1).max(50000),headerImage:z.string().max(700)}).parse(Object.fromEntries(formData));
    const record=input.entityField==="clientId"&&input.clientId?await getClient(input.clientId):input.entityField==="id"&&input.id?await getLead(input.id):null;
    if(!record)throw new Error("Record not found.");
    const leadId=input.entityField==="clientId"?("leadId" in record?record.leadId:null):record.id;
    const[offer,portal,images,template]=await Promise.all([leadId?getLatestOfferForLead(leadId):null,leadId?getPortalForLead(leadId):null,listPortfolioEmailImages(),getEmailTemplate(input.templateId,record.eventType,input.locale)]);
    if(!template?.isActive)throw new Error("Template unavailable.");
    if(input.headerImage&&!images.some(image=>image.src===input.headerImage))throw new Error("Choose a portfolio image.");
    assertEmailSectionImages(input.bodyText,images);assertCompositionDestination(input.bodyText,Boolean(offer),Boolean(portal));assertResolvedEmail(input.subject,input.bodyText);
    const content=readEmailComposition(input.bodyText);
    if(content?.destination==="offer"&&!offer||content?.destination==="portal"&&!portal)throw new Error("The selected connected link is missing.");
    const origin=(process.env.NEXT_PUBLIC_SITE_URL||"https://vasilismoumkas.com").replace(/\/$/,"");
    const outgoing=renderEditedEmail(input.subject,input.bodyText,input.locale,{email_event_type:record.eventType,offer_url:offer?`${origin}/offer/${offer.slug}`:"",portal_url:portal?`${origin}/portal/${portal.slug}`:"",email_header_image:input.headerImage});
    assertRenderedEmail(outgoing);
    const recipient=z.email().parse(process.env.INTERNAL_NOTIFICATION_EMAIL?.trim()||process.env.INQUIRY_NOTIFICATION_EMAIL?.trim()||process.env.OWNER_REPLY_EMAIL?.trim()||"vasilis.moumkas@gmail.com");
    const from=process.env.SMTP_FROM_EMAIL||process.env.SMTP_USERNAME;
    const mime=await inlineEmailBrandAssets(outgoing.html);
    await getSmtpTransport().sendMail({from:`Vasilis Moumkas <${from}>`,to:recipient,subject:`[TEST ${template.id} · ${template.locale}] ${outgoing.subject}`,html:mime.html,text:outgoing.text,attachments:mime.attachments});
    return{success:true,message:`Test sent to ${recipient}. No client delivery, workflow or automation was changed.`};
  }catch(error){return{success:false,message:error instanceof Error?error.message:"Test delivery failed."}}
}
