import "server-only";
import type { RowDataPacket } from "mysql2/promise";
import { getDatabase } from "@/lib/database";

export const workflowStatuses=["not-done","pending","completed","skipped","accepted"] as const;
export type WorkflowStatus=(typeof workflowStatuses)[number];
export type WorkflowPhase="lead"|"production"|"completion";
export type WorkflowRequirement="required"|"conditional"|"automatic";
export type WorkflowStep={
  key:string;
  number:string;
  title:string;
  description:string;
  phase:WorkflowPhase;
  requirement:WorkflowRequirement;
  status:WorkflowStatus;
  automatic:boolean;
  manualOverride:boolean;
  current:boolean;
  blocked:boolean;
  note:string|null;
  resolutionReason:string|null;
  resolvedAt:string|null;
  actionHref:string;
  actionLabel:string;
};

const definitions=[
  {key:"000",number:"000",title:"A first introduction",description:"Collect the essential event information",phase:"lead",requirement:"required",actionLabel:"Review lead details"},
  {key:"001",number:"001",title:"Your personal proposal",description:"Send the offer and complete galleries",phase:"lead",requirement:"required",actionLabel:"Open connected offer"},
  {key:"002",number:"002",title:"A thoughtful follow-up",description:"First follow-up",phase:"lead",requirement:"conditional",actionLabel:"Compose follow-up"},
  {key:"003",number:"003",title:"Staying in touch",description:"Second and final follow-up",phase:"lead",requirement:"conditional",actionLabel:"Compose final follow-up"},
  {key:"004",number:"004",title:"Welcome to our collaboration",description:"Send the booking thank-you message",phase:"lead",requirement:"required",actionLabel:"Compose welcome email"},
  {key:"005",number:"005",title:"Your personal Client Portal",description:"Send the questionnaire",phase:"lead",requirement:"required",actionLabel:"Compose Client Portal email"},
  {key:"006",number:"006",title:"Collaboration agreement",description:"Send the contract for signature",phase:"lead",requirement:"required",actionLabel:"Compose contract email"},
  {key:"job-accepted",number:"✓",title:"JOB ACCEPTED",description:"Automatic status change",phase:"lead",requirement:"automatic",actionLabel:"Review onboarding"},
  {key:"009",number:"009",title:"Organizing the schedule",description:"Timeline 60 days before the event",phase:"production",requirement:"required",actionLabel:"Compose schedule email"},
  {key:"main-shoot",number:"DAY",title:"EVENT DAY · MAIN SHOOT",description:"Photography coverage of the day",phase:"production",requirement:"required",actionLabel:"Review production"},
  {key:"007",number:"007",title:"A personal thank you",description:"Send the day after the event",phase:"completion",requirement:"required",actionLabel:"Compose thank-you"},
  {key:"008",number:"008",title:"Gallery delivery",description:"Send after final gallery delivery",phase:"completion",requirement:"required",actionLabel:"Compose gallery delivery"},
  {key:"gallery-complete",number:"✓",title:"DELIVERY · JOB COMPLETE",description:"The work and final delivery are complete",phase:"completion",requirement:"automatic",actionLabel:"Review completion"},
] as const;

type OverrideRow=RowDataPacket&{step_key:string;status:WorkflowStatus;note:string|null;completed_at:Date|null;updated_at:Date};
type EvidenceRow=RowDataPacket&{lead_status:string;event_type:"wedding"|"baptism";offer_slug:string|null;offer_status:string|null;offer_sent_at:Date|null;offer_accepted_at:Date|null;client_id:string|null;portal_slug:string|null;questionnaire_status:string|null;contract_status:string|null;invoice_status:string|null;booking_status:string|null;timeline_status:string|null;production_status:string|null;timeline_slug:string|null};
type DeliveryRow=RowDataPacket&{template_id:string;status:string;sent_at:Date|null};
type Resolution={status:WorkflowStatus;reason:string;resolvedAt:string|null};

const isTerminal=(status:WorkflowStatus)=>status==="completed"||status==="accepted"||status==="skipped";
const done=(value?:string|null)=>value==="sent"||value==="completed"||value==="signed"||value==="part-paid"||value==="paid"||value==="approved"||value==="published";
const iso=(value:Date|null|undefined)=>value?new Date(value).toISOString():null;

