import "server-only";
import type {RowDataPacket} from "mysql2/promise";
import {z} from "zod";
import {getDatabase} from "@/lib/database";

const days = z.number().int().min(1).max(365);
export const followupSettingsSchema = z.object({days002:days,days003:days}).refine(value=>value.days003>value.days002,"003 must follow 002.");
const key = "offer-followup-days";

export async function getFollowupSettings() {
  const [rows] = await getDatabase().query<(RowDataPacket&{value_json:unknown})[]>("SELECT value_json FROM site_settings WHERE setting_key=?",[key]);
  if (!rows[0]) return {days002:2,days003:6};
  const raw=rows[0].value_json;
  return followupSettingsSchema.parse(typeof raw==="string"?JSON.parse(raw):raw);
}

export async function saveFollowupSettings(input:unknown) {
  const settings=followupSettingsSchema.parse(input);
  await getDatabase().execute("INSERT INTO site_settings (setting_key,value_json) VALUES (?,?) ON DUPLICATE KEY UPDATE value_json=VALUES(value_json),updated_at=CURRENT_TIMESTAMP",[key,JSON.stringify(settings)]);
}
