import "server-only";
import type {PoolConnection,RowDataPacket} from "mysql2/promise";
import {getDatabase} from "@/lib/database";

type EditableTextDocument="contract"|"questionnaire";
type DocumentRow=RowDataPacket&{id:string;lead_id:string;status:string;document_data:string|Record<string,unknown>};
const parse=(value:DocumentRow["document_data"]):Record<string,unknown>=>typeof value==="string"?JSON.parse(value) as Record<string,unknown>:value;
const money=(value:number)=>Math.round((value+Number.EPSILON)*100)/100;

async function existingDocument(connection:PoolConnection,clientId:string,type:"contract"|"questionnaire"|"invoice"){
  const[rows]=await connection.query<DocumentRow[]>("SELECT d.id,d.lead_id,d.status,d.document_data FROM clients c JOIN lead_document_records d ON d.lead_id=c.lead_id AND d.document_type=? WHERE c.id=? LIMIT 1 FOR UPDATE",[type,clientId]);
  if(!rows[0])throw new Error(`This client does not have an existing ${type} record. Provision it from the connected workflow first.`);
  return rows[0];
}

export async function updateClientTextDocument(input:{clientId:string;type:EditableTextDocument;status:"draft"|"sent";data:Record<string,string>}){
  const connection=await getDatabase().getConnection();
  try{
    await connection.beginTransaction();
    const document=await existingDocument(connection,input.clientId,input.type);
    if(input.type==="contract"&&["signed","approved"].includes(document.status))throw new Error("A signed agreement is immutable. Create a formally revised agreement instead of changing the accepted record.");
    if(input.type==="questionnaire"&&document.status==="completed")throw new Error("A completed questionnaire is preserved with its submitted answers. Add follow-up information in client notes.");
    const next={...parse(document.document_data),...input.data};
    await connection.execute("UPDATE lead_document_records SET status=?,document_data=? WHERE id=?",[input.status,JSON.stringify(next),document.id]);
    if(input.type==="contract")await connection.execute("UPDATE onboarding SET agreement_status=? WHERE client_id=?",[input.status==="sent"?"sent":"not-sent",input.clientId]);
    else await connection.execute("UPDATE onboarding SET questionnaire_status=? WHERE client_id=?",[input.status==="sent"?"sent":"not-sent",input.clientId]);
    await connection.execute("INSERT INTO activity_log (lead_id,client_id,event_type,summary,metadata) VALUES (?,?, 'client-document-overridden',?,?)",[document.lead_id,input.clientId,`${input.type} updated for this client only`,JSON.stringify({documentType:input.type,status:input.status})]);
    await connection.commit();
  }catch(error){await connection.rollback();throw error}finally{connection.release()}
}

export async function updateClientInvoiceTerms(input:{clientId:string;collectionName:string;total:number;vatRate:number;depositPercentage:number}){
  const connection=await getDatabase().getConnection();
  try{
    await connection.beginTransaction();
    const document=await existingDocument(connection,input.clientId,"invoice");
    const[payments]=await connection.query<(RowDataPacket&{paid:string|number})[]>("SELECT COALESCE(SUM(amount),0) paid FROM invoice_payments WHERE client_id=? AND voided_at IS NULL",[input.clientId]);
    const totalPaid=money(Number(payments[0]?.paid??0));
    const total=money(input.total);
    if(total<=0)throw new Error("Invoice total must be greater than zero.");
    if(total<totalPaid)throw new Error(`Invoice total cannot be lower than the recorded payments (€${totalPaid.toFixed(2)}).`);
    const vatRate=money(input.vatRate),depositPercentage=money(input.depositPercentage);
    const net=money(total/(1+vatRate/100));
    const vat=money(total-net);
    const depositTotal=money(total*depositPercentage/100);
    const depositNet=money(depositTotal/(1+vatRate/100));
    const depositVat=money(depositTotal-depositNet);
    const balance=money(total-totalPaid);
    const status=totalPaid>=total?"paid":totalPaid>0?"part-paid":"issued";
    const data={...parse(document.document_data),collection_name:input.collectionName,manual_total:String(total),total:String(total),subtotal:String(net),vat_rate:String(vatRate),vat_amount:String(vat),deposit_percentage:String(depositPercentage),deposit_net:String(depositNet),deposit_vat:String(depositVat),deposit_total:String(depositTotal),prepaid_amount:String(totalPaid),balance_due:String(balance)};
    await connection.execute("UPDATE lead_document_records SET status=?,document_data=? WHERE id=?",[status,JSON.stringify(data),document.id]);
    await connection.execute("UPDATE onboarding SET invoice_status=?,booking_status=IF(agreement_status='approved' AND ? IN ('part-paid','paid'),'confirmed',IF(booking_status='confirmed','pending',booking_status)) WHERE client_id=?",[status,status,input.clientId]);
    await connection.execute("INSERT INTO activity_log (lead_id,client_id,event_type,summary,metadata) VALUES (?,?, 'client-invoice-adjusted','Invoice terms updated for this client only',?)",[document.lead_id,input.clientId,JSON.stringify({total,vatRate,depositPercentage,status})]);
    await connection.commit();
  }catch(error){await connection.rollback();throw error}finally{connection.release()}
}
