"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { cancelAutomationJob, retryAutomationJob } from "@/lib/automations";
const id=z.uuid();
export async function retryJobAction(formData:FormData){await requireAdmin();await retryAutomationJob(id.parse(formData.get("id")));revalidatePath("/admin/automations")}
export async function cancelJobAction(formData:FormData){await requireAdmin();await cancelAutomationJob(id.parse(formData.get("id")));revalidatePath("/admin/automations")}
