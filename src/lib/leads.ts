import "server-only";
import { randomUUID } from "node:crypto";
import type { RowDataPacket } from "mysql2/promise";
import { getDatabase } from "@/lib/database";
import { revalidateAdminWorkflow } from "@/lib/admin-workflow-revalidation";
import { removeClientFileStorage } from "@/lib/client-files";

export const leadStatuses=["new","awaiting-information","qualified","offer-draft","offer-sent","follow-up","accepted","lost","converted","completed"] as const;
export type LeadStatus=(typeof leadStatuses)[number];
export type WorkflowLocale="el"|"en";
export type Lead={id:string;eventType:"wedding"|"baptism";workflowLocale:WorkflowLocale|null;status:LeadStatus;coupleNames:string;email:string|null;phone:string|null;eventDate:string|null;ceremonyLocation:string|null;receptionLocation:string|null;guestCount:number|null;source:string|null;notes:string|null;createdAt:string;updatedAt:string};
type LeadRow=RowDataPacket&{id:string;event_type:Lead["eventType"];workflow_locale:WorkflowLocale|null;status:LeadStatus;couple_names:string;email:string|null;phone:string|null;event_date:string|Date|null;ceremony_location:string|null;reception_location:string|null;guest_count:number|null;source:string|null;notes:string|null;created_at:string|Date;updated_at:string|Date};
const dateValue=(value:string|Date|null)=>{if(!value)return null;if(typeof value==="string")return value.slice(0,10);return `${value.getFullYear()}-${String(value.getMonth()+1).padStart(2,"0")}-${String(value.getDate()).padStart(2,"0")}`};
const mapLead=(row:LeadRow):Lead=>({id:row.id,eventType:row.event_type,workflowLocale:row.workflow_locale,status:row.status,coupleNames:row.couple_names,email:row.email,phone:row.phone,eventDate:dateValue(row.event_date),ceremonyLocation:row.ceremony_location,receptionLocation:row.reception_location,guestCount:row.guest_count,source:row.source,notes:row.notes,createdAt:new Date(row.created_at).toISOString(),updatedAt:new Date(row.updated_at).toISOString()});
export async function listLeads(){const[rows]=await getDatabase().query<LeadRow[]>("SELECT * FROM leads ORDER BY created_at DESC");return rows.map(mapLead)}
export async function getLead(id:string){const[rows]=await getDatabase().query<LeadRow[]>("SELECT * FROM leads WHERE id=? LIMIT 1",[id]);return rows[0]?mapLead(rows[0]):null}
export async function createLead(input:Omit<Lead,"id"|"workflowLocale"|"status"|"createdAt"|"updatedAt">){const id=randomUUID();await getDatabase().execute(`INSERT INTO leads (id,event_type,status,couple_names,email,phone,event_date,ceremony_location,reception_location,guest_count,source,notes) VALUES (?,?,'new',?,?,?,?,?,?,?,?,?)`,[id,input.eventType,input.coupleNames,input.email,input.phone,input.eventDate,input.ceremonyLocation,input.receptionLocation,input.guestCount,input.source,input.notes]);return id}
export async function updateLeadStatus(id:string,status:LeadStatus){await getDatabase().execute("UPDATE leads SET status=? WHERE id=?",[status,id]);await getDatabase().execute("INSERT INTO activity_log (lead_id,event_type,summary) VALUES (?,'lead-status',?)",[id,`Lead moved to ${status}`])}
export async function qualifyLeadWorkflow(id:string,eventType:Lead["eventType"],locale:WorkflowLocale,status:"awaiting-information"|"qualified"|"lost"){
  const connection=await getDatabase().getConnection();
  try{await connection.beginTransaction();const[rows]=await connection.query<(RowDataPacket&{event_type:Lead["eventType"];workflow_locale:WorkflowLocale|null})[]>("SELECT event_type,workflow_locale FROM leads WHERE id=? FOR UPDATE",[id]);if(!rows[0])throw new Error("Lead not found");
    const[lockedOffers]=await connection.query<(RowDataPacket&{total:number})[]>("SELECT COUNT(*) total FROM offers WHERE lead_id=? AND status NOT IN ('draft','revoked')",[id]);if(Number(lockedOffers[0]?.total)>0&&(rows[0].event_type!==eventType||rows[0].workflow_locale!==locale))throw new Error("This workflow cannot change after an offer has been sent.");
    await connection.execute("UPDATE leads SET event_type=?,workflow_locale=?,status=? WHERE id=?",[eventType,locale,status,id]);
    await connection.execute("UPDATE offers SET event_type=?,language=? WHERE lead_id=? AND status IN ('draft','revoked')",[eventType,locale==="el"?"gr":"en",id]);
    await connection.execute("UPDATE clients SET event_type=? WHERE lead_id=?",[eventType,id]);
    await connection.execute("INSERT INTO activity_log (lead_id,event_type,summary,metadata) VALUES (?,'workflow-profile-selected',?,JSON_OBJECT('eventType',?,'locale',?))",[id,`${eventType} ${locale.toUpperCase()} workflow selected`,eventType,locale]);await connection.commit();
  }catch(error){await connection.rollback();throw error}finally{connection.release()}
}
export async function updateLeadDetails(id:string,input:{coupleNames:string;email:string|null;phone:string|null;eventDate:string|null;ceremonyLocation:string|null;receptionLocation:string|null;guestCount:number|null;source:string|null;notes:string|null}){await getDatabase().execute("UPDATE leads SET couple_names=?,email=?,phone=?,event_date=?,ceremony_location=?,reception_location=?,guest_count=?,source=?,notes=? WHERE id=?",[input.coupleNames,input.email,input.phone,input.eventDate,input.ceremonyLocation,input.receptionLocation,input.guestCount,input.source,input.notes,id]);await getDatabase().execute("INSERT INTO activity_log (lead_id,event_type,summary) VALUES (?,'lead-updated','Lead details updated')",[id])}
export async function getLeadActivity(id:string){const[rows]=await getDatabase().query<(RowDataPacket&{id:number;event_type:string;summary:string;created_at:Date})[]>("SELECT id,event_type,summary,created_at FROM activity_log WHERE lead_id=? ORDER BY created_at DESC LIMIT 50",[id]);return rows.map(row=>({id:Number(row.id),eventType:row.event_type,summary:row.summary,createdAt:new Date(row.created_at).toISOString()}))}
export async function completeLeadEvent(id:string){const db=getDatabase();await db.execute("UPDATE leads SET status='completed',next_action_at=NULL WHERE id=?",[id]);await db.execute("UPDATE clients SET journey_stage='completed' WHERE lead_id=?",[id]);await db.execute("UPDATE onboarding o JOIN clients c ON c.id=o.client_id SET o.production_status='event-complete' WHERE c.lead_id=?",[id]);await db.execute("UPDATE automation_jobs SET status='cancelled',completed_at=CURRENT_TIMESTAMP,last_error='Event completed' WHERE lead_id=? AND status IN ('scheduled','failed')",[id]);await db.execute("INSERT INTO activity_log (lead_id,event_type,summary) VALUES (?,'event-completed','Event marked completed by admin')",[id])}
export async function deleteLeadJourney(leadId:string){
  const connection=await getDatabase().getConnection();
  const clientIds:string[]=[];
  try{
    await connection.beginTransaction();
    const[clients]=await connection.query<(RowDataPacket&{id:string})[]>("SELECT id FROM clients WHERE lead_id=? FOR UPDATE",[leadId]);
    clientIds.push(...clients.map(client=>client.id));
    const[offers]=await connection.query<(RowDataPacket&{id:number})[]>("SELECT id FROM offers WHERE lead_id=? FOR UPDATE",[leadId]);
    for(const clientId of clientIds){
      await connection.execute("DELETE FROM timelines WHERE client_id=?",[clientId]);
      await connection.execute("DELETE FROM email_deliveries WHERE client_id=?",[clientId]);
      await connection.execute("DELETE FROM automation_jobs WHERE client_id=?",[clientId]);
      await connection.execute("DELETE FROM activity_log WHERE client_id=?",[clientId]);
      await connection.execute("DELETE FROM clients WHERE id=?",[clientId]);
    }
    await connection.execute("DELETE FROM email_deliveries WHERE lead_id=?",[leadId]);
    await connection.execute("DELETE FROM automation_jobs WHERE lead_id=?",[leadId]);
    await connection.execute("DELETE FROM activity_log WHERE lead_id=?",[leadId]);
    for(const offer of offers){
      await connection.execute("DELETE FROM email_deliveries WHERE offer_id=?",[offer.id]);
      await connection.execute("DELETE FROM automation_jobs WHERE offer_id=?",[offer.id]);
      await connection.execute("DELETE FROM activity_log WHERE offer_id=?",[offer.id]);
    }
    await connection.execute("DELETE FROM offers WHERE lead_id=?",[leadId]);
    await connection.execute("DELETE FROM leads WHERE id=?",[leadId]);
    await connection.commit();
  }catch(error){await connection.rollback();throw error}finally{connection.release()}
  await removeClientFileStorage(clientIds);
}
export async function deleteClientJourney(clientId:string){
  const[rows]=await getDatabase().query<(RowDataPacket&{lead_id:string|null})[]>("SELECT lead_id FROM clients WHERE id=? LIMIT 1",[clientId]);
  const leadId=rows[0]?.lead_id;
  if(leadId)return deleteLeadJourney(leadId);
  const connection=await getDatabase().getConnection();
  try{
    await connection.beginTransaction();
    await connection.execute("DELETE FROM timelines WHERE client_id=?",[clientId]);
    await connection.execute("DELETE FROM email_deliveries WHERE client_id=?",[clientId]);
    await connection.execute("DELETE FROM automation_jobs WHERE client_id=?",[clientId]);
    await connection.execute("DELETE FROM activity_log WHERE client_id=?",[clientId]);
    await connection.execute("DELETE FROM clients WHERE id=?",[clientId]);
    await connection.commit();
  }catch(error){await connection.rollback();throw error}finally{connection.release()}
  await removeClientFileStorage([clientId]);
}
export async function markFirstResponsePrepared(id:string){await getDatabase().execute("UPDATE leads SET status=IF(status='new','awaiting-information',status),next_action_at=NULL WHERE id=?",[id]);await getDatabase().execute("INSERT INTO activity_log (lead_id,event_type,summary,metadata) VALUES (?,'email-prepared','Template 000 prepared',JSON_OBJECT('template','000'))",[id])}
export async function recordLeadEmailSent(id:string,templateId:string){await getDatabase().execute("UPDATE leads SET status=IF(status='new','awaiting-information',status),last_response_at=CURRENT_TIMESTAMP WHERE id=?",[id]);await getDatabase().execute("INSERT INTO activity_log (lead_id,event_type,summary,metadata) VALUES (?,'email-sent',?,JSON_OBJECT('template',?))",[id,`Template ${templateId} sent`,templateId]);revalidateAdminWorkflow({leadId:id})}
