import "server-only";
import { randomUUID } from "node:crypto";
import type { RowDataPacket } from "mysql2/promise";
import { getDatabase } from "@/lib/database";
import { weddingContractForLanguage } from "@/lib/contract-templates";
import { sendInternalWorkflowNotification } from "@/lib/email-delivery";

export type NativeDocumentType="questionnaire"|"contract"|"invoice";
export type NativeLeadDocument={id:string;leadId:string;documentType:NativeDocumentType;templateKey:string;status:string;data:Record<string,string>;updatedAt:string};
type Row=RowDataPacket&{id:string;lead_id:string;document_type:NativeDocumentType;template_key:string;status:string;document_data:string|Record<string,string>;updated_at:Date;offer_language:"gr"|"en"|null};
export const documentPresets={questionnaire:[{key:"wedding-planning",label:"Wedding planning"}],contract:[{key:"greek-wedding-agreement",label:"Greek wedding photography agreement"}],invoice:[{key:"wedding-invoice",label:"Wedding photography invoice"}]} as const;
export async function listNativeLeadDocuments(){const[rows]=await getDatabase().query<Row[]>("SELECT d.*,(SELECT o.language FROM offers o WHERE o.lead_id=d.lead_id ORDER BY o.accepted_at DESC,o.created_at DESC LIMIT 1) offer_language FROM lead_document_records d ORDER BY d.updated_at DESC");return rows.map(row=>{const data=typeof row.document_data==="string"?JSON.parse(row.document_data):row.document_data;if(row.document_type==="contract"&&!data.contract_text)data.contract_text=weddingContractForLanguage(row.offer_language??"gr");return{id:row.id,leadId:row.lead_id,documentType:row.document_type,templateKey:row.template_key,status:row.status,data,updatedAt:new Date(row.updated_at).toISOString()}})}
export async function saveNativeLeadDocument(input:{leadId:string;documentType:NativeDocumentType;templateKey:string;status:string;data:Record<string,string>}){
  const db=getDatabase();
  const[templateRows]=await db.query<(RowDataPacket&{template_key:string})[]>("SELECT t.template_key FROM leads l JOIN document_templates t ON t.event_type=l.event_type AND t.locale=l.workflow_locale AND t.document_type=? AND t.template_key=? AND t.is_active=1 WHERE l.id=? LIMIT 1",[input.documentType,input.templateKey,input.leadId]);
  if(!templateRows[0])throw new Error("Select an active document template from this lead workflow profile.");
  const[beforeRows]=await db.query<(RowDataPacket&{status:string})[]>("SELECT status FROM lead_document_records WHERE lead_id=? AND document_type=? LIMIT 1",[input.leadId,input.documentType]);
  await db.execute("INSERT INTO lead_document_records (id,lead_id,document_type,template_key,status,document_data) VALUES (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE template_key=VALUES(template_key),status=VALUES(status),document_data=VALUES(document_data)",[randomUUID(),input.leadId,input.documentType,input.templateKey,input.status,JSON.stringify(input.data)]);
  const[clients]=await db.query<(RowDataPacket&{id:string;couple_names:string;email:string|null;event_date:Date|null})[]>("SELECT id,couple_names,email,event_date FROM clients WHERE lead_id=? LIMIT 1",[input.leadId]);
  const client=clients[0];
  if(client){
    if(input.documentType==="questionnaire"&&input.status==="completed")await db.execute("UPDATE onboarding SET questionnaire_status='completed' WHERE client_id=?",[client.id]);
    if(input.documentType==="contract"&&["signed","approved"].includes(input.status))await db.execute("UPDATE onboarding SET agreement_status='approved' WHERE client_id=?",[client.id]);
    if(input.documentType==="invoice"&&input.status==="paid")await db.execute("UPDATE onboarding SET invoice_status='paid' WHERE client_id=?",[client.id]);
    await db.execute("UPDATE onboarding SET booking_status='confirmed' WHERE client_id=? AND agreement_status='approved' AND invoice_status IN ('part-paid','paid')",[client.id]);
    await db.execute("INSERT IGNORE INTO automation_jobs (id,job_key,job_type,client_id,offer_id,template_id,scheduled_for,payload) SELECT ?,CONCAT('client:',c.id,':booking-confirmation'),'booking-confirmation',c.id,c.accepted_offer_id,'007',DATE_ADD(CURRENT_TIMESTAMP,INTERVAL 1 DAY),JSON_OBJECT('source','native-documents-confirmed') FROM onboarding o JOIN clients c ON c.id=o.client_id WHERE c.id=? AND o.booking_status='confirmed'",[randomUUID(),client.id]);
    await db.execute("INSERT IGNORE INTO automation_jobs (id,job_key,job_type,client_id,template_id,scheduled_for,payload) SELECT ?,CONCAT('client:',c.id,':timeline-reminder'),'timeline-reminder',c.id,'009',DATE_SUB(c.event_date,INTERVAL 60 DAY),JSON_OBJECT('source','native-documents-confirmed') FROM onboarding o JOIN clients c ON c.id=o.client_id WHERE c.id=? AND o.booking_status='confirmed' AND c.event_date IS NOT NULL",[randomUUID(),client.id]);
  }
  await db.execute("INSERT INTO activity_log (lead_id,client_id,event_type,summary,metadata) VALUES (?,?, 'native-document-updated',?,?)",[input.leadId,client?.id??null,`${input.documentType} saved inside admin`,JSON.stringify({documentType:input.documentType,status:input.status})]);
  const changed=beforeRows[0]?.status!==input.status;
  if(client&&changed&&input.documentType==="contract"&&["signed","approved"].includes(input.status))await sendInternalWorkflowNotification({event:"contract-signed",clientName:client.couple_names,clientEmail:client.email,leadId:input.leadId,clientId:client.id,details:["The agreement was marked signed in the client record."]});
  if(client&&changed&&input.documentType==="invoice"&&input.status==="paid")await sendInternalWorkflowNotification({event:"payment-completed",clientName:client.couple_names,clientEmail:client.email,leadId:input.leadId,clientId:client.id,details:["The invoice/deposit was marked paid in the client record."]});
}
