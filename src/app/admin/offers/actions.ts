"use server";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { deleteOffer,getAdminOffer,markOfferSent,OfferAcceptanceError,regenerateOffer,rejectOffer,respondToOffer,revokeOffer,updateOffer } from "@/lib/offers";
import { revalidateAdminWorkflow } from "@/lib/admin-workflow-revalidation";
const payload=z.record(z.string(),z.unknown());
const slug=z.string().min(1).max(190).regex(/^[\p{L}\p{N}-]+$/u);
export async function markOfferSentAction(formData:FormData){await requireAdmin();await markOfferSent(slug.parse(formData.get("slug")));revalidatePath("/admin/offers");revalidateAdminWorkflow()}
export async function revokeOfferAction(formData:FormData){await requireAdmin();await revokeOffer(slug.parse(formData.get("slug")));revalidatePath("/admin/offers");revalidatePath("/admin/overview")}
export async function regenerateOfferAction(formData:FormData){await requireAdmin();await regenerateOffer(slug.parse(formData.get("slug")));revalidatePath("/admin/offers");revalidatePath("/admin/overview")}
export async function updateOfferAction(slugValue:string,data:unknown){await requireAdmin();const value=slug.parse(slugValue);await updateOffer(value,payload.parse(data));revalidatePath("/admin/offers");revalidatePath(`/offer/${value}`);return {success:true}}
export async function deleteOfferAction(formData:FormData){await requireAdmin();await deleteOffer(slug.parse(formData.get("slug")));revalidatePath("/admin/offers");revalidatePath("/admin/overview")}
export type AcceptOfferState={status:"idle"|"success"|"error";message:string};
export async function acceptOfferAction(_previous:AcceptOfferState,formData:FormData):Promise<AcceptOfferState>{await requireAdmin();try{const input=z.object({slug,name:z.string().trim().min(2).max(255),email:z.email().max(320),packageName:z.string().trim().max(255).optional()}).parse(Object.fromEntries(formData));const offer=await getAdminOffer(input.slug);if(!offer)return {status:"error",message:"Offer not found. Reload the page and try again."};await respondToOffer(input.slug,{action:"accept",name:input.name,email:input.email,packageName:input.packageName||undefined,message:"Accepted manually from the admin panel after confirmation by phone, message, or email."},{adminOverride:true});revalidatePath("/admin/offers");revalidateAdminWorkflow({leadId:offer.leadId});return {status:"success",message:"Offer accepted. The existing lead now has one client workspace, portal and booking-document set."}}catch(error){if(error instanceof OfferAcceptanceError){console.error("Admin offer acceptance failed",error);return {status:"error",message:error.message}}if(error instanceof z.ZodError)return {status:"error",message:"Check the client name, email and selected collection, then try again."};const reference=randomUUID().replaceAll("-","").slice(0,10).toUpperCase();console.error(`Admin offer acceptance failed [${reference}]`,error);return {status:"error",message:`The offer could not be accepted. No partial client records were kept. Reference: ${reference}.`}}}
export async function rejectOfferAction(formData:FormData){await requireAdmin();await rejectOffer(slug.parse(formData.get("slug")));revalidatePath("/admin/offers");revalidatePath("/admin/leads");revalidatePath("/admin/overview")}
