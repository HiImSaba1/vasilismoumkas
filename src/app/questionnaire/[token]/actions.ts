"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { submitQuestionnaire } from "@/lib/questionnaires";
import { revalidateAdminWorkflow } from "@/lib/admin-workflow-revalidation";
const answer=z.string().trim().max(5000);
const tokenSchema=z.string().min(20).max(200);
export async function submitQuestionnaireAction(formData:FormData){const token=tokenSchema.parse(formData.get("token"));const answers=Object.fromEntries([...formData.entries()].filter(([key])=>key!=="token").map(([key,value])=>[key,answer.parse(value)]));await submitQuestionnaire(token,answers);revalidateAdminWorkflow();redirect(`/questionnaire/${encodeURIComponent(token)}?submitted=true`)}
