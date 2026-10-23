import "server-only";
import { createHash, randomUUID } from "node:crypto";
import type { RowDataPacket } from "mysql2/promise";
import { getDatabase, isDatabaseConfigured } from "@/lib/database";

type Revision = { id: string; at: string; actor: "admin"; content: unknown };
export type ContentWorkspace = { draft: unknown; revisions: Revision[]; updatedAt: string | null };
export const contentVersion = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const decode = (value: unknown): unknown => typeof value === "string" ? JSON.parse(value) : value;
const empty = (): ContentWorkspace => ({ draft: null, revisions: [], updatedAt: null });
export async function getContentWorkspace(key: string) {
  if (!isDatabaseConfigured()) return { workspace: empty(), version: contentVersion(null) };
  const [rows] = await getDatabase().query<(RowDataPacket & { value_json: unknown })[]>("SELECT value_json FROM site_settings WHERE setting_key=?", [`workspace:${key}`]);
  const raw = rows[0] ? decode(rows[0].value_json) : null;
  return { workspace: (raw ?? empty()) as ContentWorkspace, version: contentVersion(raw) };
}

// The draft, previous published version and public value change atomically.
// Revision restore is a new publish, so the version being replaced remains recoverable.
export async function writeContentWorkspace({ key, content, expectedVersion, expectedWorkspaceVersion, mode, fallback, preserveDraft=false }: {
  key: string; content: unknown; expectedVersion: string; expectedWorkspaceVersion: string;
  mode: "draft" | "publish"; fallback: unknown; preserveDraft?:boolean;
}) {
  const connection = await getDatabase().getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.query<(RowDataPacket & { setting_key: string; value_json: unknown })[]>(
      "SELECT setting_key,value_json FROM site_settings WHERE setting_key IN (?,?) ORDER BY setting_key FOR UPDATE", [key, `workspace:${key}`]);
    const current = rows.find(row => row.setting_key === key);
    const stored = rows.find(row => row.setting_key === `workspace:${key}`);
    const raw = current ? decode(current.value_json) : null;
    const workspaceRaw = stored ? decode(stored.value_json) : null;
    if (contentVersion(raw) !== expectedVersion || contentVersion(workspaceRaw) !== expectedWorkspaceVersion) {
      throw new Error("Content changed in another window. Reload before saving; your draft was not overwritten.");
    }
    const workspace = (workspaceRaw ?? empty()) as ContentWorkspace;
    const at = new Date().toISOString();
    const next: ContentWorkspace = mode === "draft" ? { ...workspace, draft: content, updatedAt: at } : {
      draft: preserveDraft?workspace.draft:null, updatedAt: at,
      revisions: [{ id: randomUUID(), at, actor: "admin" as const, content: raw ?? fallback }, ...workspace.revisions].slice(0, 12),
    };
    const write = async (settingKey: string, value: unknown, exists: boolean) => {
      if (exists) await connection.execute("UPDATE site_settings SET value_json=?,updated_at=CURRENT_TIMESTAMP WHERE setting_key=?", [JSON.stringify(value), settingKey]);
      else await connection.execute("INSERT INTO site_settings (setting_key,value_json) VALUES (?,?)", [settingKey, JSON.stringify(value)]);
    };
    await write(`workspace:${key}`, next, !!stored);
    if (mode === "publish") await write(key, content, !!current);
    await connection.commit();
  } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
}

export async function getStoredContentVersion(key: string) {
  return (await getPublishedContentSnapshot(key,null)).version;
}

// Content and its version must come from the same read, never two racing queries.
export async function getPublishedContentSnapshot(key:string,fallback:unknown) {
  if (!isDatabaseConfigured()) return {content:fallback,version:contentVersion(null)};
  const [rows] = await getDatabase().query<(RowDataPacket & { value_json: unknown })[]>("SELECT value_json FROM site_settings WHERE setting_key=?", [key]);
  const raw=rows[0]?decode(rows[0].value_json):null;
  return {content:raw??fallback,version:contentVersion(raw)};
}
