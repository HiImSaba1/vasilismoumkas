import mysql from "mysql2/promise";

const ids = {
  lead: "50000000-0000-4000-8000-000000000018",
  client: "51000000-0000-4000-8000-000000000018",
  onboarding: "52000000-0000-4000-8000-000000000018",
  portal: "53000000-0000-4000-8000-000000000018",
  questionnaire: "54000000-0000-4000-8000-000000000018",
  contract: "55000000-0000-4000-8000-000000000018",
  invoice: "56000000-0000-4000-8000-000000000018",
  payment: "57000000-0000-4000-8000-000000000018",
};

const required = (name) => {
  const value = process.env[name];
  if (value === undefined || value === "") throw new Error(`${name} is not configured.`);
  return value;
};

const host = required("DB_HOST").toLowerCase();
const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);
if (!localHosts.has(host)) {
  throw new Error(`Refusing to seed a non-local database host: ${host}`);
}
if (!process.argv.includes("--confirm-local-invoice-demo")) {
  throw new Error("Explicit local demo confirmation is required.");
}

const connection = await mysql.createConnection({
  host,
  port: Number(process.env.DB_PORT ?? 3306),
  database: required("DB_NAME"),
  user: required("DB_USER"),
  password: process.env.DB_PASSWORD ?? "",
  charset: "utf8mb4",
});

async function removeDemo() {
  await connection.execute("DELETE FROM clients WHERE id=?", [ids.client]);
  await connection.execute("DELETE FROM offers WHERE slug='demo-alex-maria-invoice'");
  await connection.execute("DELETE FROM leads WHERE id=?", [ids.lead]);
}

try {
  await connection.beginTransaction();
  await removeDemo();

  if (process.argv.includes("--remove")) {
    await connection.commit();
    console.log("Removed the local invoice-payment demo.");
    process.exitCode = 0;
  } else {
    await connection.execute(
      `INSERT INTO leads
        (id,event_type,status,couple_names,email,phone,event_date,ceremony_location,reception_location,source,notes)
       VALUES (?, 'wedding', 'converted', ?, ?, ?, ?, ?, ?, 'Local invoice demo', ?)`,
      [
        ids.lead,
        "[DEMO] Alex & Maria",
        "demo.invoice@example.invalid",
        "+30 690 000 0018",
        "2027-06-19",
        "Athens",
        "Athens Riviera",
        "Local-only example for testing the manual invoice payment ledger.",
      ],
    );

    const offerPayload = {
      n: "[DEMO] Alex & Maria",
      clientEmail: "demo.invoice@example.invalid",
      type: "wedding",
      lang: "en",
      c1: {
        ph: "Essential Wedding Collection",
        p: "1600",
        h: "8",
        phot: "1 Master Photographer",
        img: "Professionally edited high-resolution images",
        bx: "Private online gallery",
        cs: "Wedding Timeline Planning",
      },
      response: {
        action: "accept",
        name: "[DEMO] Alex & Maria",
        email: "demo.invoice@example.invalid",
        packageName: "Essential Wedding Collection",
        submittedAt: "2026-08-26T10:00:00.000Z",
      },
    };
    const [offerResult] = await connection.execute(
      `INSERT INTO offers
        (slug,lead_id,event_type,language,client_name,client_email,status,expires_at,sent_at,accepted_at,payload)
       VALUES ('demo-alex-maria-invoice',?,'wedding','en',?,?,'accepted','2027-07-19',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,?)`,
      [ids.lead, "[DEMO] Alex & Maria", "demo.invoice@example.invalid", JSON.stringify(offerPayload)],
    );

    await connection.execute(
      `INSERT INTO clients
        (id,lead_id,accepted_offer_id,event_type,couple_names,email,phone,event_date,ceremony_location,reception_location)
       VALUES (?,?,?,'wedding',?,?,?,?,?,?)`,
      [
        ids.client,
        ids.lead,
        offerResult.insertId,
        "[DEMO] Alex & Maria",
        "demo.invoice@example.invalid",
        "+30 690 000 0018",
        "2027-06-19",
        "Athens",
        "Athens Riviera",
      ],
    );

    await connection.execute(
      `INSERT INTO onboarding
        (id,client_id,questionnaire_status,agreement_status,invoice_status,booking_status)
       VALUES (?,?,'completed','approved','part-paid','confirmed')`,
      [ids.onboarding, ids.client],
    );
    await connection.execute(
      "INSERT INTO client_portals (id,client_id,public_slug) VALUES (?,?,?)",
      [ids.portal, ids.client, "demo-alex-maria-portal"],
    );

    await connection.execute(
      `INSERT INTO lead_document_records
        (id,lead_id,document_type,template_key,status,document_data)
       VALUES (?,?, 'questionnaire','wedding-planning','completed',?)`,
      [ids.questionnaire, ids.lead, JSON.stringify({ demo: "Completed questionnaire example" })],
    );
    await connection.execute(
      `INSERT INTO lead_document_records
        (id,lead_id,document_type,template_key,status,document_data)
       VALUES (?,?, 'contract','english-wedding-agreement','signed',?)`,
      [ids.contract, ids.lead, JSON.stringify({ language: "en", signed_name: "Alex & Maria", signed_at: "2026-08-26T10:00:00.000Z" })],
    );
    await connection.execute(
      `INSERT INTO lead_document_records
        (id,lead_id,document_type,template_key,status,document_data)
       VALUES (?,?, 'invoice','wedding-invoice','part-paid',?)`,
      [
        ids.invoice,
        ids.lead,
        JSON.stringify({
          client_name: "[DEMO] Alex & Maria",
          client_email: "demo.invoice@example.invalid",
          client_phone: "+30 690 000 0018",
          collection_name: "Essential Wedding Collection",
          collection_hours: "8",
          collection_photographers: "1 Master Photographer",
          collection_images: "Professionally edited high-resolution images",
          collection_album_prints: "Private online gallery",
          collection_extras: "Wedding Timeline Planning",
          subtotal: "1600",
          total: "1600",
          prepaid_amount: "350",
          balance_due: "1250",
        }),
      ],
    );
    await connection.execute(
      `INSERT INTO invoice_payments
        (id,client_id,invoice_document_id,amount,paid_at,payment_method,reference,note)
       VALUES (?,?,?,350,'2026-08-26','Bank transfer','DEMO-350','Demo deposit received')`,
      [ids.payment, ids.client, ids.invoice],
    );

    await connection.commit();
    console.log("Created local invoice demo: [DEMO] Alex & Maria");
    console.log(`Admin client: http://localhost:3000/admin/clients/${ids.client}`);
    console.log("Client portal: http://localhost:3000/portal/demo-alex-maria-portal?tab=invoice");
    console.log("Invoice total: EUR 1600.00 | Paid: EUR 350.00 | Balance: EUR 1250.00");
  }
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  await connection.end();
}
