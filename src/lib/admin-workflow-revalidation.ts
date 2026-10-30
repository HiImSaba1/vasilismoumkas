import "server-only";
import { revalidatePath } from "next/cache";

export function revalidateAdminWorkflow(input?:{leadId?:string|null;clientId?:string|null}){
  for(const path of["/admin/pending","/admin/journeys","/admin/leads","/admin/clients","/admin/onboarding","/admin/automations","/admin/overview"])revalidatePath(path);
  if(input?.leadId)revalidatePath(`/admin/leads/${input.leadId}`);
  if(input?.clientId)revalidatePath(`/admin/clients/${input.clientId}`);
  revalidatePath("/admin","layout");
}
