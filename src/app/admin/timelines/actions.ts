"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { regenerateTimeline,republishTimeline,revokeTimeline } from "@/lib/timelines";
const slug=z.string().min(1).max(190).regex(/^[\p{L}\p{N}-]+$/u);
export async function revokeTimelineAction(formData:FormData){await requireAdmin();await revokeTimeline(slug.parse(formData.get("slug")));revalidatePath("/admin/timelines")}
export async function republishTimelineAction(formData:FormData){await requireAdmin();await republishTimeline(slug.parse(formData.get("slug")));revalidatePath("/admin/timelines")}
export async function regenerateTimelineAction(formData:FormData){await requireAdmin();const next=await regenerateTimeline(slug.parse(formData.get("slug")));revalidatePath("/admin/timelines");redirect(`/admin/dashboard?type=timeline&timeline=${encodeURIComponent(next)}`)}
