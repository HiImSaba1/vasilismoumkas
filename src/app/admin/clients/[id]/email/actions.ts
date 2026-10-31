"use server";
import { assertResolvedEmail,assertCompositionDestination,assertEmailSectionImages,readEmailComposition } from "@/lib/email-composition";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { getClient } from "@/lib/clients";
import { sendTrackedEmail,smtpConfigured } from "@/lib/email-delivery";
import { getEmailTemplate,renderEditedEmail,renderTemplate,updateEmailTemplate } from "@/lib/email-templates";
import { getLatestOfferForLead } from "@/lib/offers";
import { getPortalForLead } from "@/lib/client-portals";
import { revalidateAdminWorkflow } from "@/lib/admin-workflow-revalidation";
import { reconcileAutomationAfterDeliveredTemplate,scheduleManualEmail } from "@/lib/automations";
import { getInvoicePaymentSummary } from "@/lib/invoice-payments";
import { clientEmailFinancialValues,withClientFinancialParagraph } from "@/lib/client-email-financials";
import { listPortfolioEmailImages } from "@/lib/portfolio";
import { athensLocalToUtcSql } from "@/lib/athens-time";

export type ClientEmailSendState={success:boolean;message:string;deliveryId?:string};

export async function updateClientTemplateHeaderImageAction(_state:unknown,formData:FormData){
  try{
    await requireAdmin();
    const input=z.object({clientId:z.uuid(),templateId:z.string().regex(/^\d{3}$/),locale:z.enum(["el","en"]),headerImage:z.string().trim().max(700)}).parse(Object.fromEntries(formData));
    const[client,images]=await Promise.all([getClient(input.clientId),listPortfolioEmailImages()]);
    if(!client)throw new Error("Client not found.");
    if(input.headerImage&&!images.some(image=>image.src===input.headerImage))throw new Error("Select an image from the portfolio library.");
    const template=await getEmailTemplate(input.templateId,client.eventType,input.locale);
    if(!template)throw new Error("Email template not found.");
    await updateEmailTemplate(template.id,template.eventType,template.locale,{subject:template.subject,bodyText:template.bodyText,headerImage:input.headerImage||null,isActive:template.isActive});
    revalidatePath(`/admin/clients/${client.id}/email`);
    revalidatePath("/admin/email-templates");
    return{success:true,message:`Template ${template.id} image updated.`,headerImage:input.headerImage};
  }catch(error){return{success:false,message:error instanceof z.ZodError?(error.issues[0]?.message??"Invalid image selection."):error instanceof Error?error.message:"Unable to update template image."}}
}

