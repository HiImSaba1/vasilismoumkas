"use server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { getSeoCoverage } from "@/lib/seo-coverage";
import { getSeoOverrides, seoOverrideSchema, SEO_OVERRIDES_KEY } from "@/lib/seo-overrides";
import { writeContentWorkspace } from "@/lib/content-workspace";
import { revalidatePath } from "next/cache";
export async function saveSocialSeoAction(_state: { success: boolean; message: string }, form: FormData) {
  await requireAdmin();
  try {
    const path = z.string().max(700).parse(form.get("path"));
    if (!(await getSeoCoverage()).some(page => page.path === path)) throw new Error("Choose a current public page or project.");
    const overrides = await getSeoOverrides();
    const next = seoOverrideSchema.parse({ seoTitle: form.get("seoTitle"), metaDescription: form.get("metaDescription"), socialTitle: form.get("socialTitle"), socialDescription: form.get("socialDescription"), socialImage: form.get("socialImage"), noindex: form.get("noindex") === "on" });
    await writeContentWorkspace({ key: SEO_OVERRIDES_KEY, content: { ...overrides, [path]: next }, expectedVersion: z.string().regex(/^[a-f0-9]{64}$/).parse(form.get("version")), expectedWorkspaceVersion: z.string().regex(/^[a-f0-9]{64}$/).parse(form.get("workspaceVersion")), mode: "publish", fallback: {} });
    revalidatePath(path); revalidatePath("/sitemap.xml"); revalidatePath("/admin/seo/coverage");
    return { success: true, message: "Social settings saved. Blank fields inherit the page SEO. Canonical remains the public page URL." };
  } catch (error) { return { success: false, message: error instanceof Error ? error.message : "Unable to save SEO." }; }
}
