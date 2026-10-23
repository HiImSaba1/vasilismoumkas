import "server-only";
import { randomUUID } from "node:crypto";
import type { RowDataPacket } from "mysql2/promise";
import { getDatabase } from "@/lib/database";
import { resolveContractForWorkflowProfile } from "@/lib/contract-templates";
import { sendInternalWorkflowNotification } from "@/lib/email-delivery";
import { submitNativeQuestionnaireAnswers, submitLegacyQuestionnaireAnswers } from "@/lib/questionnaire-answer-editing";
import { normalizePortalSlugValue } from "@/lib/portal-url";
import { listClientExtras } from "@/lib/client-extras";
import { listTeamAssignments } from "@/lib/coverage-team";
export const normalizePortalSlug=normalizePortalSlugValue;
function parsePortalDocumentData(value:unknown):Record<string,string>{
  if(value&&typeof value==="object"&&!Array.isArray(value))return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,item==null?"":typeof item==="string"?item:JSON.stringify(item)]));
  if(typeof value!=="string"||!value.trim())return{};
  try{const parsed:unknown=JSON.parse(value);return parsed&&typeof parsed==="object"&&!Array.isArray(parsed)?Object.fromEntries(Object.entries(parsed).map(([key,item])=>[key,item==null?"":typeof item==="string"?item:JSON.stringify(item)])):{} }catch{return{legacy_content:value}}
}
function safePortalDate(value:unknown,mode:"date"|"timestamp"):string|null{
  if(value==null||value==="")return null;
  const parsed=value instanceof Date?value:new Date(String(value));
  if(Number.isNaN(parsed.getTime()))return null;
  const iso=parsed.toISOString();
  return mode==="date"?iso.slice(0,10):iso;
}
const portalText=(value:unknown,fallback="")=>typeof value==="string"?value:fallback;
type PortalRow=RowDataPacket&{client_id:string;lead_id:string|null;event_type:string;couple_names:string;email:string|null;event_date:unknown;ceremony_location:string|null;reception_location:string|null;public_slug:string;language:string|null};

