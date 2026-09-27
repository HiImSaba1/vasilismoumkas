"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { clearWorkflowStepStatus,setWorkflowStepStatus,workflowStatuses } from "@/lib/client-workflow";

const inputSchema=z.object({leadId:z.uuid(),stepKey:z.string().trim().min(1).max(40),status:z.enum(workflowStatuses),note:z.string().trim().max(500).optional()});
export async function updateWorkflowStepAction(formData:FormData){await requireAdmin();const input=inputSchema.parse(Object.fromEntries(formData));await setWorkflowStepStatus(input.leadId,input.stepKey,input.status,input.note||null);revalidatePath("/admin/leads");revalidatePath(`/admin/leads/${input.leadId}`);revalidatePath("/admin/clients");if(formData.get("clientId"))revalidatePath(`/admin/clients/${formData.get("clientId")}`)}
export async function resetWorkflowStepAction(formData:FormData){await requireAdmin();const input=z.object({leadId:z.uuid(),stepKey:z.string().trim().min(1).max(40),clientId:z.string().optional()}).parse(Object.fromEntries(formData));await clearWorkflowStepStatus(input.leadId,input.stepKey);revalidatePath("/admin/leads");revalidatePath(`/admin/leads/${input.leadId}`);revalidatePath("/admin/clients");if(input.clientId)revalidatePath(`/admin/clients/${input.clientId}`)}
