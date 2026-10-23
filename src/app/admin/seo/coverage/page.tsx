import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { getSeoCoverage } from "@/lib/seo-coverage";
import { SEO_OVERRIDES_KEY,seoOverridesSchema } from "@/lib/seo-overrides";
import { getContentWorkspace, getPublishedContentSnapshot } from "@/lib/content-workspace";
import { listWebsiteImages } from "@/lib/website-media";
import { SocialForm } from "./SocialForm";
export default async function CoveragePage() {
  await requireAdmin();
  const [snapshot, work, images] = await Promise.all([getPublishedContentSnapshot(SEO_OVERRIDES_KEY,{}), getContentWorkspace(SEO_OVERRIDES_KEY), listWebsiteImages()]);
  const pages=await getSeoCoverage(seoOverridesSchema.parse(snapshot.content));
  return <main className="grid gap-5 p-6"><Link href="/admin/seo" className="underline">Back to SEO</Link><h1 className="text-3xl">SEO coverage and social previews</h1><p className="text-sm">Canonical URLs are fixed to each actual public route. Private CRM, offers, questionnaires and portals are excluded by noindex headers and robots rules. Heading structure is checked by the owner-run browser audit. Draft projects and noindex pages stay outside the sitemap.</p><Link href="/admin/seo/redirects" className="underline">Manage retired page redirects</Link>{pages.map(page => <SocialForm key={page.path} page={page} version={snapshot.version} workspaceVersion={work.version} images={images}/>)}</main>;
}
