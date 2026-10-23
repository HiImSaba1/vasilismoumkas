"use server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { redirectSchema, REDIRECTS_KEY } from "@/lib/public-redirects";
import { listInternalLinks } from "@/lib/internal-links";
import { writeContentWorkspace } from "@/lib/content-workspace";
import { revalidatePath } from "next/cache";
export async function saveRedirectsAction(_state: { success: boolean; message: string }, form: FormData) {
  await requireAdmin();
  try {
    const from = form.getAll("from"), to = form.getAll("to");
    if (from.length !== to.length) throw new Error("Reload the redirect form.");
    const rules = redirectSchema.parse(from.map((value,index) => ({ from: value, to: to[index] })).filter(item => item.from !== ""));
    if(rules.some(rule=>/^\/(portfolio|destinations)(\/|$)/.test(rule.from)))throw new Error("Project URL redirects are created automatically when renaming a project in Portfolio.");
    const links = await listInternalLinks();
    if (rules.some(rule => links.some(link => link.href === rule.from) || !links.some(link => link.href === rule.to))) throw new Error("Source must be a retired path; destination must be a listed current public page.");
    const hash = z.string().regex(/^[a-f0-9]{64}$/);
    await writeContentWorkspace({ key: REDIRECTS_KEY, content: rules, expectedVersion: hash.parse(form.get("version")), expectedWorkspaceVersion: hash.parse(form.get("workspaceVersion")), mode: "publish", fallback: [] });
    revalidatePath("/admin/seo/redirects");
    for (const rule of rules) revalidatePath(rule.from);
    return { success: true, message: "Retired URL redirects saved. Existing routes are never intercepted. Unknown URLs remain 404." };
  } catch (error) { return { success: false, message: error instanceof Error ? error.message : "Unable to save redirects." }; }
}
