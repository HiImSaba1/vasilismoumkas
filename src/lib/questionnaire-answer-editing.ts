import "server-only";
import { createHash } from "node:crypto";
import type { RowDataPacket } from "mysql2/promise";
import { getDatabase } from "@/lib/database";
import { questionnaireFields, sanitizeQuestionnaireAnswers } from "@/lib/questionnaire-definitions";

export function questionnaireData(value: unknown): Record<string, unknown> {
  const parsed: unknown = typeof value === "string" ? JSON.parse(value) : value;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
  return parsed as Record<string, unknown>;
}

export function questionnaireVersion(id: string, status: string, data: Record<string, unknown>) {
  return createHash("sha256").update(JSON.stringify([id, status, data])).digest("hex");
}

export function questionnaireAnswerFields(eventType: "wedding" | "baptism", language: "gr" | "en", data: Record<string, unknown>) {
  const fields = questionnaireFields(eventType, language, data);
  const known = new Set(fields.map(field => field.name));
  // Keep historical answers editable without exposing configuration or audit keys.
  const reserved = new Set(["instructions", "custom_questions", "title", "description", "language", "event_type", "template_key"]);
  return [...fields, ...Object.keys(data).filter(key => !known.has(key) && !reserved.has(key) && !key.startsWith("_") && ["string","number","boolean"].includes(typeof data[key]))
    .map(name => ({ name, label: name.replaceAll("_", " "), help: "Existing answer" }))];
}

type AnswerRow = RowDataPacket & { id: string; status: string; data: unknown; updated_at: Date };

/** Answer-only admin mutation. Never updates workflow state or sends notifications. */
export async function saveAdminQuestionnaireAnswers(input: { clientId: string; version: string; answers: Record<string, string> }) {
  const connection = await getDatabase().getConnection();
  try {
    await connection.beginTransaction();
    const [clients] = await connection.query<(RowDataPacket & { lead_id: string | null; event_type: string; language: string | null })[]>(
      "SELECT c.lead_id,c.event_type,COALESCE(l.workflow_locale,o.language) language FROM clients c LEFT JOIN leads l ON l.id=c.lead_id LEFT JOIN offers o ON o.id=c.accepted_offer_id WHERE c.id=? FOR UPDATE", [input.clientId]);
    const client = clients[0];
    if (!client) throw new Error("Client unavailable.");
    const [native] = await connection.query<AnswerRow[]>(
      "SELECT id,status,document_data AS data,updated_at FROM lead_document_records WHERE lead_id=? AND document_type='questionnaire' FOR UPDATE", [client.lead_id]);
    let row: AnswerRow | undefined = native[0];
    if (!row) {
      const [legacy] = await connection.query<AnswerRow[]>(
        "SELECT id,IF(submitted_at IS NULL,'sent','completed') status,answers AS data,updated_at FROM questionnaires WHERE client_id=? FOR UPDATE", [input.clientId]);
      row = legacy[0];
    }
    if (!row) throw new Error("Create this client's questionnaire before editing answers.");
    const current = questionnaireData(row.data);
    if (questionnaireVersion(row.id, row.status, current) !== input.version) {
      throw new Error("The questionnaire changed since you opened it. Reload before saving; your edits have not been applied.");
    }
    const eventType = client.event_type === "baptism" ? "baptism" : "wedding";
    const language = client.language === "en" ? "en" : "gr";
    const allowed = new Set(questionnaireAnswerFields(eventType, language, current).map(field => field.name));
    const patch: Record<string, string> = {};
    for (const [key, value] of Object.entries(input.answers)) {
      if (!allowed.has(key)) throw new Error("Unknown questionnaire field. Reload before saving.");
      if (value.length > 5000) throw new Error("Each answer must contain at most 5,000 characters.");
      if (String(current[key] ?? "") !== value) patch[key] = value;
    }
    if (!Object.keys(patch).length) { await connection.commit(); return; }
    const next = { ...current, ...patch, _last_edit_at: new Date().toISOString(), _last_edit_by: "admin" };
    if (native[0]) {
      // Keep the original completion date, status and template, even after later corrections.
      if (row.status === "completed" && !current._submitted_at) Object.assign(next, { _submitted_at: new Date(row.updated_at).toISOString() });
      await connection.execute("UPDATE lead_document_records SET document_data=?,updated_at=CURRENT_TIMESTAMP WHERE id=?", [JSON.stringify(next), row.id]);
    } else {
      await connection.execute("UPDATE questionnaires SET answers=?,updated_at=CURRENT_TIMESTAMP WHERE id=?", [JSON.stringify(next), row.id]);
    }
    await connection.execute("INSERT INTO activity_log (lead_id,client_id,event_type,summary,metadata) VALUES (?,?,'questionnaire-answers-edited','Questionnaire answers updated by administrator',?)",
      [client.lead_id, input.clientId, JSON.stringify({ actor: "admin", fields: Object.keys(patch), source: native[0] ? "portal" : "legacy" })]);
    await connection.commit();
  } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
}

