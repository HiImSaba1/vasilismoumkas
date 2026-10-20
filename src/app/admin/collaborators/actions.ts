"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { saveCollaborator } from "@/lib/coverage-team";
export type CollaboratorActionState={success:boolean;message:string};
const optional=(max:number)=>z.string().trim().max(max).transform(value=>value||null);
const checked=z.preprocess(value=>value==="on"||value===true,z.boolean());
export async function saveCollaboratorAction(_state:CollaboratorActionState,formData:FormData):Promise<CollaboratorActionState>{try{await requireAdmin();const input=z.object({id:z.union([z.literal(""),z.uuid()]),fullName:z.string().trim().min(2).max(255),specialty:z.enum(["photographer","videographer","both"]),email:z.union([z.literal(""),z.email().max(320)]).transform(value=>value||null),phone:optional(60),baseLocation:optional(255),serviceAreas:optional(5000),websiteUrl:z.union([z.literal(""),z.url().max(1000)]).transform(value=>value||null),internalNotes:optional(10000),isActive:checked}).parse(Object.fromEntries(formData));await saveCollaborator({...input,id:input.id||undefined},process.env.ADMIN_USERNAME?.trim()||"VASILIS");revalidatePath("/admin/collaborators");revalidatePath("/admin/clients");return{success:true,message:input.id?"Collaborator details updated successfully.":"Collaborator created successfully."}}catch(error){return{success:false,message:error instanceof z.ZodError?(error.issues[0]?.message??"Invalid collaborator details."):error instanceof Error?error.message:"Unable to save collaborator."}}}
