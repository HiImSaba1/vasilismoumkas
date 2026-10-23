import "server-only";
import type { PoolConnection, RowDataPacket } from "mysql2/promise";
import {getDatabase,isDatabaseConfigured} from "@/lib/database";
export const PROJECT_REDIRECTS_KEY = "public_project_redirects_v1";
export async function getProjectRedirects(): Promise<{from:string;to:string}[]> {
  if (!isDatabaseConfigured()) return [];
  const [rows] = await getDatabase().query<(RowDataPacket & {value_json:unknown})[]>("SELECT value_json FROM site_settings WHERE setting_key=?", [PROJECT_REDIRECTS_KEY]);
  return rows[0] ? (typeof rows[0].value_json === "string" ? JSON.parse(rows[0].value_json) : rows[0].value_json) as {from:string;to:string}[] : [];
}
export async function recordProjectRename(connection: PoolConnection, previousSlug: string, nextSlug: string) {
  const from = `/portfolio/project/${previousSlug}`, to = `/portfolio/project/${nextSlug}`;
  const [rows] = await connection.query<(RowDataPacket & { value_json: unknown })[]>("SELECT value_json FROM site_settings WHERE setting_key=? FOR UPDATE", [PROJECT_REDIRECTS_KEY]);
  const rules: { from: string; to: string }[] = rows[0] ? typeof rows[0].value_json === "string" ? JSON.parse(rows[0].value_json) : rows[0].value_json as { from: string; to: string }[] : [];
  if (rules.some(rule => rule.from === to)) throw new Error("This slug belongs to a historical project URL. Choose a new slug to keep existing redirects stable.");
  const next = [...rules.filter(rule => rule.from !== from).map(rule => rule.to === from ? { ...rule, to } : rule), { from, to }];
  if (rows[0]) await connection.execute("UPDATE site_settings SET value_json=?,updated_at=CURRENT_TIMESTAMP WHERE setting_key=?", [JSON.stringify(next), PROJECT_REDIRECTS_KEY]);
  else await connection.execute("INSERT INTO site_settings (setting_key,value_json) VALUES (?,?)", [PROJECT_REDIRECTS_KEY, JSON.stringify(next)]);
  const [seoRows]=await connection.query<(RowDataPacket&{value_json:unknown})[]>("SELECT value_json FROM site_settings WHERE setting_key=? FOR UPDATE",["public_seo_overrides_v1"]);
  if(seoRows[0]) {
    const seo=typeof seoRows[0].value_json==="string"?JSON.parse(seoRows[0].value_json):seoRows[0].value_json as Record<string,unknown>;
    if(seo[from]) {
      const updated={...seo,[to]:seo[from]};delete updated[from];
      await connection.execute("UPDATE site_settings SET value_json=?,updated_at=CURRENT_TIMESTAMP WHERE setting_key=?",[JSON.stringify(updated),"public_seo_overrides_v1"]);
    }
  }
}
