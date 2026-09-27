"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { disconnectGoogleCalendar,syncGoogleCalendar } from "@/lib/google-calendar";

export async function syncGoogleCalendarAction(){await requireAdmin();let count=0;try{count=await syncGoogleCalendar()}catch{redirect("/admin/calendar?google=sync-failed")}revalidatePath("/admin/calendar");redirect(`/admin/calendar?google=synced&count=${count}`)}
export async function disconnectGoogleCalendarAction(){await requireAdmin();await disconnectGoogleCalendar();revalidatePath("/admin/calendar");redirect("/admin/calendar?google=disconnected")}
