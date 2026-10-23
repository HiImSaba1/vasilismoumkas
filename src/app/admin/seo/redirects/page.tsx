import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { redirectSchema, REDIRECTS_KEY } from "@/lib/public-redirects";
import { getContentWorkspace, getPublishedContentSnapshot } from "@/lib/content-workspace";
import { listInternalLinks } from "@/lib/internal-links";
import { RedirectForm } from "./RedirectForm";
export default async function Redirects() {
  await requireAdmin();
  const [snapshot,links,work] = await Promise.all([getPublishedContentSnapshot(REDIRECTS_KEY,[]),listInternalLinks(),getContentWorkspace(REDIRECTS_KEY)]);
  const rules=redirectSchema.parse(snapshot.content);
  return <main className="grid gap-5 p-6"><Link href="/admin/seo/coverage" className="underline">Back to SEO coverage</Link><h1 className="text-3xl">Retired public URL redirects</h1><p className="text-sm">Permanent redirects for optional /legacy/... URLs only. Actual project renames create automatic 301 redirects at their exact original URLs. Static page URLs remain fixed. Existing pages keep their routes. Destinations must be current public pages; loops, chains and private paths are blocked. Review carefully because browsers can cache permanent redirects.</p><RedirectForm rules={rules} links={links} version={snapshot.version} workspaceVersion={work.version}/></main>;
}
