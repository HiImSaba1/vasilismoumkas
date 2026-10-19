import "server-only";
import { randomUUID } from "node:crypto";
import type { PoolConnection,RowDataPacket } from "mysql2/promise";
import { getDatabase } from "@/lib/database";
import { calculateExtraFinancials,roundMoney } from "@/lib/extra-financials";

export type ExtraStatus="proposed"|"agreed"|"cancelled";
export type ExtraCatalogItem={key:string;titleEl:string;titleEn:string;descriptionEl:string|null;descriptionEn:string|null;defaultUnitPrice:number;requiresScope:boolean};
export type ClientExtra={id:string;clientId:string;catalogKey:string|null;titleEl:string;titleEn:string;descriptionEl:string|null;descriptionEn:string|null;coverageScope:string|null;quantity:number;unitPrice:number;vatRate:number;priceIncludesVat:boolean;status:ExtraStatus;showInPortal:boolean;internalNote:string|null;documentUpdateRequired:boolean;createdAt:string;updatedAt:string};
export type ClientExtraInput={id?:string;clientId:string;catalogKey?:string|null;titleEl?:string;titleEn?:string;descriptionEl?:string|null;descriptionEn?:string|null;coverageScope?:string|null;quantity:number;unitPrice?:number;vatRate:number;priceIncludesVat:boolean;status:ExtraStatus;showInPortal:boolean;internalNote?:string|null};
export type ExtraTotals={net:number;vat:number;gross:number;agreedCount:number;documentUpdateRequired:boolean;items:ClientExtra[]};

type CatalogRow=RowDataPacket&{catalog_key:string;title_el:string;title_en:string;description_el:string|null;description_en:string|null;default_unit_price:string|number;requires_scope:number};
type ExtraRow=RowDataPacket&{id:string;client_id:string;catalog_key:string|null;title_el:string;title_en:string;description_el:string|null;description_en:string|null;coverage_scope:string|null;quantity:string|number;unit_price:string|number;vat_rate:string|number;price_includes_vat:number;status:ExtraStatus;show_in_portal:number;internal_note:string|null;document_update_required:number;created_at:Date;updated_at:Date};
const num=(value:unknown)=>{const parsed=Number(value);return Number.isFinite(parsed)?parsed:0};
const mapCatalog=(row:CatalogRow):ExtraCatalogItem=>({key:row.catalog_key,titleEl:row.title_el,titleEn:row.title_en,descriptionEl:row.description_el,descriptionEn:row.description_en,defaultUnitPrice:num(row.default_unit_price),requiresScope:Boolean(row.requires_scope)});
const mapExtra=(row:ExtraRow):ClientExtra=>({id:row.id,clientId:row.client_id,catalogKey:row.catalog_key,titleEl:row.title_el,titleEn:row.title_en,descriptionEl:row.description_el,descriptionEn:row.description_en,coverageScope:row.coverage_scope,quantity:num(row.quantity),unitPrice:num(row.unit_price),vatRate:num(row.vat_rate),priceIncludesVat:Boolean(row.price_includes_vat),status:row.status,showInPortal:Boolean(row.show_in_portal),internalNote:row.internal_note,documentUpdateRequired:Boolean(row.document_update_required),createdAt:new Date(row.created_at).toISOString(),updatedAt:new Date(row.updated_at).toISOString()});

export async function listExtraCatalog(){const[rows]=await getDatabase().query<CatalogRow[]>("SELECT * FROM extra_service_catalog WHERE is_active=1 ORDER BY default_unit_price DESC,title_el");return rows.map(mapCatalog)}
export async function listClientExtras(clientId:string,portalOnly=false){const[rows]=await getDatabase().query<ExtraRow[]>(`SELECT * FROM client_extra_services WHERE client_id=?${portalOnly?" AND show_in_portal=1 AND status='agreed'":""} ORDER BY status='agreed' DESC,status='proposed' DESC,created_at`,[clientId]);return rows.map(mapExtra)}

