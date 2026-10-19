import "server-only";
import { randomUUID } from "node:crypto";
import type { PoolConnection, RowDataPacket } from "mysql2/promise";
import { getDatabase } from "@/lib/database";
import { getClientExtraTotals } from "@/lib/client-extras";

export type InvoicePayment={id:string;clientId:string;amount:number;paidAt:string;paymentMethod:string|null;reference:string|null;note:string|null;voidedAt:string|null;voidReason:string|null;createdAt:string;updatedAt:string};
export type InvoicePaymentSummary={invoiceDocumentId:string;baseCollectionTotal:number;extrasNet:number;extrasVat:number;extrasTotal:number;invoiceTotal:number;requiredDeposit:number;depositSatisfied:boolean;totalPaid:number;balanceDue:number;status:"issued"|"part-paid"|"paid";documentUpdateRequired:boolean;payments:InvoicePayment[]};
export type InvoicePaymentInput={amount:number;paidAt:string;paymentMethod?:string|null;reference?:string|null;note?:string|null};

type InvoiceContext=RowDataPacket&{client_id:string;lead_id:string;document_id:string;document_data:string|Record<string,unknown>;offer_payload:string|Record<string,unknown>|null};
type PaymentRow=RowDataPacket&{id:string;client_id:string;amount:string|number;paid_at:Date|string;payment_method:string|null;reference:string|null;note:string|null;voided_at:Date|null;void_reason:string|null;created_at:Date;updated_at:Date};

const roundMoney=(value:number)=>Math.round((value+Number.EPSILON)*100)/100;
const money=(value:unknown)=>{const parsed=Number(String(value??"").replace(/[^0-9,.-]/g,"").replace(",","."));return Number.isFinite(parsed)?roundMoney(parsed):0};
const json=(value:string|Record<string,unknown>|null)=>typeof value==="string"?JSON.parse(value) as Record<string,unknown>:(value??{});
const dateOnly=(value:Date|string)=>value instanceof Date?value.toISOString().slice(0,10):String(value).slice(0,10);
const timestamp=(value:Date|null)=>value?new Date(value).toISOString():null;

function acceptedCollectionTotal(offerPayload:Record<string,unknown>,documentData:Record<string,unknown>){
  const manualTotal=money(documentData.manual_total);
  if(manualTotal>0)return manualTotal;
  const response=offerPayload.response&&typeof offerPayload.response==="object"&&!Array.isArray(offerPayload.response)?offerPayload.response as Record<string,unknown>:{};
  const packageName=String(response.packageName??documentData.collection_name??"");
  const selected=Object.values(offerPayload).find(value=>value&&typeof value==="object"&&!Array.isArray(value)&&String((value as Record<string,unknown>).ph??"")===packageName) as Record<string,unknown>|undefined;
  return money(selected?.p)||money(documentData.total)||money(documentData.subtotal);
}

async function context(connection:PoolConnection,clientId:string,lock=false){
  const[rows]=await connection.query<InvoiceContext[]>(`SELECT c.id client_id,c.lead_id,d.id document_id,d.document_data,o.payload offer_payload
    FROM clients c
    JOIN lead_document_records d ON d.lead_id=c.lead_id AND d.document_type='invoice'
    LEFT JOIN offers o ON o.id=c.accepted_offer_id
    WHERE c.id=? LIMIT 1${lock?" FOR UPDATE":""}`,[clientId]);
  if(!rows[0])throw new Error("This client does not have a connected invoice.");
  return rows[0];
}

async function activeTotal(connection:PoolConnection,clientId:string,excludeId?:string){
  const[rows]=await connection.query<(RowDataPacket&{total:string|number})[]>("SELECT COALESCE(SUM(amount),0) total FROM invoice_payments WHERE client_id=? AND voided_at IS NULL AND (? IS NULL OR id<>?)",[clientId,excludeId??null,excludeId??null]);
  return money(rows[0]?.total);
}

function normalizeInput(input:InvoicePaymentInput){
  const amount=money(input.amount);
  if(amount<=0)throw new Error("Payment amount must be greater than zero.");
  if(!/^\d{4}-\d{2}-\d{2}$/.test(input.paidAt))throw new Error("Choose a valid payment date.");
  return{amount,paidAt:input.paidAt,paymentMethod:input.paymentMethod?.trim().slice(0,80)||null,reference:input.reference?.trim().slice(0,190)||null,note:input.note?.trim().slice(0,5000)||null};
}

