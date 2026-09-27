import "server-only";
import { randomBytes } from "node:crypto";
import type { RowDataPacket } from "mysql2/promise";
import { getDatabase } from "@/lib/database";
type Row=RowDataPacket&{id:number;slug:string;client_id:string|null;language:"en"|"gr";client_name:string|null;status:"draft"|"published"|"revoked";payload:string|Record<string,unknown>;published_at:Date|null;created_at:Date;updated_at:Date};
const map=(row:Row)=>({id:Number(row.id),slug:row.slug,clientId:row.client_id,language:row.language,clientName:row.client_name,status:row.status,payload:typeof row.payload==="string"?JSON.parse(row.payload):row.payload,publishedAt:row.published_at?new Date(row.published_at).toISOString():null,createdAt:new Date(row.created_at).toISOString(),updatedAt:new Date(row.updated_at).toISOString()});
export async function listTimelines(){const[rows]=await getDatabase().query<Row[]>("SELECT * FROM timelines ORDER BY updated_at DESC");return rows.map(map)}
export async function getAdminTimeline(slug:string){const[rows]=await getDatabase().query<Row[]>("SELECT * FROM timelines WHERE slug=? LIMIT 1",[slug]);return rows[0]?map(rows[0]):null}
export async function revokeTimeline(slug:string){await getDatabase().execute("UPDATE timelines SET status='revoked' WHERE slug=?",[slug])}
export async function republishTimeline(slug:string){await getDatabase().execute("UPDATE timelines SET status='published',published_at=CURRENT_TIMESTAMP WHERE slug=?",[slug])}
export async function regenerateTimeline(slug:string){const current=await getAdminTimeline(slug);if(!current)throw new Error("Timeline not found");const base=slug.replace(/-[a-f0-9]{12}$/i,"").slice(0,165);const next=`${base}-${randomBytes(6).toString("hex")}`;await getDatabase().execute("INSERT INTO timelines (slug,client_id,language,client_name,status,payload,published_at) VALUES (?,?,?,?, 'published', ?,CURRENT_TIMESTAMP)",[next,current.clientId,current.language,current.clientName,JSON.stringify(current.payload)]);await revokeTimeline(slug);return next}
