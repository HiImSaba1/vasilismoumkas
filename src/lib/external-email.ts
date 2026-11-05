import "server-only";
import type {PoolConnection,RowDataPacket} from "mysql2/promise";
import {getDatabase} from "@/lib/database";

export const externalEmailHoldReason="External Gmail 001 recorded. CRM 001/002/003 delivery is blocked; review communication manually.";
type Scope={leadId?:string|null;clientId?:string|null;offerId?:number|null};
export async function hasExternalProposal(scope:Scope,database:Pick<PoolConnection,"query">=getDatabase()){
  if(!scope.leadId&&!scope.clientId&&!scope.offerId)return false;
  const[rows]=await database.query<RowDataPacket[]>(`SELECT a.id FROM activity_log a WHERE a.event_type='external-email-recorded' AND (a.lead_id=? OR a.lead_id=(SELECT lead_id FROM clients WHERE id=? LIMIT 1) OR a.offer_id=?) LIMIT 1`,[scope.leadId??null,scope.clientId??null,scope.offerId??null]);
  return rows.length>0;
}
export async function recordExternalProposal(input:{leadId:string;offerId:number;recipient:string;subject:string;sentAt:string;reference:string}){
  const connection=await getDatabase().getConnection();
  try{
    await connection.beginTransaction();
    const[leads]=await connection.query<RowDataPacket[]>("SELECT id,email FROM leads WHERE id=? FOR UPDATE",[input.leadId]);
    if(!leads[0]||String(leads[0].email).toLowerCase()!==input.recipient.toLowerCase())throw new Error("Recipient must match the saved lead email.");
    const[offers]=await connection.query<RowDataPacket[]>("SELECT id FROM offers WHERE id=? AND lead_id=? FOR UPDATE",[input.offerId,input.leadId]);
    if(!offers.length)throw new Error("Choose the offer connected to this lead.");
    const[existing]=await connection.query<RowDataPacket[]>("SELECT id FROM activity_log WHERE lead_id=? AND event_type='external-email-recorded' LIMIT 1",[input.leadId]);
    if(existing.length){await connection.commit();return false}
    const[active]=await connection.query<RowDataPacket[]>(`SELECT id FROM automation_jobs WHERE (lead_id=? OR offer_id=? OR client_id IN (SELECT id FROM clients WHERE lead_id=?)) AND template_id IN ('001','002','003') AND status='processing' UNION ALL SELECT id FROM email_deliveries WHERE (lead_id=? OR offer_id=? OR client_id IN (SELECT id FROM clients WHERE lead_id=?)) AND template_id IN ('001','002','003') AND status='queued'`,[input.leadId,input.offerId,input.leadId,input.leadId,input.offerId,input.leadId]);
    if(active.length)throw new Error("An email is being processed. Stop/review the active delivery before recording the external email.");
    await connection.execute("INSERT INTO activity_log (lead_id,offer_id,event_type,summary,metadata) VALUES (?,?,'external-email-recorded',?,?)",[input.leadId,input.offerId,`Gmail / εξωτερική αποστολή · 001 · ${input.sentAt} UTC · ${input.subject}`.slice(0,500),JSON.stringify({source:"Gmail / εξωτερική αποστολή",templateId:"001",recipient:input.recipient,subject:input.subject,sentAt:input.sentAt,reference:input.reference,recordedBy:"authenticated-admin",communicationHold:true})]);
    await connection.execute(`UPDATE automation_jobs SET status='cancelled',completed_at=CURRENT_TIMESTAMP,last_error=?,locked_at=NULL WHERE (lead_id=? OR offer_id=? OR client_id IN (SELECT id FROM clients WHERE lead_id=?)) AND template_id IN ('001','002','003') AND status IN ('scheduled','failed')`,[externalEmailHoldReason,input.leadId,input.offerId,input.leadId]);
    await connection.commit();return true;
  }catch(error){await connection.rollback();throw error}finally{connection.release()}
}
export async function listExternalProposals(leadId:string){
  const[rows]=await getDatabase().query<(RowDataPacket&{id:number;summary:string;metadata:string|Record<string,string>})[]>("SELECT id,summary,metadata FROM activity_log WHERE lead_id=? AND event_type='external-email-recorded' ORDER BY created_at DESC",[leadId]);
  return rows.map(row=>({id:Number(row.id),summary:row.summary,...(typeof row.metadata==="string"?JSON.parse(row.metadata):row.metadata) as {source:string;recipient:string;subject:string;sentAt:string;reference:string}}));
}
