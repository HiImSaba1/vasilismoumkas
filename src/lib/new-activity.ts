import "server-only";
import type {RowDataPacket} from "mysql2/promise";
import {getDatabase} from "@/lib/database";
export type NewActivity={id:string;title:string;name:string;createdAt:string;href:string};
export async function listNewActivity():Promise<NewActivity[]>{
  const [rows]=await getDatabase().query<(RowDataPacket&{id:string;kind:string;name:string;created_at:Date|string;source:string|null})[]>(
    "SELECT CONCAT('lead:',id) id,'lead' kind,couple_names name,created_at,source FROM leads WHERE created_at>=DATE_SUB(CURRENT_TIMESTAMP,INTERVAL 7 DAY) UNION ALL SELECT CONCAT('client:',id) id,'client' kind,couple_names name,created_at,NULL source FROM clients WHERE created_at>=DATE_SUB(CURRENT_TIMESTAMP,INTERVAL 7 DAY) ORDER BY created_at DESC LIMIT 100"
  );
  return rows.map(row=>({id:row.id,title:row.kind==="client"?"Νέος πελάτης":row.source==="Website Inquiry"?"Νέο αίτημα Contact":"Νέο lead",name:row.name,createdAt:new Date(row.created_at).toISOString(),href:`/admin/${row.kind==="client"?"clients":"leads"}/${row.id.slice(row.id.indexOf(":")+1)}`}));
}
