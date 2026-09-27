import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { googleAuthorizationUrl } from "@/lib/google-calendar";

export async function GET(){await requireAdmin();const state=randomBytes(32).toString("base64url");(await cookies()).set("moumkas_google_calendar_state",state,{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",path:"/api/admin/google-calendar",maxAge:600});return NextResponse.redirect(googleAuthorizationUrl(state))}