export async function getClientWorkflow(leadId:string){
  const db=getDatabase();
  const[[evidenceRows],[deliveries],[overrides]]=await Promise.all([
    db.query<EvidenceRow[]>(`SELECT l.status lead_status,l.event_type,o.slug offer_slug,o.status offer_status,o.sent_at offer_sent_at,o.accepted_at offer_accepted_at,c.id client_id,p.public_slug portal_slug,
      COALESCE(ndq.status,b.questionnaire_status,onb.questionnaire_status) questionnaire_status,
      COALESCE(ndc.status,b.contract_status,onb.agreement_status) contract_status,
      COALESCE(ndi.status,b.invoice_status,onb.invoice_status) invoice_status,onb.booking_status,onb.timeline_status,onb.production_status,t.slug timeline_slug
      FROM leads l LEFT JOIN offers o ON o.id=(SELECT o2.id FROM offers o2 WHERE o2.lead_id=l.id ORDER BY o2.created_at DESC LIMIT 1)
      LEFT JOIN clients c ON c.lead_id=l.id LEFT JOIN client_portals p ON p.client_id=c.id AND p.status='active'
      LEFT JOIN onboarding onb ON onb.client_id=c.id LEFT JOIN lead_booking_documents b ON b.lead_id=l.id
      LEFT JOIN lead_document_records ndq ON ndq.lead_id=l.id AND ndq.document_type='questionnaire'
      LEFT JOIN lead_document_records ndc ON ndc.lead_id=l.id AND ndc.document_type='contract'
      LEFT JOIN lead_document_records ndi ON ndi.lead_id=l.id AND ndi.document_type='invoice'
      LEFT JOIN timelines t ON t.id=(SELECT t2.id FROM timelines t2 WHERE t2.client_id=c.id ORDER BY t2.updated_at DESC LIMIT 1)
      WHERE l.id=? LIMIT 1`,[leadId]),
    db.query<DeliveryRow[]>("SELECT template_id,status,sent_at FROM email_deliveries WHERE lead_id=? OR client_id=(SELECT id FROM clients WHERE lead_id=? LIMIT 1)",[leadId,leadId]),
    db.query<OverrideRow[]>("SELECT step_key,status,note,completed_at,updated_at FROM client_workflow_steps WHERE lead_id=?",[leadId]),
  ]);
  const evidence=evidenceRows[0];
  if(!evidence)return null;

  const sentDeliveries=deliveries.filter(item=>item.status==="sent");
  const sentAt=(templateId:string)=>iso(sentDeliveries.filter(item=>item.template_id===templateId).sort((a,b)=>new Date(b.sent_at??0).getTime()-new Date(a.sent_at??0).getTime())[0]?.sent_at);
  const sent=(templateId:string)=>Boolean(sentAt(templateId));
  const accepted=evidence.offer_status==="accepted";
  const laterFollowupAt=sentAt("003")??sentAt("002");
  const inferred:Record<string,Resolution|undefined>={
    "000":sent("000")?{status:"completed",reason:"Template 000 was delivered successfully.",resolvedAt:sentAt("000")}:accepted?{status:"skipped",reason:"Skipped automatically because the connected offer was already accepted.",resolvedAt:iso(evidence.offer_accepted_at)}:laterFollowupAt?{status:"skipped",reason:"Skipped automatically because a later follow-up was already delivered.",resolvedAt:laterFollowupAt}:undefined,
    "001":accepted?{status:"accepted",reason:"The connected offer was accepted.",resolvedAt:iso(evidence.offer_accepted_at)}:sent("001")||["sent","viewed"].includes(evidence.offer_status??"")?{status:"completed",reason:"The connected offer was sent.",resolvedAt:sentAt("001")??iso(evidence.offer_sent_at)}:laterFollowupAt?{status:"skipped",reason:"Skipped automatically because a later follow-up was already delivered.",resolvedAt:laterFollowupAt}:undefined,
    "002":sent("002")?{status:"completed",reason:"Template 002 was delivered successfully.",resolvedAt:sentAt("002")}:accepted?{status:"skipped",reason:"Skipped automatically because the offer was accepted before the first follow-up.",resolvedAt:iso(evidence.offer_accepted_at)}:sent("003")?{status:"skipped",reason:"Skipped automatically because the final follow-up was already sent.",resolvedAt:sentAt("003")}:undefined,
    "003":sent("003")?{status:"completed",reason:"Template 003 was delivered successfully.",resolvedAt:sentAt("003")}:accepted?{status:"skipped",reason:"Skipped automatically because the offer was accepted before the final follow-up.",resolvedAt:iso(evidence.offer_accepted_at)}:undefined,
    "004":sent("004")?{status:"completed",reason:"Template 004 was delivered successfully.",resolvedAt:sentAt("004")}:undefined,
    "005":sent("005")||done(evidence.questionnaire_status)?{status:"completed",reason:done(evidence.questionnaire_status)?"The questionnaire was completed in the Client Portal.":"Template 005 was delivered successfully.",resolvedAt:sentAt("005")}:undefined,
    "006":done(evidence.contract_status)?{status:"completed",reason:"The agreement was signed or approved.",resolvedAt:null}:undefined,
    "007":sent("007")?{status:"completed",reason:"Template 007 was delivered after the event.",resolvedAt:sentAt("007")}:undefined,
    "job-accepted":evidence.booking_status==="confirmed"||(done(evidence.contract_status)&&done(evidence.invoice_status))?{status:"accepted",reason:"Contract approval and payment confirmed the booking automatically.",resolvedAt:null}:undefined,
    "009":evidence.timeline_slug&&evidence.timeline_status==="approved"?{status:"completed",reason:"The client timeline was approved.",resolvedAt:null}:undefined,
    "main-shoot":["event-complete","wedding-complete","editing","gallery-delivered"].includes(evidence.production_status??"")?{status:"completed",reason:`The ${evidence.event_type} coverage was marked complete.`,resolvedAt:null}:undefined,
    "008":sent("008")?{status:"completed",reason:"Template 008 delivered the final gallery message.",resolvedAt:sentAt("008")}:undefined,
    "gallery-complete":evidence.production_status==="gallery-delivered"||evidence.lead_status==="completed"?{status:"completed",reason:"The final delivery was marked complete.",resolvedAt:null}:undefined,
  };

  const overrideMap=new Map(overrides.map(item=>[item.step_key,item]));
  const resolved=definitions.map(item=>{
    const evidenceResolution=inferred[item.key];
    const override=overrideMap.get(item.key);
    const progressionLocked=Boolean(laterFollowupAt&&["000","001"].includes(item.key))||Boolean(sent("003")&&item.key==="002");
    const deliveryLocked=sent(item.key)||Boolean(accepted&&["000","001"].includes(item.key))||item.requirement==="automatic";
    if(evidenceResolution&&(progressionLocked||deliveryLocked))return{...evidenceResolution,automatic:true,manualOverride:false,note:override?.note??null};
    if(override&&item.requirement!=="automatic")return{status:override.status,reason:override.note??"Status set manually by an administrator.",resolvedAt:isTerminal(override.status)?iso(override.completed_at??override.updated_at):null,automatic:false,manualOverride:true,note:override.note};
    if(evidenceResolution)return{...evidenceResolution,automatic:true,manualOverride:false,note:override?.note??null};
    return{status:"not-done" as WorkflowStatus,reason:null,resolvedAt:null,automatic:false,manualOverride:false,note:override?.note??null};
  });
  const firstUnresolved=resolved.findIndex(item=>!isTerminal(item.status));
  const waitingForOffer=!accepted&&!sent("003")&&firstUnresolved>=4;
  const currentIndex=waitingForOffer?-1:firstUnresolved;
  const clientBase=evidence.client_id?`/admin/clients/${evidence.client_id}`:`/admin/leads/${leadId}`;
  const actionFor=(key:string)=>key==="000"?`/admin/leads/${leadId}`:key==="001"&&evidence.offer_slug?"/admin/offers":key==="001"?`/admin/dashboard?lead=${leadId}`:["002","003","004","005","006","007","008","009"].includes(key)&&evidence.client_id?`${clientBase}/email?template=${key}`:key==="009"?"/admin/timelines":key==="job-accepted"?"/admin/onboarding":clientBase;
  const steps:WorkflowStep[]=definitions.map((item,index)=>{
    const resolution=resolved[index];
    const current=index===currentIndex;
    const eventTitle=item.key==="main-shoot"?`${evidence.event_type.toUpperCase()} DAY · MAIN SHOOT`:item.title;
    return{...item,title:eventTitle,phase:item.phase as WorkflowPhase,requirement:item.requirement as WorkflowRequirement,status:current?"pending":resolution.status,automatic:resolution.automatic,manualOverride:resolution.manualOverride,current,blocked:!isTerminal(resolution.status)&&(waitingForOffer&&index>=4||currentIndex>=0&&index>currentIndex),note:resolution.note,resolutionReason:resolution.reason,resolvedAt:resolution.resolvedAt,actionHref:actionFor(item.key)};
  });
  const currentStep=steps.find(step=>step.current)??null;
  const isComplete=resolved.every(item=>isTerminal(item.status));
  return{
    leadId,
    clientId:evidence.client_id,
    eventType:evidence.event_type,
    steps,
    currentStep,
    nextAction:currentStep?{stepKey:currentStep.key,title:currentStep.title,href:currentStep.actionHref,label:currentStep.actionLabel}:null,
    waitingFor:waitingForOffer?{type:"offer-response" as const,title:"Waiting for the couple to respond to the offer."}:null,
    isComplete,
    completedCount:steps.filter(step=>isTerminal(step.status)).length,
    totalCount:steps.length,
  };
}

