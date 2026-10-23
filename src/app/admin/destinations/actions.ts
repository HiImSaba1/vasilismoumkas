"use server";
import { requireAdmin } from "@/lib/admin-auth";
import { destinationSchema, destinationSlug, destinationKey, emptyDestination } from "@/lib/destinations";
import { writeContentWorkspace } from "@/lib/content-workspace";
import { listPortfolioProjects } from "@/lib/portfolio";
import { revalidatePath } from "next/cache";
import { z } from "zod";
export async function saveDestinationAction(_state: { success: boolean; message: string }, form: FormData) {
  await requireAdmin();
  try {
    const slug = destinationSlug.parse(form.get("slug"));
    const content = destinationSchema.parse(JSON.parse(z.string().max(150000).parse(form.get("contentJson"))));
    const mode = z.enum(["draft", "publish"]).parse(form.get("mode"));
    if (mode === "publish" && content.published) {
      if (!content.title || !content.intro || !content.image || !content.imageAlt || !content.seoTitle || content.metaDescription.length < 40 || !content.projectSlugs.length || content.sections.some(section => !section.heading || !section.text) || content.images.some(image=>!image.alt) || content.faq.some(item=>!item.hidden&&(!item.question||!item.answer))) throw new Error("Before publishing add approved title, introduction, image/alt, SEO, complete sections and at least one real wedding.");
      const projects = await listPortfolioProjects();
      if (content.projectSlugs.some(slug => !projects.some(project => project.slug === slug && /^weddings?$/i.test(project.category)))) throw new Error("Related stories must be current published wedding projects. Choose their actual location carefully.");
      if (new Set(content.projectSlugs).size !== content.projectSlugs.length) throw new Error("Choose each related wedding once.");
    }
    const hash = z.string().regex(/^[a-f0-9]{64}$/);
    await writeContentWorkspace({ key: destinationKey(slug), content, expectedVersion: hash.parse(form.get("version")), expectedWorkspaceVersion: hash.parse(form.get("workspaceVersion")), mode, fallback: emptyDestination });
    revalidatePath("/admin/destinations"); revalidatePath(`/admin/destinations/${slug}`); revalidatePath(`/admin/destinations/${slug}/preview`);
    if (mode === "publish") { revalidatePath(`/destinations/${slug}`); revalidatePath("/sitemap.xml"); }
    return { success: true, message: mode === "draft" ? "Draft saved; it is private. Open the saved preview." : content.published ? "Destination published; previous content retained for restore." : "Destination unpublished and removed from sitemap; content retained." };
  } catch (error) { return { success: false, message: error instanceof Error ? error.message : "Unable to save destination." }; }
}
