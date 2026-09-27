import mysql from "mysql2/promise";

const required=name=>{const value=process.env[name];if(value===undefined||value==="")throw new Error(`${name} is not configured.`);return value};
const host=required("DB_HOST").toLowerCase();
if(!new Set(["localhost","127.0.0.1","::1"]).has(host))throw new Error(`Refusing to seed a non-local database host: ${host}`);
const siteUrl=required("NEXT_PUBLIC_SITE_URL");
if(!/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/i.test(siteUrl))throw new Error(`Refusing to seed because NEXT_PUBLIC_SITE_URL is not localhost: ${siteUrl}`);
if(!process.argv.includes("--confirm-local-calendar-demo"))throw new Error("Explicit local calendar demo confirmation is required.");

const year=new Date().getFullYear();
const records=[
  {lead:"61000000-0000-4000-8000-000000000001",client:"62000000-0000-4000-8000-000000000001",onboarding:"63000000-0000-4000-8000-000000000001",name:"[DEMO CALENDAR] Green Wedding",type:"wedding",date:`${year}-03-14`,leadStatus:"converted",booking:"confirmed"},
  {lead:"61000000-0000-4000-8000-000000000002",client:"62000000-0000-4000-8000-000000000002",onboarding:"63000000-0000-4000-8000-000000000002",name:"[DEMO CALENDAR] Blue Baptism",type:"baptism",date:`${year}-10-12`,leadStatus:"converted",booking:"pending"},
  {lead:"61000000-0000-4000-8000-000000000003",name:"[DEMO CALENDAR] Yellow Wedding Lead",type:"wedding",date:`${year}-09-05`,leadStatus:"offer-sent"},
  {lead:"61000000-0000-4000-8000-000000000004",name:"[DEMO CALENDAR] Yellow Baptism Lead",type:"baptism",date:`${year}-09-05`,leadStatus:"follow-up"},
  {lead:"61000000-0000-4000-8000-000000000005",client:"62000000-0000-4000-8000-000000000005",onboarding:"63000000-0000-4000-8000-000000000005",name:"[DEMO CALENDAR] Reserved With Contender",type:"wedding",date:`${year}-11-21`,leadStatus:"converted",booking:"confirmed"},
  {lead:"61000000-0000-4000-8000-000000000006",name:"[DEMO CALENDAR] Competing Baptism Lead",type:"baptism",date:`${year}-11-21`,leadStatus:"qualified"},
];
const connection=await mysql.createConnection({host,port:Number(process.env.DB_PORT??3306),database:required("DB_NAME"),user:required("DB_USER"),password:process.env.DB_PASSWORD??"",charset:"utf8mb4"});
const leadIds=records.map(item=>item.lead),clientIds=records.flatMap(item=>item.client?[item.client]:[]);
const placeholders=values=>values.map(()=>"?").join(",");
const remove=async()=>{if(clientIds.length)await connection.execute(`DELETE FROM clients WHERE id IN (${placeholders(clientIds)})`,clientIds);await connection.execute(`DELETE FROM leads WHERE id IN (${placeholders(leadIds)})`,leadIds)};
try{await connection.beginTransaction();await remove();if(process.argv.includes("--remove")){await connection.commit();console.log("Removed the localhost calendar demo records.")}else{for(const item of records){await connection.execute("INSERT INTO leads (id,event_type,workflow_locale,status,couple_names,email,event_date,ceremony_location,reception_location,source,notes) VALUES (?,?,?, ?,?,?,?,'Demo ceremony venue','Demo reception venue','Local calendar demo','Localhost-only calendar colour and tooltip example')",[item.lead,item.type,"en",item.leadStatus,item.name,`${item.lead.slice(-4)}@example.invalid`,item.date]);if(item.client&&item.onboarding){await connection.execute("INSERT INTO clients (id,lead_id,event_type,couple_names,email,event_date,ceremony_location,reception_location) VALUES (?,?,?,?,?,?,?,?)",[item.client,item.lead,item.type,item.name,`${item.lead.slice(-4)}@example.invalid`,item.date,"Demo ceremony venue","Demo reception venue"]);await connection.execute("INSERT INTO onboarding (id,client_id,booking_status) VALUES (?,?,?)",[item.onboarding,item.client,item.booking])}}await connection.commit();console.log(`Created localhost calendar demo records for ${year}.`);console.log("Green: 14 March and 21 November | Blue: 12 October | Yellow contenders: 05 September | Green with yellow contender badge: 21 November");console.log(`${siteUrl.replace(/\/$/,"")}/admin/calendar`)}}catch(error){await connection.rollback();throw error}finally{await connection.end()}
