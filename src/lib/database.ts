import "server-only";

import mysql, { type Pool, type RowDataPacket } from "mysql2/promise";

const globalDatabase = globalThis as typeof globalThis & { moumkasDatabasePool?: Pool };

function required(name: string, allowEmpty = false) {
  const value = process.env[name];
  if (value === undefined || (!allowEmpty && !value)) throw new Error(`${name} is not configured.`);
  return value;
}

export function isDatabaseConfigured() {
  return Boolean(process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER && process.env.DB_PASSWORD !== undefined);
}

export function getDatabase() {
  if (!globalDatabase.moumkasDatabasePool) {
    globalDatabase.moumkasDatabasePool = mysql.createPool({
      host: required("DB_HOST"),
      port: Number(process.env.DB_PORT ?? 3306),
      database: required("DB_NAME"),
      user: required("DB_USER"),
      password: required("DB_PASSWORD", true),
      charset: "utf8mb4",
      waitForConnections: true,
      connectionLimit: Number(process.env.DB_CONNECTION_LIMIT ?? 6),
      queueLimit: 0,
      connectTimeout: 10_000,
      enableKeepAlive: true,
      ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false" } : undefined,
    });
  }
  return globalDatabase.moumkasDatabasePool;
}

export async function databaseStatus() {
  try {
    const [rows] = await getDatabase().query<RowDataPacket[]>("SELECT DATABASE() AS database_name, VERSION() AS version");
    const [counts] = await getDatabase().query<RowDataPacket[]>(
      "SELECT (SELECT COUNT(*) FROM offers) AS offers, (SELECT COUNT(*) FROM timelines) AS timelines, (SELECT COUNT(*) FROM leads) AS leads",
    );
    return { ok: true, database: String(rows[0]?.database_name ?? ""), version: String(rows[0]?.version ?? ""), counts: counts[0] };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Database connection failed" };
  }
}
