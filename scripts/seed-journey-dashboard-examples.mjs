import mysql from "mysql2/promise";

const ids={
  newLead:"10000000-0000-4000-8000-000000000001",
  followUp:"10000000-0000-4000-8000-000000000002",
  waiting:"10000000-0000-4000-8000-000000000003",
  accepted:"10000000-0000-4000-8000-000000000004",
  completed:"10000000-0000-4000-8000-000000000005",
  acceptedClient:"20000000-0000-4000-8000-000000000004",
  completedClient:"20000000-0000-4000-8000-000000000005",
  acceptedOnboarding:"30000000-0000-4000-8000-000000000004",
  completedOnboarding:"30000000-0000-4000-8000-000000000005",
  acceptedPortal:"40000000-0000-4000-8000-000000000004",
  completedPortal:"40000000-0000-4000-8000-000000000005",
};
const leadIds=[ids.newLead,ids.followUp,ids.waiting,ids.accepted,ids.completed];
const placeholders=leadIds.map(()=>"?").join(",");
const required=name=>{const value=process.env[name];if(value===undefined||value==="")throw new Error(`${name} is not configured.`);return value};
const connection=await mysql.createConnection({host:required("DB_HOST"),port:Number(process.env.DB_PORT??3306),database:required("DB_NAME"),user:required("DB_USER"),password:process.env.DB_PASSWORD??"",charset:"utf8mb4"});

async function removeExamples(){
  const[clientRows]=await connection.query(`SELECT id FROM clients WHERE lead_id IN (${placeholders})`,leadIds);
  const clientIds=clientRows.map(row=>row.id);
  if(clientIds.length){const marks=clientIds.map(()=>"?").join(",");await connection.query(`DELETE FROM timelines WHERE client_id IN (${marks})`,clientIds);await connection.query(`DELETE FROM clients WHERE id IN (${marks})`,clientIds)}
  await connection.query(`DELETE FROM offers WHERE lead_id IN (${placeholders})`,leadIds);
  await connection.query(`DELETE FROM leads WHERE id IN (${placeholders})`,leadIds);
}

try{
  await connection.beginTransaction();
  await removeExamples();
  if(process.argv.includes("--remove")){await connection.commit();console.log("Removed the five Journey Dashboard demo records.");process.exitCode=0}else{
    const leads=[
      [ids.newLead,"wedding","new","[DEMO] Anna & George","demo.anna-george@example.invalid","2027-05-22","Athens","Athens Riviera","Journey Dashboard example: Step 000 is ready."],
      [ids.followUp,"baptism","offer-sent","[DEMO] Eleni & Dimitris","demo.eleni-dimitris@example.invalid","2027-06-13","Agia Sofia","Thessaloniki","Journey Dashboard example: Step 002 is next."],
      [ids.waiting,"wedding","follow-up","[DEMO] Maria & Nikos","demo.maria-nikos@example.invalid","2027-07-04","Paros","Naousa","Journey Dashboard example: waiting for offer response."],
      [ids.accepted,"wedding","converted","[DEMO] Sofia & Andreas","demo.sofia-andreas@example.invalid","2027-08-28","Santorini","Oia","Journey Dashboard example: accepted offer, Step 004 required."],
      [ids.completed,"baptism","completed","[DEMO] Chloe Family","demo.chloe-family@example.invalid","2026-05-17","Vouliagmeni","Vouliagmeni","Journey Dashboard example: fully completed journey."],
    ];
    for(const lead of leads)await connection.execute("INSERT INTO leads (id,event_type,status,couple_names,email,event_date,ceremony_location,reception_location,source,notes) VALUES (?,?,?,?,?,?,?,?, 'Journey Dashboard Demo',?)",lead);
    for(const[leadId,stepKeys]of [[ids.followUp,["000"]],[ids.waiting,["000","002","003"]],[ids.accepted,["000"]],[ids.completed,["000","004","005","008"]]])for(const stepKey of stepKeys)await connection.execute("INSERT INTO client_workflow_steps (lead_id,step_key,status,note,completed_at) VALUES (?,?,'completed','Demo workflow evidence',CURRENT_TIMESTAMP)",[leadId,stepKey]);

    const offerValues=[
      ["demo-eleni-dimitris-follow-up",ids.followUp,"baptism","gr","[DEMO] Eleni & Dimitris","demo.eleni-dimitris@example.invalid","sent"],
      ["demo-maria-nikos-waiting",ids.waiting,"wedding","gr","[DEMO] Maria & Nikos","demo.maria-nikos@example.invalid","sent"],
      ["demo-sofia-andreas-accepted",ids.accepted,"wedding","en","[DEMO] Sofia & Andreas","demo.sofia-andreas@example.invalid","accepted"],
      ["demo-chloe-family-completed",ids.completed,"baptism","gr","[DEMO] Chloe Family","demo.chloe-family@example.invalid","accepted"],
    ];
    const offerIds=new Map();
    for(const offer of offerValues){const[result]=await connection.execute("INSERT INTO offers (slug,lead_id,event_type,language,client_name,client_email,status,sent_at,accepted_at,payload) VALUES (?,?,?,?,?,?,?,CURRENT_TIMESTAMP,IF(?='accepted',CURRENT_TIMESTAMP,NULL),'{}')",[...offer,offer[6]]);offerIds.set(offer[1],result.insertId)}

    await connection.execute("INSERT INTO clients (id,lead_id,accepted_offer_id,event_type,couple_names,email,event_date,ceremony_location,reception_location) VALUES (?,?,?,?,?,?,?,?,?)",[ids.acceptedClient,ids.accepted,offerIds.get(ids.accepted),"wedding","[DEMO] Sofia & Andreas","demo.sofia-andreas@example.invalid","2027-08-28","Santorini","Oia"]);
    await connection.execute("INSERT INTO onboarding (id,client_id) VALUES (?,?)",[ids.acceptedOnboarding,ids.acceptedClient]);
    await connection.execute("INSERT INTO client_portals (id,client_id,public_slug) VALUES (?,?,?)",[ids.acceptedPortal,ids.acceptedClient,"demo-sofia-andreas-portal"]);

    await connection.execute("INSERT INTO clients (id,lead_id,accepted_offer_id,event_type,couple_names,email,event_date,ceremony_location,reception_location,journey_stage) VALUES (?,?,?,?,?,?,?,?,?,'completed')",[ids.completedClient,ids.completed,offerIds.get(ids.completed),"baptism","[DEMO] Chloe Family","demo.chloe-family@example.invalid","2026-05-17","Vouliagmeni","Vouliagmeni"]);
    await connection.execute("INSERT INTO onboarding (id,client_id,questionnaire_status,agreement_status,invoice_status,booking_status,timeline_status,production_status) VALUES (?,?,'completed','approved','paid','confirmed','approved','gallery-delivered')",[ids.completedOnboarding,ids.completedClient]);
    await connection.execute("INSERT INTO client_portals (id,client_id,public_slug) VALUES (?,?,?)",[ids.completedPortal,ids.completedClient,"demo-chloe-family-portal"]);
    await connection.execute("INSERT INTO timelines (slug,client_id,language,client_name,status,payload,published_at) VALUES (?,?, 'gr',?,'published','{}',CURRENT_TIMESTAMP)",["demo-chloe-family-timeline",ids.completedClient,"[DEMO] Chloe Family"]);
    await connection.commit();
    console.log("Created five Journey Dashboard examples: new action, follow-up, waiting, accepted action, and completed.");
  }
}catch(error){await connection.rollback();throw error}finally{await connection.end()}
