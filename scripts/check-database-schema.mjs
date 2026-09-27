import mysql from "mysql2/promise";

const expected = [
  "admin_login_attempts",
  "leads",
  "client_workflow_steps",
  "offers",
  "lead_booking_documents",
  "lead_document_records",
  "offer_events",
  "clients",
  "onboarding",
  "client_portals",
  "questionnaires",
  "timelines",
  "documents",
  "email_templates",
  "email_template_variants",
  "automation_jobs",
  "email_deliveries",
  "activity_log",
  "portfolio_projects",
  "portfolio_images",
  "portfolio_project_deletions",
  "app_migrations",
];
const required = (name, allowEmpty = false) => { const value = process.env[name]; if (value === undefined || (!allowEmpty && !value)) throw new Error(`${name} is not configured.`); return value; };
const db = await mysql.createConnection({ host: required("DB_HOST"), port: Number(process.env.DB_PORT ?? 3306), database: required("DB_NAME"), user: required("DB_USER"), password: required("DB_PASSWORD", true), charset: "utf8mb4" });
try {
  const [rows] = await db.query("SELECT TABLE_NAME AS name FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?", [process.env.DB_NAME]);
  const present = new Set(rows.map((row) => row.name));
  const missing = expected.filter((table) => !present.has(table));
  if (missing.length) throw new Error(`Missing tables: ${missing.join(", ")}`);
  console.log(`Schema ready: ${expected.length} required tables found.`);
} finally { await db.end(); }
