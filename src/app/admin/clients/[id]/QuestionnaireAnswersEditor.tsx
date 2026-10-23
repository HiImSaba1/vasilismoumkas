"use client";

import { useActionState } from "react";
import type { QuestionnaireField } from "@/lib/questionnaire-definitions";
import { saveQuestionnaireAnswersAction } from "./actions";

export function QuestionnaireAnswersEditor({ clientId, version, fields, answers, updatedAt, lastEditedBy }: {
  clientId: string; version: string; fields: QuestionnaireField[]; answers: Record<string, unknown>;
  updatedAt: string; lastEditedBy: string | null;
}) {
  const [state, action, pending] = useActionState(saveQuestionnaireAnswersAction, { success: false, message: "" });
  return <details className="border border-ink-black/15 bg-white">
    <summary className="cursor-pointer list-none px-4 py-3 text-xs uppercase">Edit questionnaire answers</summary>
    <form action={action} className="grid gap-4 border-t border-ink-black/10 p-4 md:grid-cols-2">
      <input type="hidden" name="clientId" value={clientId} />
      <input type="hidden" name="version" value={version} />
      <p className="text-sm text-ink-black/60 md:col-span-2">Last updated: {updatedAt} · {lastEditedBy === "admin" ? "Administrator" : lastEditedBy === "client" ? "Client" : "Author not recorded"}</p>
      <div data-admin-locale-isolated="true" className="contents">{fields.map(field => <label key={`${version}:${field.name}`} className="grid gap-2 text-xs uppercase">
        {field.label}<textarea name={`answer.${field.name}`} defaultValue={String(answers[field.name] ?? "")} maxLength={5000} rows={3} className="border border-ink-black/20 p-3 text-sm normal-case" />
      </label>)}</div>
      {state.message && <p role="status" className={`${state.success ? "text-green-800" : "text-red-700"} text-sm md:col-span-2`}>{state.message}</p>}
      <button disabled={pending} className="w-fit bg-ink-black px-5 py-3 text-xs uppercase text-white disabled:opacity-50">{pending ? "Saving…" : "Save questionnaire answers"}</button>
      <p className="text-sm text-ink-black/50 md:col-span-2">Administrator corrections remain available after submission. Saving answers does not send email or change booking or document status.</p>
    </form>
  </details>;
}
