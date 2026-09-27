import { randomUUID } from "node:crypto";
import mysql from "mysql2/promise";

const pool=mysql.createPool({host:process.env.DB_HOST,port:Number(process.env.DB_PORT||3306),database:process.env.DB_NAME,user:process.env.DB_USER,password:process.env.DB_PASSWORD,ssl:process.env.DB_SSL==="true"?{rejectUnauthorized:process.env.DB_SSL_REJECT_UNAUTHORIZED!=="false"}:undefined,connectionLimit:1});
const connection=await pool.getConnection();
const profiles=[["wedding","el"],["wedding","en"],["baptism","el"],["baptism","en"]];

try{
  const[[column]]=await connection.query("SELECT COUNT(*) AS count FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='document_templates' AND COLUMN_NAME='is_default'");
  const[[trigger]]=await connection.query("SELECT COUNT(*) AS count,MAX(ACTION_STATEMENT) AS statement FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA=DATABASE() AND TRIGGER_NAME='trg_lead_document_workflow_profile'");
  if(Number(column.count)!==1||Number(trigger.count)!==1)throw new Error("FAIL - Migration 021 is not fully installed in the active local database. Import database/migrations/021_workflow_document_provisioning.sql through phpMyAdmin, then rerun Sprint18Verify.");
  const triggerDefinition=String(trigger.statement||"").toLowerCase().replaceAll("`","").replace(/\s+/g," ");
  if(!/binary\s*\(?\s*event_type/.test(triggerDefinition))throw new Error("FAIL - The installed Sprint 18 trigger has the old collation-sensitive comparisons. Import database/migrations/022_workflow_document_trigger_collation.sql through phpMyAdmin, then rerun Sprint18Verify.");
  console.log("PASS - migrations 021 and 022 column and collation-safe workflow trigger are installed");

  await connection.beginTransaction();
  for(const[eventType,locale]of profiles){
    const leadId=randomUUID();
    await connection.execute("INSERT INTO leads (id,event_type,workflow_locale,couple_names) VALUES (?,?,?,'[VERIFY] Sprint 18')",[leadId,eventType,locale]);
    for(const type of["questionnaire","contract","invoice"]){
      await connection.execute("INSERT INTO lead_document_records (id,lead_id,document_type,template_key,status,document_data) VALUES (?,?,?,?,\"draft\",?)",[randomUUID(),leadId,type,"legacy-wedding-key",JSON.stringify(type==="contract"?{contract_text:"LEGACY WEDDING CONTRACT"}:{verification:"preserved"})]);
    }
    const[rows]=await connection.query("SELECT document_type,template_key,document_data FROM lead_document_records WHERE lead_id=? ORDER BY document_type",[leadId]);
    for(const row of rows){
      const expected=`${eventType}-${locale}-${row.document_type}`;
      if(row.template_key!==expected)throw new Error(`FAIL - ${eventType} ${locale} ${row.document_type} used ${row.template_key}, expected ${expected}`);
      const data=typeof row.document_data==="string"?JSON.parse(row.document_data):row.document_data;
      if(eventType==="baptism"&&row.document_type==="contract"&&data.contract_text==="LEGACY WEDDING CONTRACT")throw new Error("FAIL - baptism contract retained legacy wedding content");
      console.log(`PASS - ${expected} provisioned automatically`);
    }
  }
  await connection.rollback();
  console.log("PASS - 12 workflow documents verified and transaction rolled back.");
}catch(error){
  try{await connection.rollback()}catch{}
  throw error;
}finally{
  connection.release();
  await pool.end();
}
