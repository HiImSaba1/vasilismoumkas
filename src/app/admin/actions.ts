// FILE: src/app/admin/actions.ts
"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { z } from "zod";
import { ADMIN_COOKIE_NAME, ADMIN_SESSION_SECONDS, createAdminSessionToken, credentialsMatch, requireAdmin } from "@/lib/admin-auth";
import { saveOffer, saveTimeline } from "@/lib/crm-records";
import { revalidateAdminWorkflow } from "@/lib/admin-workflow-revalidation";

const slugSchema = z.string().trim().min(1).max(180).regex(/^[\p{L}\p{N}-]+$/u);
const payloadSchema = z.record(z.string(), z.unknown());

// --- LOGIN ACTION ---
export async function loginAction(_prevState: unknown, formData: FormData) {
  const adminName = String(formData.get("adminName") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (credentialsMatch(adminName, password)) {
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_COOKIE_NAME, createAdminSessionToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: ADMIN_SESSION_SECONDS,
      path: "/",
    });
    redirect("/admin/overview");
  } else {
    return { error: "Invalid credentials. Please try again." };
  }
}

// --- LOGOUT ACTION ---
export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  redirect("/admin");
}

// --- SAVE OFFER ACTION ---
export async function saveOfferAction(slug: string, data: unknown) {
  try {
    await requireAdmin();
    await saveOffer(slugSchema.parse(decodeURIComponent(slug)), payloadSchema.parse(data));
    return { success: true };
  } catch (error) {
    console.error("Server Action Error Saving Offer:", error);
    return { success: false, error: "Failed to save offer" };
  }
}

// --- SAVE TIMELINE ACTION ---
export async function saveTimelineAction(slug: string, data: unknown) {
  try {
    await requireAdmin();
    await saveTimeline(slugSchema.parse(decodeURIComponent(slug)), payloadSchema.parse(data));
    revalidateAdminWorkflow();
    return { success: true };
  } catch (error) {
    console.error("Server Action Error Saving Timeline:", error);
    return { success: false, error: "Failed to save timeline" };
  }
}