/** Serialize portal submission with admin answer edits and preserve existing data. */
export async function submitNativeQuestionnaireAnswers(input: { leadId: string; clientId: string; eventType: "wedding" | "baptism"; language: "gr" | "en"; answers: Record<string, string> }) {
  const connection = await getDatabase().getConnection();
  try {
    await connection.beginTransaction();
    await connection.query("SELECT id FROM clients WHERE id=? FOR UPDATE", [input.clientId]);
    const [rows] = await connection.query<AnswerRow[]>("SELECT id,status,document_data AS data,updated_at FROM lead_document_records WHERE lead_id=? AND document_type='questionnaire' FOR UPDATE", [input.leadId]);
    const row = rows[0];
    if (!row) throw new Error("Questionnaire unavailable.");
    if (row.status === "completed") { await connection.commit(); return false; }
    const current = questionnaireData(row.data);
    const accepted = sanitizeQuestionnaireAnswers(input.eventType, input.language, input.answers, current);
    const now = new Date().toISOString();
    const next = { ...current, ...accepted, _submitted_at: now, _last_edit_at: now, _last_edit_by: "client" };
    await connection.execute("UPDATE lead_document_records SET status='completed',document_data=?,updated_at=CURRENT_TIMESTAMP WHERE id=?", [JSON.stringify(next), row.id]);
    await connection.execute("UPDATE onboarding SET questionnaire_status='completed' WHERE client_id=?", [input.clientId]);
    await connection.execute("INSERT INTO activity_log (lead_id,client_id,event_type,summary,metadata) VALUES (?,?,'questionnaire-completed','Portal questionnaire submitted',?)", [input.leadId, input.clientId, JSON.stringify({ actor: "client" })]);
    await connection.commit();
    return true;
  } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
}

export async function submitLegacyQuestionnaireAnswers(input: { id: string; clientId: string; eventType: "wedding" | "baptism"; language: "gr" | "en"; answers: Record<string, string> }) {
  const connection = await getDatabase().getConnection();
  try {
    await connection.beginTransaction();
    await connection.query("SELECT id FROM clients WHERE id=? FOR UPDATE", [input.clientId]);
    const [rows] = await connection.query<(RowDataPacket & { answers: unknown; submitted_at: Date | null })[]>("SELECT answers,submitted_at FROM questionnaires WHERE id=? AND client_id=? FOR UPDATE", [input.id, input.clientId]);
    const row = rows[0];
    if (!row || row.submitted_at) throw new Error("Questionnaire unavailable.");
    const current = questionnaireData(row.answers);
    const now = new Date().toISOString();
    const next = { ...current, ...sanitizeQuestionnaireAnswers(input.eventType, input.language, input.answers, current), _last_edit_at: now, _last_edit_by: "client" };
    await connection.execute("UPDATE questionnaires SET answers=?,submitted_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=?", [JSON.stringify(next), input.id]);
    await connection.execute("UPDATE onboarding SET questionnaire_status='completed' WHERE client_id=?", [input.clientId]);
    await connection.execute("INSERT INTO activity_log (client_id,event_type,summary,metadata) VALUES (?,'questionnaire-completed','Private questionnaire submitted',?)", [input.clientId, JSON.stringify({ actor: "client" })]);
    await connection.commit();
  } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
}
