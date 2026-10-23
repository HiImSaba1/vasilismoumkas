import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { destinationSlug, destinationKey, getDestination, destinationSchema,resolveDestinationProjectSlugs } from "@/lib/destinations";
import { getContentWorkspace } from "@/lib/content-workspace";
import { listPortfolioProjects } from "@/lib/portfolio";
import { DestinationPage } from "@/components/sections/DestinationPage";
import ClientLayout from "@/ClientLayout";
import { getWebsiteSettings } from "@/lib/website-settings";
import { getSeoSettings } from "@/lib/seo-settings";
export const metadata = { title: "Private destination preview", robots: { index: false, follow: false } };
export default async function Preview({ params }: { params: Promise<{ slug: string }> }) {
  await requireAdmin(); const result = destinationSlug.safeParse((await params).slug); if (!result.success) notFound(); const slug = result.data;
  const [work, website, seo, projects] = await Promise.all([getContentWorkspace(destinationKey(slug)), getWebsiteSettings(), getSeoSettings(), listPortfolioProjects()]);
  const content = destinationSchema.parse(work.workspace.draft ?? await getDestination(slug));
  const slugs=await resolveDestinationProjectSlugs(content.projectSlugs);
  return <ClientLayout previewPublic websiteSettings={website} businessSettings={seo.business}><div className="fixed left-0 top-0 z-[9999] w-full bg-soft-yellow p-2 text-center text-xs">PRIVATE DESTINATION PREVIEW · <a href={`/admin/destinations/${slug}`} className="underline">Back to editor</a></div><DestinationPage content={content} projects={slugs.flatMap(slug => projects.filter(project => project.slug === slug))}/></ClientLayout>;
}
