import mysql from "mysql2/promise";

if (!process.argv.includes("--confirm-clean-crm")) {
  throw new Error("Cleanup was not confirmed. Pass --confirm-clean-crm to remove CRM journey records.");
}

const required = (name, allowEmpty = false) => {
  const value = process.env[name];
  if (value === undefined || (!allowEmpty && !value)) throw new Error(`${name} is not configured.`);
  return value;
};

const connection = await mysql.createConnection({
  host: required("DB_HOST"),
  port: Number(process.env.DB_PORT ?? 3306),
  database: required("DB_NAME"),
  user: required("DB_USER"),
  password: required("DB_PASSWORD", true),
  charset: "utf8mb4",
});

const tables = [
  "email_deliveries",
  "automation_jobs",
  "activity_log",
  "timelines",
  "clients",
  "offers",
  "leads",
  "admin_login_attempts",
];

try {
  await connection.beginTransaction();
  for (const table of tables) await connection.query(`DELETE FROM \`${table}\``);
  await connection.commit();

  console.log("CRM journey data removed.");
  console.log("Preserved: email templates, bilingual variants, portfolio projects/images, and migration markers.");
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  await connection.end();
}
