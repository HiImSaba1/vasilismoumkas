import fs from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";

const required = (name, allowEmpty = false) => {
  const value = process.env[name];
  if (value === undefined || (!allowEmpty && !value)) throw new Error(`${name} is not configured.`);
  return value;
};

const connection = await mysql.createConnection({
  host: required("DB_HOST"), port: Number(process.env.DB_PORT ?? 3306), database: required("DB_NAME"),
  user: required("DB_USER"), password: required("DB_PASSWORD", true), charset: "utf8mb4",
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false" } : undefined,
});

async function readJson(name) {
  const file = path.join(process.cwd(), "src", "app", "(site)", "data", `${name}.json`);
  return JSON.parse(await fs.readFile(file, "utf8"));
}

try {
  await connection.beginTransaction();
  const [migration] = await connection.execute("SELECT migration_key FROM app_migrations WHERE migration_key = ?", ["legacy-json-v1"]);
  if (migration.length) {
    console.log("legacy-json-v1 already applied; nothing to do.");
    await connection.rollback();
  } else {
    const offers = await readJson("offers");
    const timelines = await readJson("timelines");
    for (const [slug, payload] of Object.entries(offers)) {
      await connection.execute(
        `INSERT INTO offers (slug,event_type,language,client_name,status,payload) VALUES (?,?,?,?, 'draft', ?)
         ON DUPLICATE KEY UPDATE payload=VALUES(payload),updated_at=CURRENT_TIMESTAMP`,
        [slug, payload.type === "baptism" ? "baptism" : "wedding", payload.lang === "gr" ? "gr" : "en", payload.n ?? null, JSON.stringify(payload)],
      );
    }
    for (const [slug, payload] of Object.entries(timelines)) {
      await connection.execute(
        `INSERT INTO timelines (slug,language,client_name,status,payload,published_at) VALUES (?,?,?,'published',?,CURRENT_TIMESTAMP)
         ON DUPLICATE KEY UPDATE payload=VALUES(payload),status='published',updated_at=CURRENT_TIMESTAMP`,
        [slug, slug.endsWith("-gr") ? "gr" : "en", payload.names_en ?? payload.names_gr ?? null, JSON.stringify(payload)],
      );
    }
    await connection.execute("INSERT INTO app_migrations (migration_key,details) VALUES (?,?)", ["legacy-json-v1", JSON.stringify({ offers: Object.keys(offers).length, timelines: Object.keys(timelines).length })]);
    await connection.commit();
    console.log(`Imported ${Object.keys(offers).length} offers and ${Object.keys(timelines).length} timelines.`);
  }
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  await connection.end();
}
