import "server-only";
import { z } from "zod";
import type { RowDataPacket } from "mysql2/promise";
import { getDatabase } from "@/lib/database";

export const deliverables = ["preview", "gallery", "film", "album"] as const;
export const productionSchema = z.object({
  folder: z.union([z.literal(""), z.url({protocol: /^https$/})]).refine(value => {
    if (!value) return true;
    const url = new URL(value);
    return !url.username && !url.password;
  }),
  gallery: z.union([z.literal(""), z.url({protocol: /^https$/})]).default(""),
  expiry: z.union([z.literal(""), z.iso.date()]),
  items: z.array(z.object({
    owner: z.string().max(150),
    due: z.union([z.literal(""), z.iso.date()]),
    complete: z.boolean(),
  })).length(deliverables.length),
});
const prefix = "client-production:";
export async function getClientProduction(id: string) {
  const [rows] = await getDatabase().query<(RowDataPacket & {value_json: unknown})[]>(
    "SELECT value_json FROM site_settings WHERE setting_key=?", [prefix + id],
  );
  const raw = rows[0]?.value_json;
  return productionSchema.safeParse(typeof raw === "string" ? JSON.parse(raw) : raw).data;
}

export async function saveClientProduction(id: string, value: z.infer<typeof productionSchema>) {
  await getDatabase().execute(
    "INSERT INTO site_settings (setting_key,value_json) VALUES (?,?) ON DUPLICATE KEY UPDATE value_json=VALUES(value_json),updated_at=CURRENT_TIMESTAMP",
    [prefix + id, JSON.stringify(value)],
  );
}

export async function listGalleryExpirations() {
  const [rows] = await getDatabase().query<(RowDataPacket & {id:string;couple_names:string;expiry:string})[]>(`
    SELECT c.id,c.couple_names,JSON_UNQUOTE(JSON_EXTRACT(s.value_json,'$.expiry')) expiry
    FROM clients c JOIN site_settings s ON s.setting_key=CONCAT('client-production:',c.id)
    WHERE JSON_UNQUOTE(JSON_EXTRACT(s.value_json,'$.expiry')) <> ''
    ORDER BY expiry,c.id`);
  const today = new Intl.DateTimeFormat("sv-SE",{timeZone:"Europe/Athens"}).format(new Date());
  const cutoff = new Date(Date.parse(today) + 15*86400000).toISOString().slice(0,10);
  return rows.filter(row => row.expiry <= cutoff);
}
