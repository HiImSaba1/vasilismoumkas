import fs from "node:fs/promises";
import mysql from "mysql2/promise";
import mysqlSql from "mysql2";

const required = (name, allowEmpty = false) => {
  const value = process.env[name];
  if (value === undefined || (!allowEmpty && !value)) throw new Error(`${name} is not configured.`);
  return value;
};

const tables = [
  "email_templates",
  "email_template_variants",
  "portfolio_projects",
  "portfolio_images",
  "portfolio_project_deletions",
];

const database = await mysql.createConnection({
  host: required("DB_HOST"),
  port: Number(process.env.DB_PORT ?? 3306),
  database: required("DB_NAME"),
  user: required("DB_USER"),
  password: required("DB_PASSWORD", true),
  charset: "utf8mb4",
  dateStrings: true,
});

const statements = [
  "-- Moumkas production configuration seed",
  "-- Contains no leads, clients, offers, deliveries, activity, login attempts, or credentials.",
  "SET NAMES utf8mb4;",
  "SET FOREIGN_KEY_CHECKS=0;",
];

const sqlValue = (value) => mysqlSql.escape(
  value !== null && typeof value === "object" ? JSON.stringify(value) : value,
);

try {
  for (const table of tables) {
    const [rows] = await database.query(`SELECT * FROM \`${table}\``);
    if (!rows.length) continue;
    const columns = Object.keys(rows[0]);
    const identifiers = columns.map((column) => `\`${column.replaceAll("`", "``")}\``).join(",");
    const values = rows.map((row) => `(${columns.map((column) => sqlValue(row[column])).join(",")})`).join(",\n");
    statements.push(`INSERT INTO \`${table}\` (${identifiers}) VALUES\n${values}\nON DUPLICATE KEY UPDATE ${columns.map((column) => `\`${column}\`=VALUES(\`${column}\`)`).join(",")};`);
  }
  statements.push("SET FOREIGN_KEY_CHECKS=1;", "");
  await fs.writeFile("database/production-seed.sql", statements.join("\n\n"), "utf8");
  console.log("Created database/production-seed.sql with configuration data only.");
} finally {
  await database.end();
}
