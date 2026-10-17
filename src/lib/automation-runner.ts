import "server-only";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { getDatabase } from "@/lib/database";
import { sendTrackedEmail, smtpConfigured } from "@/lib/email-delivery";
import { getEmailTemplate, renderEditedEmail, renderTemplate } from "@/lib/email-templates";
import { finalizeAutomationDelivery,reconcileAutomationAfterDeliveredTemplate } from "@/lib/automations";

type Context=RowDataPacket&{id:string;job_type:string;send_mode:"automatic"|"manual";lead_id:string|null;client_id:string|null;offer_id:number|null;template_id:string|null;attempts:number;recipient:string|null;couple_names:string|null;event_type:"wedding"|"baptism"|null;offer_language:"gr"|"en"|null;workflow_locale:"el"|"en"|null;event_date:string|null;ceremony_location:string|null;reception_location:string|null;offer_slug:string|null;offer_status:string|null;timeline_slug:string|null;portal_slug:string|null;payload:string|Record<string,unknown>|null};
type ManualSnapshot={templateId?:string;headerImage?:string|null;subject?:string;bodyText?:string};
const snapshot=(value:Context["payload"]):ManualSnapshot=>{try{return (typeof value==="string"?JSON.parse(value):value??{}) as ManualSnapshot}catch{return{}}};
const automaticTemplateIds=new Set(["002","003","007","009"]);

