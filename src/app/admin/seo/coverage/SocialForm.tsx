"use client";
import { useActionState, useState } from "react";
import type { SeoOverride } from "@/lib/seo-overrides";
import type { PortfolioEmailImage } from "@/lib/portfolio";
import SeoImage from "@/components/ui/SeoImage";
import { WebsiteImageSelect } from "@/components/admin/WebsiteImageSelect";
import { saveSocialSeoAction } from "./actions";
export function SocialForm({ page, version, workspaceVersion, images }: { page: { path: string; title: string; description: string; image: string; published: boolean; fallback: boolean; override: SeoOverride }; version: string; workspaceVersion: string; images: PortfolioEmailImage[] }) {
  const [seoTitle,setSeoTitle]=useState(page.override.seoTitle);
  const [metaDescription,setMetaDescription]=useState(page.override.metaDescription);
  const [title, setTitle] = useState(page.override.socialTitle);
  const [description, setDescription] = useState(page.override.socialDescription);
  const [image, setImage] = useState(page.override.socialImage);
  const [state, action, pending] = useActionState(saveSocialSeoAction, { success: false, message: "" });
  return <details className="border bg-white p-5"><summary className="cursor-pointer text-sm">{page.path} · {page.published ? "Published" : "Draft"} · {page.override.seoTitle||page.override.metaDescription?"Custom SEO override":page.fallback?"Some SEO values use defaults":"Custom page SEO"} · {page.override.noindex ? "NOINDEX" : "Indexable"}</summary>
    <form action={action} className="mt-5 grid gap-4" data-admin-locale-isolated="true"><input type="hidden" name="path" value={page.path}/><input type="hidden" name="version" value={version}/><input type="hidden" name="workspaceVersion" value={workspaceVersion}/>
      <p className="text-xs">Canonical: https://vasilismoumkas.com{page.path} · SEO overrides below take priority over the existing SEO editor. Blank fields inherit the existing values. Social fields inherit the effective SEO values.</p>
      <label className="grid gap-2 text-xs">SEO title override (empty inherits existing SEO editor)<input className="border p-3 text-sm" name="seoTitle" maxLength={160} value={seoTitle} onChange={event=>setSeoTitle(event.target.value)}/></label>
      <label className="grid gap-2 text-xs">Meta description override<textarea className="border p-3 text-sm" name="metaDescription" maxLength={500} value={metaDescription} onChange={event=>setMetaDescription(event.target.value)}/></label>
      <label className="grid gap-2 text-xs">Independent social title<input className="border p-3 text-sm" name="socialTitle" value={title} maxLength={160} onChange={event => setTitle(event.target.value)}/></label>
      <label className="grid gap-2 text-xs">Independent social description<textarea className="border p-3 text-sm" name="socialDescription" value={description} maxLength={500} onChange={event => setDescription(event.target.value)}/></label>
      <WebsiteImageSelect key={image} name="socialImage" label="Social image override (empty uses page image)" value={image} images={images} onChange={setImage}/><button type="button" className="w-fit text-xs underline" onClick={() => setImage("")}>Use page image</button>
      <label className="flex gap-3 text-sm"><input type="checkbox" name="noindex" defaultChecked={page.override.noindex}/>Exclude from indexing and sitemap</label>
      <div className="border p-4"><p className="text-xs">SOCIAL PREVIEW · {title ? "Custom title" : "Default title"} · {description ? "Custom description" : "Default description"}</p>{(image||page.image)&&<div className="relative my-3 aspect-[1.91] max-w-lg"><SeoImage src={image||page.image} alt="" fill sizes="512px" className="object-cover"/></div>}<strong>{title || seoTitle || page.title}</strong><p className="text-sm">{description || metaDescription || page.description}</p><p className="break-all text-xs">Image: {image || page.image}</p></div>
      {state.message && <p role="status" className={state.success ? "text-green-800" : "text-red-700"}>{state.message}</p>}<button disabled={pending} className="w-fit bg-ink-black px-5 py-3 text-xs text-white">Save social SEO</button>
    </form></details>;
}
