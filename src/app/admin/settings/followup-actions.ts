"use server";
import {requireAdmin} from "@/lib/admin-auth";
import {saveFollowupSettings} from "@/lib/followup-settings";
import {revalidatePath} from "next/cache";

export async function updateFollowupSettings(form:FormData) {
  await requireAdmin();
  await saveFollowupSettings({days002:Number(form.get("days002")),days003:Number(form.get("days003"))});
  revalidatePath("/admin/settings");
}
