import crypto from "node:crypto";
import mysql from "mysql2/promise";
const db=await mysql.createConnection({host:process.env.DB_HOST,port:Number(process.env.DB_PORT??3306),user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:process.env.DB_NAME});
const marker="codex-e2e-test";
if(process.argv[2]==="cleanup"){await db.execute("DELETE FROM leads WHERE source=?",[marker]);console.log("Temporary CRM journey records removed.");await db.end();process.exit(0)}
const lead=crypto.randomUUID();const slug=`codex-journey-test-${Date.now()}`;
await db.execute("INSERT INTO leads (id,event_type,status,couple_names,email,event_date,ceremony_location,reception_location,source,notes) VALUES (?,'wedding','offer-sent','Codex Test Couple','codex-test@example.com','2027-06-20','Test Church','Test Venue',?,'Temporary end-to-end test; safe to delete')",[lead,marker]);
await db.execute("INSERT INTO offers (slug,lead_id,event_type,language,client_name,client_email,status,expires_at,sent_at,payload) VALUES (?,?,'wedding','en','Codex Test Couple','codex-test@example.com','sent',DATE_ADD(NOW(),INTERVAL 30 DAY),NOW(),?)",[slug,lead,JSON.stringify({type:"wedding",n:"Codex Test Couple",packages:["Test Collection"]})]);
console.log(JSON.stringify({lead,slug}));await db.end();