export function calculateExtraTotals(items:ClientExtra[]):ExtraTotals{
  const totals=calculateExtraFinancials(items);
  return{...totals,documentUpdateRequired:items.some(item=>item.status==="agreed"&&item.documentUpdateRequired),items};
}
export async function getClientExtraTotals(clientId:string,portalOnly=false){const totals=calculateExtraTotals(await listClientExtras(clientId,portalOnly));if(totals.agreedCount&&!totals.documentUpdateRequired){const[rows]=await getDatabase().query<(RowDataPacket&{locked:number})[]>("SELECT EXISTS(SELECT 1 FROM clients c JOIN lead_document_records d ON d.lead_id=c.lead_id WHERE c.id=? AND ((d.document_type='contract' AND d.status IN ('signed','approved')) OR (d.document_type='invoice' AND d.status IN ('issued','part-paid','paid')))) locked",[clientId]);totals.documentUpdateRequired=Boolean(rows[0]?.locked)}return totals}

async function documentsLocked(connection:PoolConnection,clientId:string){const[rows]=await connection.query<(RowDataPacket&{locked:number})[]>("SELECT EXISTS(SELECT 1 FROM clients c JOIN lead_document_records d ON d.lead_id=c.lead_id WHERE c.id=? AND ((d.document_type='contract' AND d.status IN ('signed','approved')) OR (d.document_type='invoice' AND d.status IN ('issued','part-paid','paid')))) locked",[clientId]);return Boolean(rows[0]?.locked)}
export async function saveClientExtra(input:ClientExtraInput,actor:string){
  const connection=await getDatabase().getConnection();
  try{await connection.beginTransaction();
    const[catalogRows]=input.catalogKey?await connection.query<CatalogRow[]>("SELECT * FROM extra_service_catalog WHERE catalog_key=? AND is_active=1 LIMIT 1",[input.catalogKey]):[[]];const catalog=catalogRows[0];
    const titleEl=(input.titleEl?.trim()||catalog?.title_el||"").slice(0,255),titleEn=(input.titleEn?.trim()||catalog?.title_en||"").slice(0,255);
    if(!titleEl||!titleEn)throw new Error("Greek and English titles are required.");
    const scope=input.coverageScope?.trim().slice(0,500)||null;if(catalog?.requires_scope&&!scope)throw new Error("Coverage scope is required for an additional hour.");
    const quantity=roundMoney(input.quantity),unitPrice=roundMoney(input.unitPrice??num(catalog?.default_unit_price));if(quantity<=0||unitPrice<0)throw new Error("Quantity and unit price are invalid.");
    const updateRequired=await documentsLocked(connection,input.clientId);
    const values=[input.catalogKey||null,titleEl,titleEn,input.descriptionEl?.trim()||catalog?.description_el||null,input.descriptionEn?.trim()||catalog?.description_en||null,scope,quantity,unitPrice,roundMoney(input.vatRate),input.priceIncludesVat?1:0,input.status,input.showInPortal?1:0,input.internalNote?.trim()||null,updateRequired?1:0,input.status==="cancelled"?new Date():null,actor];
    let id=input.id;
    if(id){const[existing]=await connection.query<ExtraRow[]>("SELECT * FROM client_extra_services WHERE id=? AND client_id=? FOR UPDATE",[id,input.clientId]);if(!existing[0])throw new Error("Extra service not found.");await connection.execute("UPDATE client_extra_services SET catalog_key=?,title_el=?,title_en=?,description_el=?,description_en=?,coverage_scope=?,quantity=?,unit_price=?,vat_rate=?,price_includes_vat=?,status=?,show_in_portal=?,internal_note=?,document_update_required=?,cancelled_at=?,updated_by=? WHERE id=?",[...values,id])}
    else{id=randomUUID();await connection.execute("INSERT INTO client_extra_services (id,client_id,catalog_key,title_el,title_en,description_el,description_en,coverage_scope,quantity,unit_price,vat_rate,price_includes_vat,status,show_in_portal,internal_note,document_update_required,cancelled_at,created_by,updated_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",[id,input.clientId,...values,actor])}
    await connection.execute("INSERT INTO activity_log (client_id,event_type,summary,metadata) VALUES (?,'client-extra-updated',?,?)",[input.clientId,`${input.status==="cancelled"?"Cancelled":"Saved"} extra service: ${titleEl}`,JSON.stringify({extraId:id,status:input.status,quantity,unitPrice,vatRate:input.vatRate,showInPortal:input.showInPortal,actor,documentUpdateRequired:updateRequired})]);await connection.commit();return id;
  }catch(error){await connection.rollback();throw error}finally{connection.release()}
}