async function reconcile(connection:PoolConnection,invoice:InvoiceContext,totalPaid:number,total:number,baseCollectionTotal:number){
  const status:InvoicePaymentSummary["status"]=totalPaid>=total&&total>0?"paid":totalPaid>0?"part-paid":"issued";
  const balance=roundMoney(Math.max(0,total-totalPaid));
  const data={...json(invoice.document_data),prepaid_amount:String(totalPaid),balance_due:String(balance)};
  await connection.execute("UPDATE lead_document_records SET status=?,document_data=? WHERE id=?",[status,JSON.stringify(data),invoice.document_id]);
  const requiredDeposit=money(json(invoice.document_data).deposit_amount)||roundMoney(baseCollectionTotal*.25);
  await connection.execute("UPDATE onboarding SET invoice_status=?,booking_status=IF(agreement_status='approved' AND ?>=CAST(? AS DECIMAL(10,2)),'confirmed',IF(booking_status='confirmed','pending',booking_status)) WHERE client_id=?",[status,totalPaid,requiredDeposit,invoice.client_id]);
  await connection.execute("INSERT INTO automation_jobs (id,job_key,job_type,client_id,offer_id,template_id,scheduled_for,payload) SELECT ?,CONCAT('client:',c.id,':post-event-thank-you'),'post-event-thank-you',c.id,c.accepted_offer_id,'007',DATE_ADD(c.event_date,INTERVAL 1 DAY),JSON_OBJECT('source','invoice-payment-confirmed') FROM onboarding o JOIN clients c ON c.id=o.client_id WHERE c.id=? AND o.booking_status='confirmed' AND c.event_date IS NOT NULL ON DUPLICATE KEY UPDATE scheduled_for=IF(status IN ('scheduled','failed'),VALUES(scheduled_for),scheduled_for),preview_notified_at=IF(status IN ('scheduled','failed'),NULL,preview_notified_at)",[randomUUID(),invoice.client_id]);
  await connection.execute("INSERT INTO automation_jobs (id,job_key,job_type,client_id,template_id,scheduled_for,payload) SELECT ?,CONCAT('client:',c.id,':timeline-reminder'),'timeline-reminder',c.id,'009',DATE_SUB(c.event_date,INTERVAL 60 DAY),JSON_OBJECT('source','invoice-payment-confirmed') FROM onboarding o JOIN clients c ON c.id=o.client_id WHERE c.id=? AND o.booking_status='confirmed' AND c.event_date IS NOT NULL ON DUPLICATE KEY UPDATE scheduled_for=IF(status IN ('scheduled','failed'),VALUES(scheduled_for),scheduled_for),preview_notified_at=IF(status IN ('scheduled','failed'),NULL,preview_notified_at)",[randomUUID(),invoice.client_id]);
  return{status,balance};
}

export async function getInvoicePaymentSummary(clientId:string):Promise<InvoicePaymentSummary|null>{
  const connection=await getDatabase().getConnection();
  try{const invoice=await context(connection,clientId);const data=json(invoice.document_data);const baseCollectionTotal=acceptedCollectionTotal(json(invoice.offer_payload),data);const extras=await getClientExtraTotals(clientId);const total=roundMoney(baseCollectionTotal+extras.gross);const requiredDeposit=money(data.deposit_amount)||roundMoney(baseCollectionTotal*.25);const[rows]=await connection.query<PaymentRow[]>("SELECT * FROM invoice_payments WHERE client_id=? ORDER BY paid_at DESC,created_at DESC",[clientId]);const payments=rows.map(row=>({id:row.id,clientId:row.client_id,amount:money(row.amount),paidAt:dateOnly(row.paid_at),paymentMethod:row.payment_method,reference:row.reference,note:row.note,voidedAt:timestamp(row.voided_at),voidReason:row.void_reason,createdAt:new Date(row.created_at).toISOString(),updatedAt:new Date(row.updated_at).toISOString()}));const totalPaid=roundMoney(payments.filter(item=>!item.voidedAt).reduce((sum,item)=>sum+item.amount,0));return{invoiceDocumentId:invoice.document_id,baseCollectionTotal,extrasNet:extras.net,extrasVat:extras.vat,extrasTotal:extras.gross,invoiceTotal:total,requiredDeposit,depositSatisfied:requiredDeposit>0&&totalPaid>=requiredDeposit,totalPaid,balanceDue:roundMoney(Math.max(0,total-totalPaid)),status:totalPaid>=total&&total>0?"paid":totalPaid>0?"part-paid":"issued",documentUpdateRequired:extras.documentUpdateRequired,payments}}catch(error){if(error instanceof Error&&error.message.includes("does not have a connected invoice"))return null;throw error}finally{connection.release()}
}

