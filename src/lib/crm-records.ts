import "server-only";

import fs from "node:fs/promises";
import path from "node:path";
import type { RowDataPacket } from "mysql2/promise";
import { getDatabase, isDatabaseConfigured } from "@/lib/database";
import { recordOfferView } from "@/lib/offers";

export type CrmPayload = Record<string, unknown>;
type PayloadRow = RowDataPacket & { payload: string | CrmPayload; expires_at?: Date | null; status?: string; client_name?:string|null; event_type?:"wedding"|"baptism"; language?:"en"|"gr"; event_date?:Date|string|null; ceremony_location?:string|null; reception_location?:string|null };

const legacyPath = (name: "offers" | "timelines") =>
  path.join(process.cwd(), "src", "app", "(site)", "data", `${name}.json`);

async function readLegacy(name: "offers" | "timelines") {
  try {
    return JSON.parse(await fs.readFile(legacyPath(name), "utf8")) as Record<string, CrmPayload>;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return {};
    throw error;
  }
}

async function writeLegacy(name: "offers" | "timelines", slug: string, payload: CrmPayload) {
  const records = await readLegacy(name);
  records[slug] = payload;
  await fs.writeFile(legacyPath(name), JSON.stringify(records, null, 2), "utf8");
}

function parsePayload(value: string | CrmPayload) {
  return typeof value === "string" ? (JSON.parse(value) as CrmPayload) : value;
}

export async function getOffer(slug: string, trackView = false) {
  if (!isDatabaseConfigured()) return (await readLegacy("offers"))[slug] ?? null;
  const [rows] = await getDatabase().query<PayloadRow[]>(`SELECT o.payload,o.expires_at,o.status,o.client_name,o.event_type,o.language,l.event_date,l.ceremony_location,l.reception_location
    FROM offers o LEFT JOIN leads l ON l.id=o.lead_id
    WHERE o.slug=? AND o.status<>'revoked' LIMIT 1`, [slug]);
  const row = rows[0];
  if (!row) return null;
  if (row.expires_at && new Date(row.expires_at).getTime() <= Date.now()) return { expired: true };
  if (trackView) await recordOfferView(slug);
  const payload=parsePayload(row.payload);
  const eventDate=row.event_date?new Date(row.event_date).toISOString().slice(0,10):"";
  return {
    ...payload,
    n:typeof payload.n==="string"&&payload.n.trim()?payload.n:row.client_name??"",
    type:payload.type==="baptism"||payload.type==="wedding"?payload.type:row.event_type??"wedding",
    lang:payload.lang==="gr"||payload.lang==="en"?payload.lang:row.language??"en",
    d:typeof payload.d==="string"&&payload.d.trim()?payload.d:eventDate,
    loc:typeof payload.loc==="string"&&payload.loc.trim()?payload.loc:row.reception_location??row.ceremony_location??"",
    _offerStatus: row.status ?? "sent",
  };
}

export async function saveOffer(slug: string, payload: CrmPayload) {
  if (!isDatabaseConfigured()) return writeLegacy("offers", slug, payload);
  const eventType = payload.type === "baptism" ? "baptism" : "wedding";
  const language = payload.lang === "gr" ? "gr" : "en";
  const clientName = typeof payload.n === "string" ? payload.n : null;
  const clientEmail = typeof payload.clientEmail === "string" ? payload.clientEmail : null;
  const leadId = typeof payload.leadId === "string" ? payload.leadId : null;
  await getDatabase().execute(
    `INSERT INTO offers (slug,lead_id,event_type,language,client_name,client_email,status,payload)
     VALUES (?,?,?,?,?,?, 'draft', ?)
     ON DUPLICATE KEY UPDATE lead_id=VALUES(lead_id),event_type=VALUES(event_type),language=VALUES(language),client_name=VALUES(client_name),client_email=VALUES(client_email),payload=VALUES(payload),updated_at=CURRENT_TIMESTAMP`,
    [slug, leadId, eventType, language, clientName, clientEmail, JSON.stringify(payload)],
  );
  if (leadId) await getDatabase().execute("UPDATE leads SET status='offer-draft' WHERE id=? AND status IN ('new','awaiting-information','qualified')",[leadId]);
}

export async function getTimeline(slug: string) {
  if (!isDatabaseConfigured()) return (await readLegacy("timelines"))[slug] ?? null;
  const [rows] = await getDatabase().query<PayloadRow[]>("SELECT payload FROM timelines WHERE slug = ? AND status = 'published' LIMIT 1", [slug]);
  return rows[0] ? parsePayload(rows[0].payload) : null;
}

export async function saveTimeline(slug: string, payload: CrmPayload) {
  if (!isDatabaseConfigured()) return writeLegacy("timelines", slug, payload);
  const language = slug.endsWith("-gr") ? "gr" : "en";
  const clientName = typeof payload.names_en === "string" ? payload.names_en : typeof payload.names_gr === "string" ? payload.names_gr : null;
  const clientId = typeof payload.clientId === "string" ? payload.clientId : null;
  await getDatabase().execute(
    `INSERT INTO timelines (slug,client_id,language,client_name,status,payload,published_at)
     VALUES (?,?,?,?,'published',?,CURRENT_TIMESTAMP)
     ON DUPLICATE KEY UPDATE client_id=COALESCE(VALUES(client_id),client_id),language=VALUES(language),client_name=VALUES(client_name),status='published',payload=VALUES(payload),published_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP`,
    [slug, clientId, language, clientName, JSON.stringify(payload)],
  );
  if(clientId)await getDatabase().execute("UPDATE onboarding SET timeline_status='sent' WHERE client_id=?",[clientId]);
}

export async function getAdminOverviewStats() {
  if (!isDatabaseConfigured()) {
    const [offers, timelines] = await Promise.all([readLegacy("offers"), readLegacy("timelines")]);
    return { leads: 0, offers: Object.keys(offers).length, onboarding: 0, scheduled: 0, timelines: Object.keys(timelines).length, database: false };
  }
  const [rows] = await getDatabase().query<(RowDataPacket & { leads: number; offers: number; onboarding: number; scheduled: number; timelines: number })[]>(
    `SELECT (SELECT COUNT(*) FROM leads WHERE status NOT IN ('lost','converted')) AS leads,
      (SELECT COUNT(*) FROM offers WHERE status NOT IN ('revoked','expired')) AS offers,
      (SELECT COUNT(*) FROM onboarding WHERE booking_status <> 'cancelled') AS onboarding,
      (SELECT COUNT(*) FROM automation_jobs WHERE status = 'scheduled') AS scheduled,
      (SELECT COUNT(*) FROM timelines WHERE status = 'published') AS timelines`,
  );
  return { ...rows[0], database: true };
}