export async function sendClientEmailAction(_state:ClientEmailSendState,formData:FormData):Promise<ClientEmailSendState>{
  try{
    await requireAdmin();
    if(!smtpConfigured())throw new Error("SMTP is disabled.");
    const input=z.object({clientId:z.uuid(),templateId:z.string().regex(/^00\d$/),locale:z.enum(["el","en"]),idempotencyKey:z.uuid(),recipient:z.email().max(320),subject:z.string().trim().min(1).max(500),bodyText:z.string().trim().min(1).max(50000),headerImage:z.string().trim().max(700),deliveryAction:z.enum(["send","schedule"]),scheduledFor:z.string().max(40).optional()}).parse(Object.fromEntries(formData));
    const client=await getClient(input.clientId);
    if(!client?.email)throw new Error("Client email is missing.");
    if(input.recipient.toLowerCase()!==client.email.toLowerCase())throw new Error("The recipient no longer matches this client. Refresh the page and try again.");
    const[offer,portal,images]=await Promise.all([client.leadId?getLatestOfferForLead(client.leadId):null,client.leadId?getPortalForLead(client.leadId):null,listPortfolioEmailImages()]);
    if(input.headerImage&&!images.some(image=>image.src===input.headerImage))throw new Error("The selected email image is no longer available. Refresh and choose it again.");
    const storedTemplate=await getEmailTemplate(input.templateId,client.eventType,input.locale);
    const template=storedTemplate?withClientFinancialParagraph({...storedTemplate,headerImage:input.headerImage||null}):null;
    if(!template?.isActive)throw new Error("Template is unavailable or paused.");
    assertEmailSectionImages(input.bodyText,images);assertResolvedEmail(input.subject,input.bodyText);assertCompositionDestination(input.bodyText,Boolean(offer),Boolean(portal));if(input.deliveryAction==="schedule"){const scheduledForUtc=input.scheduledFor?athensLocalToUtcSql(input.scheduledFor):null;if(!scheduledForUtc)throw new Error("Choose a valid Greece date and time.");await scheduleManualEmail({clientId:client.id,leadId:client.leadId,offerId:offer?.id,templateId:template.id,scheduledFor:scheduledForUtc,headerImage:template.headerImage,subject:input.subject,bodyText:input.bodyText});revalidateAdminWorkflow({leadId:client.leadId,clientId:client.id});return{success:true,message:`Template ${template.id} scheduled for ${input.scheduledFor?.replace("T"," ")} Greece time.`}}
    const origin=(process.env.NEXT_PUBLIC_SITE_URL??"http://localhost:3000").replace(/\/$/,"");
    const offerUrl=offer?`${origin}/offer/${offer.slug}`:"";
    const portalUrl=portal?`${origin}/portal/${portal.slug}`:"";
    const firstName=client.coupleNames.split(/\s+(?:and|και|&)\s+/i)[0]?.trim()||client.coupleNames;
    const invoice=await getInvoicePaymentSummary(client.id);
    if(template.id==="005"&&(!invoice||invoice.invoiceTotal<=0))throw new Error("Template 005 needs a connected invoice with a valid accepted collection total.");
    const rendered=readEmailComposition(input.bodyText)?{subject:"",bodyText:"",html:"",text:""}:renderTemplate(template,{...clientEmailFinancialValues(invoice?.invoiceTotal??0),couple_names:client.coupleNames,parents_names:client.coupleNames,child_name:firstName,first_name:firstName,event_date:client.eventDate??"",wedding_date:client.eventDate??"",ceremony_location:client.ceremonyLocation??"",reception_location:client.receptionLocation??"",portal_url:portalUrl,questionnaire_url:portalUrl?`${portalUrl}?tab=questionnaire`:"",agreement_url:portalUrl?`${portalUrl}?tab=contract`:"",invoice_url:portalUrl?`${portalUrl}?tab=invoice`:"",timeline_url:"",offer_url:offerUrl});
    const outgoing=input.subject===rendered.subject&&input.bodyText===rendered.bodyText?rendered:renderEditedEmail(input.subject,input.bodyText,input.locale,{email_event_type:client.eventType,portal_url:portalUrl,offer_url:offerUrl,recent_gallery_url:process.env.NEXT_PUBLIC_RECENT_GALLERY_URL??"",email_header_image:template.headerImage??""});
    const result=await sendTrackedEmail({templateId:template.id,clientId:client.id,leadId:client.leadId??undefined,offerId:offer?.id,recipient:client.email,subject:outgoing.subject,html:outgoing.html,text:outgoing.text,idempotencyKey:input.idempotencyKey,archive:{templateName:template.name,coupleNames:client.coupleNames,eventDate:client.eventDate}});
    if(result.duplicate)return result.success?{success:true,message:`This send request was already completed. Template ${template.id} was not sent twice.`,deliveryId:result.id}:{success:false,message:result.error??"This email request is already being processed.",deliveryId:result.id};
    if(!result.success)throw new Error(result.error??"Delivery failed.");
    await reconcileAutomationAfterDeliveredTemplate({templateId:template.id,clientId:client.id,leadId:client.leadId,offerId:offer?.id});
    revalidatePath(`/admin/clients/${client.id}`);
    revalidatePath(`/admin/clients/${client.id}/email`);
    revalidatePath("/admin/email-templates");
    revalidateAdminWorkflow({leadId:client.leadId,clientId:client.id});
    return{success:true,message:result.archiveSent===false?`Template ${template.id} was sent to the client, but the private Gmail archive copy failed.`:`Template ${template.id} sent successfully to ${client.email}. A [SENT] copy was archived to Gmail.`,deliveryId:result.id};
  }catch(error){
    return{success:false,message:error instanceof z.ZodError?(error.issues[0]?.message??"Invalid email details."):error instanceof Error?error.message:"Unable to send email."};
  }
}
