"use server";
import {stopOfferFollowups} from "@/lib/automations";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { updateLeadDetails } from "@/lib/leads";
const optional=(max:number)=>z.string().trim().max(max).transform(value=>value||null);
export async function updateLeadDetailsAction(formData:FormData){await requireAdmin();const input=z.object({id:z.uuid(),coupleNames:z.string().trim().min(2).max(255),email:z.union([z.literal(""),z.email().max(320)]).transform(value=>value||null),phone:optional(60),eventDate:z.union([z.literal(""),z.iso.date()]).transform(value=>value||null),ceremonyLocation:optional(255),receptionLocation:optional(255),guestCount:z.union([z.literal(""),z.coerce.number().int().min(1).max(10000)]).transform(value=>value===""?null:value),source:optional(120),notes:optional(5000)}).parse(Object.fromEntries(formData));await updateLeadDetails(input.id,input);revalidatePath(`/admin/leads/${input.id}`);revalidatePath("/admin/leads")}

export async function recordReplyForLead(form:FormData){
  await requireAdmin();
  const leadId=z.uuid().parse(form.get("leadId"));
  await stopOfferFollowups({leadId,reason:"Reply recorded for this job by the studio"});
  revalidatePath("/admin/leads/"+leadId);
  revalidatePath("/admin/automations");
}
