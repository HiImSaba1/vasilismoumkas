import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { saveOffer } from "@/lib/crm-records";

const requestSchema = z.object({
  slug: z.string().min(1).max(180).transform((value) => decodeURIComponent(value)).pipe(z.string().regex(/^[\p{L}\p{N}-]+$/u)),
  data: z.record(z.string(), z.unknown()),
});

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const { slug, data } = requestSchema.parse(await request.json());
    await saveOffer(slug, data);
    return NextResponse.json({ success: true });
  } catch (error) {
    const unauthorized = error instanceof Error && error.message === "Unauthorized";
    return NextResponse.json({ success: false, error: unauthorized ? "Unauthorized" : "Invalid offer data" }, { status: unauthorized ? 401 : 400 });
  }
}
