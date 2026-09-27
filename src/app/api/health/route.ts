import { NextResponse } from "next/server";
import { databaseStatus, isDatabaseConfigured } from "@/lib/database";

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ ok: false, database: "not-configured" }, { status: 503 });
  }
  const status = await databaseStatus();
  return NextResponse.json(status, { status: status.ok ? 200 : 503 });
}
