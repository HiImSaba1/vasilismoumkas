"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { saveDocumentTemplate } from "@/lib/document-templates";
export async function saveDocumentTemplateAction(formData:FormData){await requireAdmin();const input=z.object({id:z.union([z.literal(""),z.uuid()]),templateKey:z.string().trim().min(3).max(80).regex(/^[a-z0-9-]+$/),documentType:z.enum(["questionnaire","contract","invoice"]),eventType:z.enum(["wedding","baptism"]),locale:z.enum(["el","en"]),name:z.string().trim().min(3).max(255),content:z.string().trim().max(100000),isActive:z.string().optional(),isDefault:z.string().optional()}).parse(Object.fromEntries(formData));const field=input.documentType==="contract"?"contract_text":input.documentType==="questionnaire"?"instructions":"collection_details";await saveDocumentTemplate({...input,id:input.id||undefined,content:{[field]:input.content},isActive:input.isActive==="on",isDefault:input.isDefault==="on"});revalidatePath("/admin/document-templates");revalidatePath("/admin/leads")}