export async function addInvoicePayment(clientId:string,input:InvoicePaymentInput){const payment=normalizeInput(input);const connection=await getDatabase().getConnection();try{await connection.beginTransaction();const invoice=await context(connection,clientId,true);const extras=await getClientExtraTotals(clientId);const baseCollectionTotal=acceptedCollectionTotal(json(invoice.offer_payload),json(invoice.document_data));const total=roundMoney(baseCollectionTotal+extras.gross);if(total<=0)throw new Error("The accepted collection does not have a valid total.");const paid=await activeTotal(connection,clientId);if(roundMoney(paid+payment.amount)>total)throw new Error(`Payment exceeds the remaining balance of €${roundMoney(total-paid).toFixed(2)}.`);const id=randomUUID();await connection.execute("INSERT INTO invoice_payments (id,client_id,invoice_document_id,amount,paid_at,payment_method,reference,note) VALUES (?,?,?,?,?,?,?,?)",[id,clientId,invoice.document_id,payment.amount,payment.paidAt,payment.paymentMethod,payment.reference,payment.note]);const nextPaid=roundMoney(paid+payment.amount);await reconcile(connection,invoice,nextPaid,total,baseCollectionTotal);await connection.execute("INSERT INTO activity_log (lead_id,client_id,event_type,summary,metadata) VALUES (?,?,'invoice-payment-added',?,?)",[invoice.lead_id,clientId,`Payment of €${payment.amount.toFixed(2)} recorded`,JSON.stringify({paymentId:id,amount:payment.amount,paidAt:payment.paidAt})]);await connection.commit();return id}catch(error){await connection.rollback();throw error}finally{connection.release()}}

export async function updateInvoicePayment(clientId:string,paymentId:string,input:InvoicePaymentInput){const payment=normalizeInput(input);const connection=await getDatabase().getConnection();try{await connection.beginTransaction();const invoice=await context(connection,clientId,true);const[existingRows]=await connection.query<(PaymentRow&{amount:string|number})[]>("SELECT * FROM invoice_payments WHERE id=? AND client_id=? AND voided_at IS NULL FOR UPDATE",[paymentId,clientId]);const existing=existingRows[0];if(!existing)throw new Error("Payment not found or already deleted.");const extras=await getClientExtraTotals(clientId);const baseCollectionTotal=acceptedCollectionTotal(json(invoice.offer_payload),json(invoice.document_data));const total=roundMoney(baseCollectionTotal+extras.gross);const otherPaid=await activeTotal(connection,clientId,paymentId);if(roundMoney(otherPaid+payment.amount)>total)throw new Error(`Payment exceeds the remaining balance of €${roundMoney(total-otherPaid).toFixed(2)}.`);await connection.execute("UPDATE invoice_payments SET amount=?,paid_at=?,payment_method=?,reference=?,note=? WHERE id=?",[payment.amount,payment.paidAt,payment.paymentMethod,payment.reference,payment.note,paymentId]);const nextPaid=roundMoney(otherPaid+payment.amount);await reconcile(connection,invoice,nextPaid,total,baseCollectionTotal);await connection.execute("INSERT INTO activity_log (lead_id,client_id,event_type,summary,metadata) VALUES (?,?,'invoice-payment-updated',?,?)",[invoice.lead_id,clientId,`Payment corrected to €${payment.amount.toFixed(2)}`,JSON.stringify({paymentId,beforeAmount:money(existing.amount),afterAmount:payment.amount,paidAt:payment.paidAt})]);await connection.commit()}catch(error){await connection.rollback();throw error}finally{connection.release()}}

export async function voidInvoicePayment(clientId:string,paymentId:string,reason:string){const cleanReason=reason.trim().slice(0,500);if(!cleanReason)throw new Error("A deletion reason is required.");const connection=await getDatabase().getConnection();try{await connection.beginTransaction();const invoice=await context(connection,clientId,true);const[rows]=await connection.query<(PaymentRow&{amount:string|number})[]>("SELECT * FROM invoice_payments WHERE id=? AND client_id=? AND voided_at IS NULL FOR UPDATE",[paymentId,clientId]);const payment=rows[0];if(!payment)throw new Error("Payment not found or already deleted.");await connection.execute("UPDATE invoice_payments SET voided_at=CURRENT_TIMESTAMP,void_reason=? WHERE id=?",[cleanReason,paymentId]);const extras=await getClientExtraTotals(clientId);const baseCollectionTotal=acceptedCollectionTotal(json(invoice.offer_payload),json(invoice.document_data));const total=roundMoney(baseCollectionTotal+extras.gross);const paid=await activeTotal(connection,clientId);await reconcile(connection,invoice,paid,total,baseCollectionTotal);await connection.execute("INSERT INTO activity_log (lead_id,client_id,event_type,summary,metadata) VALUES (?,?,'invoice-payment-voided',?,?)",[invoice.lead_id,clientId,`Payment of €${money(payment.amount).toFixed(2)} deleted`,JSON.stringify({paymentId,amount:money(payment.amount),reason:cleanReason})]);await connection.commit()}catch(error){await connection.rollback();throw error}finally{connection.release()}}