export async function runDueAutomations(limit=10){
  if(!smtpConfigured())return{processed:0,sent:0,failed:0,cancelled:0,reason:"SMTP is disabled"};
  const db=getDatabase();const safeLimit=Math.max(1,Math.min(50,Math.trunc(limit)));
  const[ids]=await db.query<(RowDataPacket&{id:string})[]>(`SELECT id FROM automation_jobs WHERE status='scheduled' AND scheduled_for<=CURRENT_TIMESTAMP ORDER BY scheduled_for LIMIT ${safeLimit}`);
  let sent=0,failed=0,cancelled=0;
  for(const item of ids){
    const[claim]=await db.execute<ResultSetHeader>("UPDATE automation_jobs SET status='processing',locked_at=CURRENT_TIMESTAMP,attempts=attempts+1 WHERE id=? AND status='scheduled'",[item.id]);if(!claim.affectedRows)continue;
    try{
      const[rows]=await db.query<Context[]>(`SELECT j.id,j.job_type,j.send_mode,j.lead_id,j.client_id,j.offer_id,j.template_id,j.attempts,j.payload,COALESCE(o.client_email,c.email,l.email) recipient,COALESCE(o.client_name,c.couple_names,l.couple_names) couple_names,COALESCE(o.event_type,c.event_type,l.event_type) event_type,o.language offer_language,l.workflow_locale,DATE_FORMAT(COALESCE(c.event_date,l.event_date),'%Y-%m-%d') event_date,COALESCE(c.ceremony_location,l.ceremony_location) ceremony_location,COALESCE(c.reception_location,l.reception_location) reception_location,o.slug offer_slug,o.status offer_status,(SELECT t.slug FROM timelines t WHERE t.client_id=j.client_id AND t.status='published' ORDER BY t.updated_at DESC LIMIT 1) timeline_slug,(SELECT p.public_slug FROM client_portals p WHERE p.client_id=j.client_id AND p.status='active' LIMIT 1) portal_slug FROM automation_jobs j LEFT JOIN leads l ON l.id=j.lead_id LEFT JOIN clients c ON c.id=j.client_id LEFT JOIN offers o ON o.id=j.offer_id WHERE j.id=? LIMIT 1`,[item.id]);
      const job=rows[0];if(!job?.template_id)throw new Error("Template is missing");
      if(job.send_mode==="automatic"&&!automaticTemplateIds.has(job.template_id)){await db.execute("UPDATE automation_jobs SET status='cancelled',completed_at=CURRENT_TIMESTAMP,last_error='Automatic delivery is not allowed for this template',locked_at=NULL WHERE id=?",[job.id]);cancelled++;continue}
      if(!job.recipient)throw new Error("Recipient is missing");
      if(await reconcileAutomationAfterDeliveredTemplate({templateId:job.template_id,leadId:job.lead_id,clientId:job.client_id,offerId:job.offer_id})){cancelled++;continue}
      const athensToday=new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Athens",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
      if(job.template_id==="007"&&(!job.event_date||job.event_date>=athensToday))throw new Error("Safety stop: Template 007 can only send after the event date.");
      if(job.template_id==="009"&&!job.timeline_slug)throw new Error("Safety stop: Template 009 needs a published timeline link.");
      if(job.job_type==="offer-followup"&&!(job.offer_status==="sent"||job.offer_status==="viewed")){await db.execute("UPDATE automation_jobs SET status='cancelled',completed_at=CURRENT_TIMESTAMP,last_error='Offer is no longer awaiting a response' WHERE id=?",[job.id]);cancelled++;continue}
      const stored=await getEmailTemplate(job.template_id,job.event_type??"wedding",(job.workflow_locale==="en"||job.offer_language==="en")?"en":"el");if(!stored?.isActive)throw new Error("Template is unavailable or paused");
      const manual=snapshot(job.payload);if(job.job_type==="manual-email"&&manual.templateId!==job.template_id)throw new Error("Safety stop: scheduled template identity does not match its saved payload.");const template={...stored,headerImage:manual.headerImage===undefined?stored.headerImage:manual.headerImage};
      const origin=(process.env.NEXT_PUBLIC_SITE_URL??"http://localhost:3000").replace(/\/$/,"");const names=job.couple_names??"";const firstName=names.split(/\s+(?:and|και|&)\s+/i)[0]??names;
      const eventDate=job.event_date?new Intl.DateTimeFormat(template.locale==="el"?"el-GR":"en-GB",{timeZone:"UTC"}).format(new Date(`${job.event_date}T00:00:00Z`)):"";const portalUrl=job.portal_slug?`${origin}/portal/${job.portal_slug}`:"";
      const values={couple_names:names,parents_names:names,child_name:firstName,first_name:firstName,event_date:eventDate,wedding_date:eventDate,ceremony_location:job.ceremony_location??"",reception_location:job.reception_location??"",offer_url:job.offer_slug?`${origin}/offer/${job.offer_slug}`:"",portal_url:portalUrl,questionnaire_url:portalUrl?`${portalUrl}?tab=questionnaire`:"",agreement_url:portalUrl?`${portalUrl}?tab=contract`:"",invoice_url:portalUrl?`${portalUrl}?tab=invoice`:"",timeline_url:job.timeline_slug?`${origin}/timeline/${job.timeline_slug}`:""};
      const rendered=manual.subject&&manual.bodyText?renderEditedEmail(manual.subject,manual.bodyText,template.locale,{...values,email_header_image:template.headerImage??""}):renderTemplate(template,values);
      const result=await sendTrackedEmail({templateId:template.id,leadId:job.lead_id??undefined,clientId:job.client_id??undefined,offerId:job.offer_id??undefined,recipient:job.recipient,subject:rendered.subject,html:rendered.html,text:rendered.text,archive:{templateName:template.name,coupleNames:names,eventDate}});if(!result.success)throw new Error(result.error??"Delivery failed");await finalizeAutomationDelivery({templateId:template.id,leadId:job.lead_id,clientId:job.client_id,offerId:job.offer_id});
      await db.execute("UPDATE automation_jobs SET status='sent',completed_at=CURRENT_TIMESTAMP,last_error=?,locked_at=NULL WHERE id=?",[result.archiveSent===false?"Client email sent; Gmail [SENT] archive copy failed.":null,job.id]);sent++;
    }catch(error){const message=error instanceof Error?error.message:"Automation failed";await db.execute("UPDATE automation_jobs SET status='failed',last_error=?,locked_at=NULL WHERE id=?",[message.slice(0,2000),item.id]);failed++}
  }
  return{processed:sent+failed+cancelled,sent,failed,cancelled};
}
