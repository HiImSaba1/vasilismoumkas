import "server-only";
import { z } from "zod";
import type { RowDataPacket } from "mysql2/promise";
import { getDatabase, isDatabaseConfigured } from "@/lib/database";
import { internalLink } from "@/lib/public-page-content";
export const REDIRECTS_KEY = "public_retired_redirects_v1";
export const redirectSchema = z.array(z.object({ from: internalLink, to: internalLink })).max(100).superRefine((items, ctx) => {
  const sources = new Set<string>();
  for (const item of items) {
    if (!item.from.startsWith("/legacy/") || sources.has(item.from) || item.from === item.to || items.some(other => other.from === item.to) || item.from === "/" || /[?#]/.test(item.from) || /^\/(admin|api|offer|portal|questionnaire|timeline|_next|uploads|portfolio|destinations|vm_img|fonts|videos)(\/|$)/.test(item.from)) ctx.addIssue({ code: "custom", message: "Redirects must be unique retired public paths, without chains, loops or private paths." });
    sources.add(item.from);
  }
});
export async function getPublicRedirects() {
  if (!isDatabaseConfigured()) return [];
  const [rows] = await getDatabase().query<(RowDataPacket & { value_json: unknown })[]>("SELECT value_json FROM site_settings WHERE setting_key=?", [REDIRECTS_KEY]);
  return rows[0] ? redirectSchema.parse(typeof rows[0].value_json === "string" ? JSON.parse(rows[0].value_json) : rows[0].value_json) : [];
}
