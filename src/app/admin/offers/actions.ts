"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { deleteOffer,getAdminOffer,markOfferSent,regenerateOffer,rejectOffer,respondToOffer,revokeOffer,updateOffer } from "@/lib/offers";
import { revalidateAdminWorkflow } from "@/lib/admin-workflow-revalidation";
const payload=z.record(z.string(),z.unknown());
const slug=z.string().min(1).max(190).regex(/^[\p{L}\p{N}-]+$/u);
export async function markOfferSentAction(formData:FormData){await requireAdmin();await markOfferSent(slug.parse(formData.get("slug")));revalidatePath("/admin/offers");revalidateAdminWorkflow()}
export async function revokeOfferAction(formData:FormData){await requireAdmin();await revokeOffer(slug.parse(formData.get("slug")));revalidatePath("/admin/offers");revalidatePath("/admin/overview")}
export async function regenerateOfferAction(formData:FormData){await requireAdmin();await regenerateOffer(slug.parse(formData.get("slug")));revalidatePath("/admin/offers");revalidatePath("/admin/overview")}
export async function updateOfferAction(slugValue:string,data:unknown){await requireAdmin();const value=slug.parse(slugValue);await updateOffer(value,payload.parse(data));revalidatePath("/admin/offers");revalidatePath(`/offer/${value}`);return {success:true}}
export async function deleteOfferAction(formData:FormData){await requireAdmin();await deleteOffer(slug.parse(formData.get("slug")));revalidatePath("/admin/offers");revalidatePath("/admin/overview")}
export async function acceptOfferAction(formData:FormData){await requireAdmin();const input=z.object({slug,name:z.string().trim().min(2).max(255),email:z.email().max(320),packageName:z.string().trim().max(255).optional()}).parse(Object.fromEntries(formData));const offer=await getAdminOffer(input.slug);if(!offer)throw new Error("Offer not found");await respondToOffer(input.slug,{action:"accept",name:input.name,email:input.email,packageName:input.packageName||undefined,message:"Accepted manually from the admin panel after confirmation by phone, message, or email."},{adminOverride:true});revalidatePath("/admin/offers");revalidateAdminWorkflow({leadId:offer.leadId})}
export async function rejectOfferAction(formData:FormData){await requireAdmin();await rejectOffer(slug.parse(formData.get("slug")));revalidatePath("/admin/offers");revalidatePath("/admin/leads");revalidatePath("/admin/overview")}
