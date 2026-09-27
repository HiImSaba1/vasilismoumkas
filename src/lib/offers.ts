import "server-only";
import { randomBytes, randomUUID } from "node:crypto";
import type { RowDataPacket } from "mysql2/promise";
import { getDatabase } from "@/lib/database";
import type { CrmPayload } from "@/lib/crm-records";
import { cancelOfferAutomationsBySlug, scheduleOfferFollowups } from "@/lib/automations";
import { sendInternalOfferAcceptance } from "@/lib/email-delivery";
import { contractForWorkflowProfile } from "@/lib/contract-templates";
import { lockClientEventDate, releaseClientEventDate } from "@/lib/event-date-lock";

export type OfferStatus = "draft" | "sent" | "viewed" | "accepted" | "rejected" | "expired" | "revoked";
export const OFFER_VALIDITY_DAYS = 30;
export type OfferRecord = { id:number; slug:string; leadId:string|null; eventType:"wedding"|"baptism"; language:"en"|"gr"; clientName:string|null; clientEmail:string|null; status:OfferStatus; expiresAt:string|null; sentAt:string|null; firstViewedAt:string|null; lastViewedAt:string|null; viewCount:number; acceptedAt:string|null; payload:CrmPayload & { response?: boolean & Record<string,unknown> }; createdAt:string; updatedAt:string };
type OfferRow = RowDataPacket & { id:number; slug:string; lead_id:string|null; event_type:OfferRecord["eventType"]; language:OfferRecord["language"]; client_name:string|null; client_email:string|null; status:OfferStatus; expires_at:Date|string|null; sent_at:Date|string|null; first_viewed_at:Date|string|null; last_viewed_at?:Date|string|null; view_count?:number|string; accepted_at:Date|string|null; payload:string|CrmPayload; created_at:Date|string; updated_at:Date|string };
const iso=(value:Date|string|null)=>value?new Date(value).toISOString():null;
const map=(row:OfferRow):OfferRecord=>({id:Number(row.id),slug:row.slug,leadId:row.lead_id,eventType:row.event_type,language:row.language,clientName:row.client_name,clientEmail:row.client_email,status:row.status,expiresAt:iso(row.expires_at),sentAt:iso(row.sent_at),firstViewedAt:iso(row.first_viewed_at),lastViewedAt:iso(row.last_viewed_at??null),viewCount:Number(row.view_count??0),acceptedAt:iso(row.accepted_at),payload:typeof row.payload==="string"?JSON.parse(row.payload):row.payload,createdAt:iso(row.created_at)!,updatedAt:iso(row.updated_at)!});