export async function getPortalBySlug(slug:string){
  const normalizedSlug=normalizePortalSlug(slug);
  const db=getDatabase();
  let rows:PortalRow[]=[];
  try{
    const[result]=await db.query<PortalRow[]>("SELECT p.client_id,c.lead_id,c.event_type,c.couple_names,c.email,DATE_FORMAT(c.event_date,'%Y-%m-%d') event_date,c.ceremony_location,c.reception_location,p.public_slug,COALESCE(l.workflow_locale,o.language) language FROM client_portals p JOIN clients c ON c.id=p.client_id LEFT JOIN leads l ON l.id=c.lead_id LEFT JOIN offers o ON o.id=c.accepted_offer_id WHERE BINARY p.public_slug=BINARY ? AND p.status='active' LIMIT 1",[normalizedSlug]);
    rows=result;
  }catch{
    const[result]=await db.query<PortalRow[]>("SELECT p.client_id,c.lead_id,c.event_type,c.couple_names,c.email,DATE_FORMAT(c.event_date,'%Y-%m-%d') event_date,c.ceremony_location,c.reception_location,p.public_slug,NULL language FROM client_portals p JOIN clients c ON c.id=p.client_id WHERE BINARY p.public_slug=BINARY ? AND p.status='active' LIMIT 1",[normalizedSlug]);
    rows=result;
  }
  const portal=rows[0];
  if(!portal)return null;
  const eventType:"wedding"|"baptism"=portal.event_type==="baptism"?"baptism":"wedding";
  const language:"gr"|"en"=portal.language==="en"?"en":"gr";
  let documentRows:(RowDataPacket&{document_type:string;template_key:string;status:string;document_data:unknown})[]=[];
  let fileRows:(RowDataPacket&{id:string;original_name:string;mime_type:string;size_bytes:unknown;created_at:unknown})[]=[];
  if(portal.lead_id){
    try{const[result]=await db.query<typeof documentRows>("SELECT document_type,template_key,status,document_data FROM lead_document_records WHERE lead_id=?",[portal.lead_id]);documentRows=result}catch{documentRows=[]}
  }
  try{const[result]=await db.query<typeof fileRows>("SELECT id,original_name,mime_type,size_bytes,created_at FROM documents WHERE client_id=? AND document_type='other' AND status='active' ORDER BY created_at DESC",[portal.client_id]);fileRows=result}catch{fileRows=[]}
  const documents:{type:string;status:string;templateKey:string;data:Record<string,string>;source:"portal"|"legacy"}[]=documentRows.flatMap(row=>{
    if(!["questionnaire","contract","invoice"].includes(row.document_type))return[];
    try{
      const data=parsePortalDocumentData(row.document_data);
      if(row.document_type==="contract")data.contract_text=resolveContractForWorkflowProfile(data.contract_text,eventType,language);
      return[{type:row.document_type,status:portalText(row.status,"draft"),templateKey:portalText(row.template_key),data,source:"portal" as const}];
    }catch{return[]}
  });
  if(!documents.some(document=>document.type==="questionnaire")){
    const[legacy]=await db.query<(RowDataPacket&{answers:unknown;submitted_at:unknown})[]>("SELECT answers,submitted_at FROM questionnaires WHERE client_id=? LIMIT 1",[portal.client_id]);
    if(legacy[0])documents.push({type:"questionnaire",status:legacy[0].submitted_at?"completed":"sent",templateKey:"legacy-questionnaire",data:parsePortalDocumentData(legacy[0].answers),source:"legacy"});
  }
  const files=fileRows.flatMap(row=>{
    const sizeBytes=Number(row.size_bytes);
    if(!portalText(row.id)||!portalText(row.original_name)||!Number.isFinite(sizeBytes))return[];
    return[{id:row.id,originalName:row.original_name,mimeType:portalText(row.mime_type,"application/octet-stream"),sizeBytes,createdAt:safePortalDate(row.created_at,"timestamp")}];
  });
  const[portalExtras,portalTeam]=await Promise.all([listClientExtras(portal.client_id,true),listTeamAssignments(portal.client_id,true)]);
  const extras=portalExtras.map(item=>({id:item.id,titleEl:item.titleEl,titleEn:item.titleEn,descriptionEl:item.descriptionEl,descriptionEn:item.descriptionEn,coverageScope:item.coverageScope,quantity:item.quantity,unitPrice:item.unitPrice,vatRate:item.vatRate,priceIncludesVat:item.priceIncludesVat}));
  const team=portalTeam.map(item=>({id:item.id,fullName:item.fullName,email:item.showContactInPortal?item.email:null,phone:item.showContactInPortal?item.phone:null,role:item.role,customRole:item.customRole,coverageStart:item.coverageStart,coverageEnd:item.coverageEnd,meetingPoint:item.meetingPoint,showContactInPortal:item.showContactInPortal}));
  return{clientId:portal.client_id,leadId:portal.lead_id,eventType,coupleNames:portalText(portal.couple_names,"Client"),email:portalText(portal.email)||null,eventDate:safePortalDate(portal.event_date,"date"),location:portalText(portal.reception_location)||portalText(portal.ceremony_location)||null,slug:portalText(portal.public_slug,normalizedSlug),language,documents,files,extras,team};
}
export async function getPortalForLead(leadId:string){const[rows]=await getDatabase().query<(RowDataPacket&{public_slug:string;status:string})[]>("SELECT p.public_slug,p.status FROM client_portals p JOIN clients c ON c.id=p.client_id WHERE c.lead_id=? LIMIT 1",[leadId]);return rows[0]?{slug:rows[0].public_slug,status:rows[0].status}:null}
export async function listClientPortals(){const[rows]=await getDatabase().query<(RowDataPacket&{lead_id:string|null;client_id:string;public_slug:string;status:string})[]>("SELECT c.lead_id,p.client_id,p.public_slug,p.status FROM client_portals p JOIN clients c ON c.id=p.client_id");return rows.map(row=>({leadId:row.lead_id,clientId:row.client_id,slug:row.public_slug,status:row.status}))}
export async function updatePortalDocument(slug:string,type:"questionnaire"|"contract",data:Record<string,string>){
  const portal=await getPortalBySlug(slug);
  if(!portal)throw new Error("Portal unavailable");
  const current=portal.documents.find(item=>item.type===type);
  if(current&&(type==="questionnaire"?current.status==="completed":current.status==="signed"))return;
  const db=getDatabase();
  if(type==="questionnaire"&&current?.source==="legacy"){
    const[rows]=await db.query<(RowDataPacket&{id:string})[]>("SELECT id FROM questionnaires WHERE client_id=? LIMIT 1",[portal.clientId]);
    if(!rows[0])throw new Error("Questionnaire unavailable.");
    await submitLegacyQuestionnaireAnswers({id:rows[0].id,clientId:portal.clientId,eventType:portal.eventType,language:portal.language,answers:data});
    await sendInternalWorkflowNotification({event:"questionnaire-completed",clientName:portal.coupleNames,clientEmail:portal.email,leadId:portal.leadId,clientId:portal.clientId,details:["The client submitted the private questionnaire through the portal."]});
    return;
  }
  if(!portal.leadId)throw new Error("Portal unavailable");
  if(type==="questionnaire"){
    const saved=await submitNativeQuestionnaireAnswers({leadId:portal.leadId,clientId:portal.clientId,eventType:portal.eventType,language:portal.language,answers:data});
    if(!saved)return;
  }else{
    await db.execute("UPDATE lead_document_records SET status='signed',document_data=? WHERE lead_id=? AND document_type='contract'",[JSON.stringify({...current?.data,...data}),portal.leadId]);
    await db.execute("UPDATE onboarding SET agreement_status='approved',booking_status=IF(invoice_status IN ('part-paid','paid'),'confirmed',booking_status) WHERE client_id=?",[portal.clientId]);
  }
  await db.execute("INSERT IGNORE INTO automation_jobs (id,job_key,job_type,client_id,offer_id,template_id,scheduled_for,payload) SELECT ?,CONCAT('client:',c.id,':post-event-thank-you'),'post-event-thank-you',c.id,c.accepted_offer_id,'007',DATE_ADD(c.event_date,INTERVAL 1 DAY),JSON_OBJECT('source','portal-booking-confirmed') FROM onboarding o JOIN clients c ON c.id=o.client_id WHERE c.id=? AND o.booking_status='confirmed' AND c.event_date IS NOT NULL",[randomUUID(),portal.clientId]);
  await db.execute("INSERT IGNORE INTO automation_jobs (id,job_key,job_type,client_id,template_id,scheduled_for,payload) SELECT ?,CONCAT('client:',c.id,':timeline-reminder'),'timeline-reminder',c.id,'009',DATE_SUB(c.event_date,INTERVAL 60 DAY),JSON_OBJECT('source','portal-booking-confirmed') FROM onboarding o JOIN clients c ON c.id=o.client_id WHERE c.id=? AND o.booking_status='confirmed' AND c.event_date IS NOT NULL",[randomUUID(),portal.clientId]);
  if(type==="contract")await db.execute("INSERT INTO activity_log (lead_id,client_id,event_type,summary) VALUES (?,?,?,?)",[portal.leadId,portal.clientId,"contract-signed","Portal contract accepted"]);
  await sendInternalWorkflowNotification({event:type==="questionnaire"?"questionnaire-completed":"contract-signed",clientName:portal.coupleNames,clientEmail:portal.email,leadId:portal.leadId,clientId:portal.clientId,details:[type==="questionnaire"?"The client submitted the questionnaire through the portal.":`Signed by: ${data.signed_name??portal.coupleNames}`]});
}
