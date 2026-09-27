"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { onboardingFields,updateOnboardingField } from "@/lib/onboarding";
import { revalidateAdminWorkflow } from "@/lib/admin-workflow-revalidation";
export async function updateOnboardingAction(formData:FormData){await requireAdmin();const id=z.uuid().parse(formData.get("id"));const field=z.enum(Object.keys(onboardingFields) as [keyof typeof onboardingFields,...(keyof typeof onboardingFields)[]]).parse(formData.get("field"));const value=z.string().parse(formData.get("value"));await updateOnboardingField(id,field,value);revalidatePath("/admin/onboarding");revalidatePath("/admin/overview");revalidatePath("/admin/automations");revalidateAdminWorkflow()}