export async function listOffers(options?:{includeExpired?:boolean}){
  await getDatabase().execute(`UPDATE offers
    SET expires_at=DATE_ADD(sent_at,INTERVAL ${OFFER_VALIDITY_DAYS} DAY),
        status=CASE
          WHEN status='expired' AND DATE_ADD(sent_at,INTERVAL ${OFFER_VALIDITY_DAYS} DAY)>CURRENT_TIMESTAMP
            THEN CASE WHEN first_viewed_at IS NULL THEN 'sent' ELSE 'viewed' END
          ELSE status
        END
    WHERE sent_at IS NOT NULL AND status IN ('sent','viewed','expired')`);
  await getDatabase().execute("UPDATE offers SET status='expired' WHERE expires_at IS NOT NULL AND expires_at<=CURRENT_TIMESTAMP AND status IN ('sent','viewed')");
  const expiredFilter=options?.includeExpired===false?" WHERE o.status<>'expired'":"";
  const[rows]=await getDatabase().query<OfferRow[]>(`SELECT o.*,COALESCE(views.view_count,0) AS view_count,views.last_viewed_at FROM offers o LEFT JOIN (SELECT offer_id,COUNT(*) AS view_count,MAX(occurred_at) AS last_viewed_at FROM offer_events WHERE event_type='viewed' GROUP BY offer_id) views ON views.offer_id=o.id${expiredFilter} ORDER BY o.created_at DESC`);
  return rows.map(map);
}
export async function getAdminOffer(slug:string){
  const[rows]=await getDatabase().query<OfferRow[]>("SELECT * FROM offers WHERE slug=? LIMIT 1",[slug]);
  return rows[0]?map(rows[0]):null;
}
export async function getLatestOfferForLead(leadId:string){const[rows]=await getDatabase().query<OfferRow[]>("SELECT * FROM offers WHERE lead_id=? ORDER BY created_at DESC LIMIT 1",[leadId]);return rows[0]?map(rows[0]):null}
export async function connectOfferToLead(slug:string,leadId:string){const connection=await getDatabase().getConnection();try{await connection.beginTransaction();const[offers]=await connection.query<OfferRow[]>("SELECT * FROM offers WHERE slug=? FOR UPDATE",[slug]);const offer=offers[0];if(!offer)throw new Error("Offer not found");if(offer.lead_id&&offer.lead_id!==leadId)throw new Error("This offer is already connected to another lead");const[leads]=await connection.query<(RowDataPacket&{email:string|null;couple_names:string})[]>("SELECT email,couple_names FROM leads WHERE id=? FOR UPDATE",[leadId]);const lead=leads[0];if(!lead)throw new Error("Lead not found");await connection.execute("UPDATE offers SET lead_id=?,client_email=COALESCE(client_email,?),client_name=COALESCE(client_name,?),payload=JSON_SET(payload,'$.leadId',?,'$.clientEmail',COALESCE(?,'')),updated_at=CURRENT_TIMESTAMP WHERE id=?",[leadId,lead.email,lead.couple_names,leadId,lead.email,offer.id]);await connection.execute("UPDATE leads SET status=CASE WHEN ? IN ('sent','viewed') THEN 'offer-sent' ELSE 'offer-draft' END WHERE id=? AND status NOT IN ('converted','accepted')",[offer.status,leadId]);await connection.execute("INSERT INTO activity_log (lead_id,offer_id,event_type,summary) VALUES (?,?,'offer-connected','Existing offer connected to lead')",[leadId,offer.id]);await connection.commit()}catch(error){await connection.rollback();throw error}finally{connection.release()}}
export async function updateOffer(slug:string,payload:CrmPayload){
  const offer=await getAdminOffer(slug);if(!offer)throw new Error("Offer not found");
  if(!(["draft","revoked"] as OfferStatus[]).includes(offer.status))throw new Error("Create a revised private link before editing this offer");
  const eventType=payload.type==="baptism"?"baptism":"wedding";const language=payload.lang==="gr"?"gr":"en";
  const clientName=typeof payload.n==="string"?payload.n:null;const clientEmail=typeof payload.clientEmail==="string"?payload.clientEmail:null;
  await getDatabase().execute("UPDATE offers SET event_type=?,language=?,client_name=?,client_email=?,payload=?,updated_at=CURRENT_TIMESTAMP WHERE slug=?",[eventType,language,clientName,clientEmail,JSON.stringify(payload),slug]);
  await event(slug,"edited");
}
export async function deleteOffer(slug:string){
  const connection=await getDatabase().getConnection();
  try{await connection.beginTransaction();const[rows]=await connection.query<OfferRow[]>("SELECT * FROM offers WHERE slug=? FOR UPDATE",[slug]);const offer=rows[0];if(!offer)throw new Error("Offer not found");if(!(["draft","revoked"] as OfferStatus[]).includes(offer.status))throw new Error("Only draft or revoked offers can be deleted");
    const[clients]=await connection.query<(RowDataPacket&{total:number})[]>("SELECT COUNT(*) total FROM clients WHERE accepted_offer_id=?",[offer.id]);if(Number(clients[0]?.total))throw new Error("Accepted offers cannot be deleted");
    await connection.execute("DELETE FROM offers WHERE id=?",[offer.id]);await connection.commit();
  }catch(error){await connection.rollback();throw error}finally{connection.release()}
}
export async function markOfferSent(slug:string){
  const offer=await getAdminOffer(slug);if(!offer)throw new Error("Offer not found");
  if(!(["draft","sent","viewed"] as OfferStatus[]).includes(offer.status))throw new Error(`A ${offer.status} offer cannot be marked as sent.`);
  await getDatabase().execute(`UPDATE offers o
    LEFT JOIN (
      SELECT offer_id,MIN(sent_at) AS first_sent_at
      FROM email_deliveries
      WHERE template_id='001' AND status='sent' AND sent_at IS NOT NULL
      GROUP BY offer_id
    ) delivery ON delivery.offer_id=o.id
    SET o.status='sent',
        o.sent_at=COALESCE(o.sent_at,delivery.first_sent_at,CURRENT_TIMESTAMP),
        o.expires_at=DATE_ADD(COALESCE(o.sent_at,delivery.first_sent_at,CURRENT_TIMESTAMP),INTERVAL ${OFFER_VALIDITY_DAYS} DAY)
    WHERE o.slug=?`,[slug]);
  const updated=await getAdminOffer(slug);
  await event(slug,"sent",{expiresAt:updated?.expiresAt,source:offer.status==="draft"&&updated?.sentAt!==offer.sentAt?"delivery-history-reconciled":"admin"});
  await getDatabase().execute("UPDATE leads l JOIN offers o ON o.lead_id=l.id SET l.status='offer-sent' WHERE o.slug=?",[slug]);
  await scheduleOfferFollowups(slug);
}
export async function revokeOffer(slug:string){await getDatabase().execute("UPDATE offers SET status='revoked' WHERE slug=? AND status<>'accepted'",[slug]);await event(slug,"revoked");await cancelOfferAutomationsBySlug(slug,"Offer revoked")}
export async function rejectOffer(slug:string){const[result]=await getDatabase().execute<import("mysql2/promise").ResultSetHeader>("UPDATE offers SET status='rejected' WHERE slug=? AND status<>'accepted'",[slug]);if(!result.affectedRows)throw new Error("An accepted offer cannot be rejected. Its client workspace must remain preserved.");await event(slug,"rejected",{source:"admin"});await cancelOfferAutomationsBySlug(slug,"Offer rejected by admin")}
export async function regenerateOffer(slug:string){
  const[rows]=await getDatabase().query<OfferRow[]>("SELECT * FROM offers WHERE slug=? LIMIT 1",[slug]);const current=rows[0];if(!current)throw new Error("Offer not found");
  const prefix=slug.replace(/-[a-f0-9]{16}$/i,"").slice(0,165);const next=`${prefix}-${randomBytes(8).toString("hex")}`;
  await getDatabase().execute(`INSERT INTO offers (slug,lead_id,event_type,language,client_name,client_email,status,payload) VALUES (?,?,?,?,?,?,'draft',?)`,[next,current.lead_id,current.event_type,current.language,current.client_name,current.client_email,JSON.stringify(typeof current.payload==="string"?JSON.parse(current.payload):current.payload)]);
  await event(slug,"regenerated",{newSlug:next});await getDatabase().execute("UPDATE offers SET status='revoked' WHERE slug=? AND status<>'accepted'",[slug]);return next;
}
export async function recordOfferView(slug:string){const connection=await getDatabase().getConnection();try{await connection.beginTransaction();const[rows]=await connection.query<(RowDataPacket&{id:number;status:OfferStatus;first_viewed_at:Date|string|null})[]>("SELECT id,status,first_viewed_at FROM offers WHERE slug=? FOR UPDATE",[slug]);const offer=rows[0];if(!offer||!( ["sent","viewed"] as OfferStatus[]).includes(offer.status)){await connection.rollback();return}const reopened=Boolean(offer.first_viewed_at);await connection.execute("UPDATE offers SET status='viewed',first_viewed_at=COALESCE(first_viewed_at,CURRENT_TIMESTAMP) WHERE id=?",[offer.id]);await connection.execute("INSERT INTO offer_events (offer_id,event_type,metadata) VALUES (?,'viewed',?)",[offer.id,JSON.stringify({reopened})]);await connection.commit()}catch(error){await connection.rollback();throw error}finally{connection.release()}}
export async function respondToOffer(slug:string,input:{action:"accept"|"revision";name:string;email:string;packageName?:string;message?:string},options?:{adminOverride?:boolean}){
  const connection=await getDatabase().getConnection();
  let dateLock:string|null=null;
  try{await connection.beginTransaction();const[rows]=await connection.query<OfferRow[]>("SELECT * FROM offers WHERE slug=? FOR UPDATE",[slug]);const offer=rows[0];const publiclyAvailable=offer&&(["sent","viewed"] as OfferStatus[]).includes(offer.status)&&(!offer.expires_at||new Date(offer.expires_at)>new Date());if(!offer||(!options?.adminOverride&&!publiclyAvailable)||offer.status==="accepted")throw new Error(offer?.status==="accepted"?"Offer is already accepted":"Offer unavailable");
    const payload=typeof offer.payload==="string"?JSON.parse(offer.payload):offer.payload;payload.response={...input,submittedAt:new Date().toISOString()};
    if(input.action==="accept"){
      const[leadDates]=offer.lead_id?await connection.query<(RowDataPacket&{event_date:Date|null})[]>("SELECT event_date FROM leads WHERE id=? LIMIT 1",[offer.lead_id]):[[]];
      const[linkedClients]=await connection.query<(RowDataPacket&{id:string})[]>("SELECT id FROM clients WHERE accepted_offer_id=? OR (lead_id IS NOT NULL AND lead_id=?) LIMIT 1",[offer.id,offer.lead_id]);
      dateLock=await lockClientEventDate(connection,leadDates[0]?.event_date??null,linkedClients[0]?.id);
      await connection.execute("UPDATE offers SET status='accepted',accepted_at=CURRENT_TIMESTAMP,payload=? WHERE id=?",[JSON.stringify(payload),offer.id]);
      if(offer.lead_id)await connection.execute("UPDATE leads SET status='converted' WHERE id=?",[offer.lead_id]);
      const[existing]=await connection.query<(RowDataPacket&{id:string})[]>("SELECT id FROM clients WHERE accepted_offer_id=? OR (lead_id IS NOT NULL AND lead_id=?) LIMIT 1",[offer.id,offer.lead_id]);
      const clientId=existing[0]?.id??randomUUID();
      if(!existing[0]){
        const[leadRows]=offer.lead_id?await connection.query<(RowDataPacket&{phone:string|null;event_date:Date|null;ceremony_location:string|null;reception_location:string|null})[]>("SELECT phone,event_date,ceremony_location,reception_location FROM leads WHERE id=? LIMIT 1",[offer.lead_id]):[[]];
        const lead=leadRows[0];
        await connection.execute("INSERT INTO clients (id,lead_id,accepted_offer_id,event_type,couple_names,email,phone,event_date,ceremony_location,reception_location) VALUES (?,?,?,?,?,?,?,?,?,?)",[clientId,offer.lead_id,offer.id,offer.event_type,input.name,input.email,lead?.phone??null,lead?.event_date??null,lead?.ceremony_location??null,lead?.reception_location??null]);
      }else await connection.execute("UPDATE clients SET accepted_offer_id=?,couple_names=?,email=? WHERE id=?",[offer.id,input.name,input.email,clientId]);
      await connection.execute("INSERT IGNORE INTO onboarding (id,client_id) VALUES (?,?)",[randomUUID(),clientId]);
      await connection.execute("INSERT IGNORE INTO client_portals (id,client_id,public_slug) VALUES (?,?,?)",[randomUUID(),clientId,`${slug}-${randomUUID().replaceAll("-","").slice(0,12)}`]);
      if(offer.lead_id){
        const selected=Object.values(payload).find(value=>value&&typeof value==="object"&&!Array.isArray(value)&&(value as Record<string,unknown>).ph===input.packageName) as Record<string,unknown>|undefined;
        const collectionPrice=String(selected?.p??"").replace(/[^0-9.,]/g,"").replace(",",".");
        const profilePrefix=`${offer.event_type}-${offer.language}`;
        for(const[type,template]of [["questionnaire",`${profilePrefix}-questionnaire`],["contract",`${profilePrefix}-contract`],["invoice",`${profilePrefix}-invoice`]] as const){
          const data=type==="contract"?{language:offer.language,contract_text:contractForWorkflowProfile(offer.event_type,offer.language)}:type==="invoice"?{client_name:input.name,client_email:input.email,collection_name:input.packageName??"Selected collection",collection_hours:String(selected?.h??""),collection_photographers:String(selected?.phot??""),collection_images:String(selected?.img??""),collection_album_prints:String(selected?.bx??""),collection_extras:String(selected?.cs??""),subtotal:collectionPrice,total:collectionPrice,prepaid_amount:"0",balance_due:collectionPrice,installment_1_status:"unpaid",installment_1_amount:collectionPrice,installment_1_due:"",payment_url:""}:{};
          await connection.execute("INSERT IGNORE INTO lead_document_records (id,lead_id,document_type,template_key,status,document_data) VALUES (?,?,?,?,\"draft\",?)",[randomUUID(),offer.lead_id,type,template,JSON.stringify(data)]);
        }
      }
    }else await connection.execute("UPDATE offers SET payload=? WHERE id=?",[JSON.stringify(payload),offer.id]);
    await connection.execute("INSERT INTO offer_events (offer_id,event_type,metadata) VALUES (?,?,?)",[offer.id,input.action==="accept"?"accepted":"revision-requested",JSON.stringify(input)]);await connection.execute("UPDATE automation_jobs SET status='cancelled',completed_at=CURRENT_TIMESTAMP,last_error='Client responded' WHERE offer_id=? AND status IN ('scheduled','failed')",[offer.id]);await connection.commit();if(input.action==="accept"){const origin=process.env.NEXT_PUBLIC_SITE_URL??"http://localhost:3000";const notice=await sendInternalOfferAcceptance({clientName:input.name,clientEmail:input.email,offerUrl:`${origin}/offer/${slug}`,packageName:input.packageName,message:input.message});await getDatabase().execute("INSERT INTO offer_events (offer_id,event_type,metadata) VALUES (?,?,?)",[offer.id,notice.success?"acceptance-notification-sent":"acceptance-notification-failed",JSON.stringify(notice)]);if(!notice.success)console.error("Offer acceptance notification failed:",notice.error)}
  }catch(error){await connection.rollback();throw error}finally{await releaseClientEventDate(connection,dateLock);connection.release()}
}
async function event(slug:string,type:string,metadata?:Record<string,unknown>){await getDatabase().execute("INSERT INTO offer_events (offer_id,event_type,metadata) SELECT id, ?, ? FROM offers WHERE slug=?",[type,metadata?JSON.stringify(metadata):null,slug])}
