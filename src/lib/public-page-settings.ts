import "server-only";
import { createHash } from "node:crypto";
import type { RowDataPacket } from "mysql2/promise";
import { getDatabase, isDatabaseConfigured } from "@/lib/database";
import { defaultPublicPageContent, publicPageSchemas, type PublicPageContent, type PublicPageKey } from "@/lib/public-page-content";
import {allowLocalMissingSettings} from "@/lib/local-settings-fallback";

export const publicPageSettingKey = (page: PublicPageKey) => `public_page_${page}_v1`;
const key = publicPageSettingKey;
const version = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const parse = (raw: unknown): unknown => typeof raw === "string" ? JSON.parse(raw) : raw;

export async function getPublicPageSettings<K extends PublicPageKey>(page: K): Promise<{ content: PublicPageContent[K]; version: string }> {
  if (!isDatabaseConfigured()) return { content: defaultPublicPageContent[page], version: version(null) };
  let rows:(RowDataPacket & { value_json: unknown })[];
  try{[rows]=await getDatabase().query<typeof rows>("SELECT value_json FROM site_settings WHERE setting_key=? LIMIT 1",[key(page)]);}catch(error){if(allowLocalMissingSettings(error))return{content:defaultPublicPageContent[page],version:version(null)};throw error;}
  const raw = rows[0] ? parse(rows[0].value_json) : null;
  const content = raw === null ? defaultPublicPageContent[page] : publicPageSchemas[page].parse(raw) as PublicPageContent[K];
  return { content, version: version(raw) };
}

export async function savePublicPageSettings(page: PublicPageKey, content: unknown, expectedVersion: string) {
  const parsed = publicPageSchemas[page].parse(content);
  const connection = await getDatabase().getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.query<(RowDataPacket & { value_json: unknown })[]>("SELECT value_json FROM site_settings WHERE setting_key=? FOR UPDATE", [key(page)]);
    const raw = rows[0] ? parse(rows[0].value_json) : null;
    if (version(raw) !== expectedVersion) throw new Error("This page changed since you opened it. Reload before saving.");
    if (rows[0]) {
      await connection.execute("UPDATE site_settings SET value_json=?,updated_at=CURRENT_TIMESTAMP WHERE setting_key=?", [JSON.stringify(parsed), key(page)]);
    } else {
      // Plain INSERT rejects a competing first save instead of overwriting it.
      await connection.execute("INSERT INTO site_settings (setting_key,value_json) VALUES (?,?)", [key(page), JSON.stringify(parsed)]);
    }
    await connection.commit();
  } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
}
