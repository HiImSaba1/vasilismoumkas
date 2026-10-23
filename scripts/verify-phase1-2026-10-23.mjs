// Offline mutation tests: no environment loading, database, SMTP or network.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";
const nativeRequire = createRequire(import.meta.url);
function load(path, mocks = {}) {
  const code = ts.transpileModule(readFileSync(path, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const loadedModule = { exports: {} };
  new Function("require", "module", "exports", code)(name => {
    if (name === "server-only") return {};
    if (Object.hasOwn(mocks, name)) return mocks[name];
    if (name.startsWith("@/")) throw new Error(`Unmocked application import: ${name}`);
    return nativeRequire(name);
  }, loadedModule, loadedModule.exports);
  return loadedModule.exports;
}
const definitions = load("src/lib/questionnaire-definitions.ts");
function fixture({ legacy = false, completed = true } = {}) {
  const data = { bride_name: "Existing name", extra_notes: "Keep this answer", instructions: "Keep instructions", custom_questions: JSON.stringify([{ label: "Access needs" }]), custom_1: "Keep custom answer", historic_answer: "Keep historic answer" };
  const row = { id: "questionnaire-1", status: completed ? "completed" : "sent", data: JSON.stringify(data), updated_at: new Date("2026-10-01T10:00:00Z") };
  const queries = [], writes = [];
  let committed = false, rolledBack = false, released = false;
  const connection = {
    beginTransaction: async () => {}, commit: async () => { committed = true; }, rollback: async () => { rolledBack = true; }, release: () => { released = true; },
    query: async (sql, params) => {
      queries.push({ sql, params });
      if (sql.includes("FROM clients")) return [[{ lead_id: "lead-1", event_type: "wedding", language: "en" }]];
      if (sql.includes("FROM lead_document_records")) return [legacy ? [] : [row]];
      if (sql.includes("FROM questionnaires")) return [[row]];
      throw new Error(`Unexpected query: ${sql}`);
    },
    execute: async (sql, params) => { writes.push({ sql, params }); return [{ affectedRows: 1 }]; },
  };
  const api = load("src/lib/questionnaire-answer-editing.ts", {
    "@/lib/database": { getDatabase: () => ({ getConnection: async () => connection }) },
    "@/lib/questionnaire-definitions": definitions,
  });
  return { api, data, row, queries, writes, state: () => ({ committed, rolledBack, released }) };
}

for (const legacy of [false, true]) {
  const f = fixture({ legacy });
  await f.api.saveAdminQuestionnaireAnswers({ clientId: "client-1", version: f.api.questionnaireVersion(f.row.id, f.row.status, f.data), answers: { bride_name: "Corrected name" } });
  const update = f.writes.find(item => item.sql.startsWith("UPDATE"));
  const saved = JSON.parse(update.params[0]);
  assert.equal(saved.bride_name, "Corrected name");
  assert.equal(saved.extra_notes, f.data.extra_notes);
  assert.equal(saved.custom_1, f.data.custom_1);
  assert.equal(saved.instructions, f.data.instructions);
  assert.equal(saved.historic_answer, f.data.historic_answer);
  assert.equal(saved._last_edit_by, "admin");
  assert.ok(saved._last_edit_at);
  assert.ok(!/SET\s+status|submitted_at\s*=|onboarding|automation_jobs|invoice|contract/i.test(update.sql));
  assert.equal(f.writes.length, 2, "Only the answer row and audit event may be written");
  assert.ok(f.writes[1].sql.includes("activity_log"));
  assert.deepEqual(f.state(), { committed: true, rolledBack: false, released: true });
}
console.log("PASS - native and legacy submitted questionnaires retain all unedited data and status; admin actor is recorded.");

for (const invalid of ["stale", "unknown", "oversized"]) {
  const f = fixture();
  await assert.rejects(f.api.saveAdminQuestionnaireAnswers({ clientId: "client-1", version: invalid === "stale" ? "outdated" : f.api.questionnaireVersion(f.row.id, f.row.status, f.data), answers: invalid === "unknown" ? { status: "draft" } : { bride_name: invalid === "oversized" ? "x".repeat(5001) : "Changed" } }));
  assert.equal(f.writes.length, 0);
  assert.equal(f.state().rolledBack, true);
  assert.equal(f.state().released, true);
}
console.log("PASS - stale edits, configuration injection and oversized answers are rejected without writes.");

const noChange = fixture();
await noChange.api.saveAdminQuestionnaireAnswers({ clientId: "client-1", version: noChange.api.questionnaireVersion(noChange.row.id, noChange.row.status, noChange.data), answers: { bride_name: noChange.data.bride_name } });
assert.equal(noChange.writes.length, 0);
const submitted = fixture();
assert.equal(await submitted.api.submitNativeQuestionnaireAnswers({ leadId: "lead-1", clientId: "client-1", eventType: "wedding", language: "en", answers: {} }), false);
assert.equal(submitted.writes.length, 0);
const pending = fixture({ completed: false });
await pending.api.submitNativeQuestionnaireAnswers({ leadId: "lead-1", clientId: "client-1", eventType: "wedding", language: "en", answers: { bride_name: "Client name" } });
const clientData = JSON.parse(pending.writes[0].params[0]);
assert.equal(clientData._last_edit_by, "client");
assert.equal(clientData.custom_1, pending.data.custom_1);
console.log("PASS - unchanged admin saves and repeated completed submissions do not write; new client submissions retain answers and record the actor.");

const form = load("src/lib/public-page-form.ts");
const shape = { intro: ["First", "Second"], faq: [{ question: "Question", answer: "Answer", date: "Label" }] };
const data = new FormData();
for (const field of form.publicPageFields(shape)) data.set(field.name, field.value);
assert.deepEqual(form.readPublicPageForm(shape, data), shape);
data.delete("content.intro.0");
assert.throws(() => form.readPublicPageForm(shape, data));
console.log("PASS - page forms retain paragraph and FAQ structure; omitted fields cannot silently erase content.");

const actionPath = "src/app/admin/clients/[id]/actions.ts";
const actionMocks = Object.fromEntries([...readFileSync(actionPath, "utf8").matchAll(/from "([^"]+)"/g)]
  .map(match => match[1]).filter(name => name.startsWith("@/") || name.startsWith("next/")).map(name => [name, {}]));
let unauthorizedWrites = 0;
actionMocks["@/lib/admin-auth"] = { requireAdmin: async () => { throw new Error("Unauthorized"); } };
actionMocks["@/lib/questionnaire-answer-editing"] = { saveAdminQuestionnaireAnswers: async () => { unauthorizedWrites++; } };
const actions = load(actionPath, actionMocks);
await assert.rejects(actions.saveQuestionnaireAnswersAction({ success: false, message: "" }, new FormData()), /Unauthorized/);
assert.equal(unauthorizedWrites, 0);
console.log("PASS - unauthenticated questionnaire actions are rejected before any mutation.");

console.log("PASS - PHASE 1 OFFLINE CHECKS COMPLETE; NO DATABASE, NETWORK OR EMAIL USED.");
