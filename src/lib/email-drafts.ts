import "server-only";
import type {RowDataPacket} from "mysql2/promise";
import {z} from "zod";
import {getDatabase} from "@/lib/database";
import {emailCompositionSchema} from "./email-composition";

export const emailDraftSchema=z.object({subject:z.string().max(500),content:emailCompositionSchema,image:z.string().max(700)}).strict();
export type EmailDraft=z.infer<typeof emailDraftSchema>;
const snapshotSchema=z.object({revision:z.number().int().nonnegative(),draft:emailDraftSchema.nullable()});
const decode=(raw:unknown)=>snapshotSchema.parse(typeof raw==="string"?JSON.parse(raw):raw);
export async function readEmailDraft(key:string){
  const[rows]=await getDatabase().query<(RowDataPacket&{value_json:unknown})[]>("SELECT value_json FROM site_settings WHERE setting_key=?",[key]);
  return rows[0]?decode(rows[0].value_json):{revision:0,draft:null};
}
export async function writeEmailDraft(key:string,draft:EmailDraft|null,expectedRevision:number){
  const parsed=draft===null?null:emailDraftSchema.parse(draft);
  if(JSON.stringify(parsed).length>50000)throw new Error("Email draft exceeds 50,000 characters.");
  const connection=await getDatabase().getConnection();
  try{
    await connection.beginTransaction();
    await connection.execute("INSERT IGNORE INTO site_settings (setting_key,value_json) VALUES (?,?)",[key,JSON.stringify({revision:0,draft:null})]);
    const[rows]=await connection.query<(RowDataPacket&{value_json:unknown})[]>("SELECT value_json FROM site_settings WHERE setting_key=? FOR UPDATE",[key]);
    const current=decode(rows[0].value_json);
    if(current.revision!==expectedRevision)throw new Error("DRAFT_CONFLICT: Another device changed this draft. Your text is retained locally. Reload before saving again.");
    const next={revision:current.revision+1,draft:parsed};
    await connection.execute("UPDATE site_settings SET value_json=?,updated_at=CURRENT_TIMESTAMP WHERE setting_key=?",[JSON.stringify(next),key]);
    await connection.commit();return next;
  }catch(error){await connection.rollback();throw error}finally{connection.release()}
}
