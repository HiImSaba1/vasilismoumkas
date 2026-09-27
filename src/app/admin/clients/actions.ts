"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { deleteClientJourney } from "@/lib/leads";
export async function deleteClientAction(formData:FormData){await requireAdmin();await deleteClientJourney(z.uuid().parse(formData.get("id")));for(const path of["/admin/clients","/admin/leads","/admin/offers","/admin/onboarding","/admin/timelines","/admin/automations","/admin/overview"])revalidatePath(path)}
