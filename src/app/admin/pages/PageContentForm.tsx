"use client";
import { useActionState, useState } from "react";
import type { PortfolioEmailImage } from "@/lib/portfolio";
import type { ContentWorkspace } from "@/lib/content-workspace";
import type { PageFormValue } from "@/lib/public-page-form";
import { ContentFields, type InternalLinkOption } from "@/components/admin/ContentFields";
import { savePageContentAction } from "./actions";

export function PageContentForm({ page, content, version, workspace, workspaceVersion, images, links }: {
  page: string; content: PageFormValue; version: string; workspace: ContentWorkspace; workspaceVersion: string;
  images: PortfolioEmailImage[]; links: InternalLinkOption[];
}) {
  const [value, setValue] = useState<PageFormValue>((workspace.draft ?? content) as PageFormValue);
  const [state, action, pending] = useActionState(savePageContentAction, { success: false, message: "" });
  return <form action={action} className="mt-7 grid gap-5 border border-ink-black/15 bg-white p-5">
    <input type="hidden" name="page" value={page} /><input type="hidden" name="version" value={version} />
    <input type="hidden" name="workspaceVersion" value={workspaceVersion} /><input type="hidden" name="contentJson" value={JSON.stringify(value)} />
    <p className="text-sm text-ink-black/60">Editing a draft. Save draft before preview. Publish applies reviewed content to this public page. Offers, emails and booking documents are separate. The last 12 published versions can be restored below.</p>
    {workspace.updatedAt && <p className="text-xs">Last content action: {workspace.updatedAt} · admin</p>}
    {page === "contact" && <p className="text-sm">An empty image uses the shared Contact photograph from Website. A selected image overrides it for Contact only.</p>}
    {page === "education" && <p className="text-sm">Education content is separate from SEO settings. Existing SEO title and description are retained. The four sections and four-word animation sequences keep their existing layout. Save a draft before previewing.</p>}
    {page === "home" && <p className="text-sm">SEO title, description and image are shared with the SEO editor. Blank lines in story text separate paragraphs. Fixed card counts protect the existing animation layout. Footer CTA lines here affect Home only; the footer image pool is shared.</p>}
    <div data-admin-locale-isolated="true"><ContentFields fixedArrayPaths={page==="education"?["content.sections","content.hero.images"]:[]} value={value} onChange={setValue} images={images} links={links} /></div>
    <label className="grid gap-2 text-xs uppercase">Load a previous public version into this draft<select defaultValue="" className="border p-3 text-sm" onChange={event => { const revision = workspace.revisions.find(item => item.id === event.target.value); if (revision) setValue(revision.content as PageFormValue); }}><option value="">Choose a version</option>{workspace.revisions.map(item => <option key={item.id} value={item.id}>{item.at} · {item.actor}</option>)}</select></label>
    {state.message && <p role="status" className={`text-sm ${state.success ? "text-green-800" : "text-red-700"}`}>{state.message}</p>}
    <div className="flex flex-wrap gap-3">
      <button name="mode" value="draft" disabled={pending} className="border border-ink-black px-5 py-3 text-xs uppercase disabled:opacity-50">Save draft</button>
      <a href={`/admin/pages/${page}/preview`} target="_blank" className="border border-ink-black px-5 py-3 text-xs uppercase">Preview saved draft</a>
      <button name="mode" value="publish" disabled={pending} className="bg-ink-black px-6 py-3 text-xs uppercase text-white disabled:opacity-50">{pending ? "Saving…" : "Publish / restore reviewed content"}</button>
    </div>
  </form>;
}
