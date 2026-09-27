"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { updatePortalDocument } from "@/lib/client-portals";
import { revalidateAdminWorkflow } from "@/lib/admin-workflow-revalidation";
import { portalSlugPath } from "@/lib/portal-url";
export async function submitPortalQuestionnaire(formData:FormData){const slug=z.string().min(10).max(190).parse(formData.get("slug"));const entries=Object.fromEntries([...formData.entries()].filter(([key])=>key!=="slug").map(([key,value])=>[key,String(value).trim().slice(0,5000)]));await updatePortalDocument(slug,"questionnaire",entries);revalidateAdminWorkflow();redirect(`/portal/${portalSlugPath(slug)}?tab=questionnaire&saved=true`)}
export async function acceptPortalContract(formData:FormData){const slug=z.string().min(10).max(190).parse(formData.get("slug"));const name=z.string().trim().min(2).max(190).parse(formData.get("signed_name"));await updatePortalDocument(slug,"contract",{signed_name:name,signed_at:new Date().toISOString()});revalidateAdminWorkflow();redirect(`/portal/${portalSlugPath(slug)}?tab=contract&saved=true`)}