export async function setWorkflowStepStatus(leadId:string,stepKey:string,status:WorkflowStatus,note:string|null){
  const definition=definitions.find(item=>item.key===stepKey);
  if(!definition)throw new Error("Unknown workflow step.");
  if(status==="skipped"&&definition.requirement!=="conditional")throw new Error("Required and automatic workflow steps cannot be skipped.");
  if(definition.requirement==="automatic"&&isTerminal(status))throw new Error("Automatic workflow gates can only be completed by their connected evidence.");
  if(status==="accepted"&&stepKey!=="001")throw new Error("Accepted is only valid for the offer decision.");
  await getDatabase().execute(`INSERT INTO client_workflow_steps (lead_id,step_key,status,note,completed_at) VALUES (?,?,?,?,IF(? IN ('completed','accepted'),CURRENT_TIMESTAMP,NULL)) ON DUPLICATE KEY UPDATE status=VALUES(status),note=VALUES(note),completed_at=IF(VALUES(status) IN ('completed','accepted'),COALESCE(completed_at,CURRENT_TIMESTAMP),NULL)`,[leadId,stepKey,status,note,status]);
}
export async function clearWorkflowStepStatus(leadId:string,stepKey:string){await getDatabase().execute("DELETE FROM client_workflow_steps WHERE lead_id=? AND step_key=?",[leadId,stepKey])}
