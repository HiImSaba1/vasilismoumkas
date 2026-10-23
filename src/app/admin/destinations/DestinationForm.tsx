"use client";
import { useActionState, useState } from "react";
import type { DestinationContent } from "@/lib/destinations";
import type { ContentWorkspace } from "@/lib/content-workspace";
import type { PortfolioEmailImage } from "@/lib/portfolio";
import { ContentFields, type InternalLinkOption } from "@/components/admin/ContentFields";
import { saveDestinationAction } from "./actions";
export function DestinationForm({ slug, content, version, work, workspaceVersion, images, links }: { slug: string; content: DestinationContent; version: string; work: ContentWorkspace; workspaceVersion: string; images: PortfolioEmailImage[]; links: InternalLinkOption[] }) {
  const [value, setValue] = useState((work.draft ?? content) as DestinationContent);
  const [state, action, pending] = useActionState(saveDestinationAction, { success: false, message: "" });
  const { published, ...fields } = value;
  return <form action={action} className="grid gap-5" data-admin-locale-isolated="true"><input type="hidden" name="slug" value={slug}/><input type="hidden" name="version" value={version}/><input type="hidden" name="workspaceVersion" value={workspaceVersion}/><input type="hidden" name="contentJson" value={JSON.stringify(value)}/>
    <p className="text-sm">Write distinct approved content. Select real weddings that match this destination; no location association is inferred. Draft preview never publishes. The URL slug is fixed for this page.</p>
    <ContentFields value={fields} onChange={next => setValue({ ...(next as typeof fields), published })} images={images} links={links}/>
    <label className="flex gap-3 text-sm"><input type="checkbox" checked={published} onChange={event => setValue({ ...value, published: event.target.checked })}/>Published after applying reviewed content (uncheck to unpublish)</label>
    <select defaultValue="" className="border p-3" onChange={event => { const revision = work.revisions.find(item => item.id === event.target.value); if (revision) setValue(revision.content as DestinationContent); }}><option value="">Load previous version into draft</option>{work.revisions.map(item => <option key={item.id} value={item.id}>{item.at} · admin</option>)}</select>
    {state.message && <p role="status" className={state.success ? "text-green-800" : "text-red-700"}>{state.message}</p>}
    <div className="flex flex-wrap gap-4"><button disabled={pending} name="mode" value="draft" className="border px-5 py-3">Save draft</button><a target="_blank" href={`/admin/destinations/${slug}/preview`} className="border px-5 py-3">Preview saved draft</a><button disabled={pending} name="mode" value="publish" className="bg-ink-black px-5 py-3 text-white">Apply reviewed content</button></div></form>;
}
