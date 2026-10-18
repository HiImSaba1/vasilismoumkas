import type { Project } from "@/app/(site)/data/ProjectsData";
import { savePortfolioAction } from "./actions";
import { PortfolioGalleryInput } from "./PortfolioGalleryInput";
import {PortfolioImageReorder} from "./PortfolioImageReorder";

export function PortfolioForm({ project }: { project?: Project }) {
  return <form action={savePortfolioAction} className="grid gap-5">
    <input type="hidden" name="originalSlug" value={project?.slug ?? ""}/>
    <input type="hidden" name="existingHeader" value={project?.thumbnail ?? ""}/>
    {!project&&<input type="hidden" name="existingPhotos" value="[]"/>}

    <div className="grid gap-4 md:grid-cols-2">
      <Field name="title" label="Project name" value={project?.title}/>
      <Field name="slug" label="Slug" value={project?.slug}/>
      <Field name="client" label="Client / couple" value={project?.client}/>
      <Field name="dateShot" label="Date shot" value={project?.dateShot} type="date"/>
      <Field name="location" label="Location" value={project?.location}/>
      <Field name="category" label="Category" value={project?.category ?? "Wedding"}/>
      <Field name="tags" label="Tags, comma separated" value={project?.tags.join(", ")}/>
    </div>

    <label className="flex items-center gap-3 border border-ink-black/20 bg-white p-4 text-sm uppercase">
      <input name="published" type="checkbox" defaultChecked={project?.published ?? true}/>
      Published on public website and sitemap
    </label>

    <label className="grid gap-2 text-sm  uppercase">Description
      <textarea name="description" required defaultValue={project?.description} rows={7} className="border border-ink-black/20 bg-transparent p-3 normal-case"/>
    </label>

    <fieldset className="grid gap-4 border border-ink-black/15 bg-white p-4 md:grid-cols-2">
      <legend className="px-2 uppercase">Project SEO</legend>
      <Field name="seoTitle" label="SEO title" value={project?.seoTitle}/>
      <Field name="headerImageAlt" label="Header image alt text" value={project?.headerImageAlt ?? `${project?.title ?? "Project"} wedding photography`}/>
      <label className="grid gap-2 text-sm uppercase md:col-span-2">Meta description
        <textarea name="metaDescription" defaultValue={project?.metaDescription ?? ""} rows={3} maxLength={500} className="border border-ink-black/20 bg-transparent p-3 normal-case"/>
      </label>
      <p className="text-xs text-ink-black/55 md:col-span-2">Leave title or description empty to use the project name and story as the public fallback. Changes update public metadata without a deployment.</p>
    </fieldset>

    <label className="grid gap-2 text-sm  uppercase">Header / cinematic image · max 400 KB
      <input name="header" type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="border border-ink-black/20 p-3"/>
    </label>
    <PortfolioGalleryInput/>

    {project && <section className="grid gap-3">
      <div>
        <p className="text-sm  uppercase tracking-[0.14em]">Images currently used</p>
        <p className="mt-1 text-sm  text-ink-black/50">The title image appears first, followed by the project gallery.</p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
        {project.thumbnail && <div className="border-2 border-soft-yellow">
          <div className="relative">
            {/* Admin-only preview deliberately shows the original local asset. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={project.thumbnail} alt={`${project.title} title image`} className="aspect-square w-full object-cover"/>
            <span className="absolute inset-x-0 bottom-0 bg-soft-yellow p-2 text-[12px]  uppercase text-ink-black">Title image</span>
          </div>
          <p className="break-all border-t border-soft-yellow px-2 py-2 text-[10px] leading-snug">{imageTitle(project.thumbnail, `${project.title} · title image`)}</p>
        </div>}
      </div>
      <PortfolioImageReorder photos={project.photoset} title={project.title}/>
    </section>}

    <button className="bg-ink-black px-5 py-4 text-sm  uppercase text-white">Save portfolio project</button>
  </form>;
}

function imageTitle(src: string, fallback: string) {
  const filename = src.split("?")[0]?.split("/").filter(Boolean).at(-1) ?? src;
  const visibleName = (() => { try { return decodeURIComponent(filename); } catch { return filename; } })();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.[a-z0-9]+$/i.test(visibleName) ? fallback : visibleName;
}

function Field({ name, label, value, type = "text" }: { name: string; label: string; value?: string; type?: string }) {
  return <label className="grid gap-2 text-sm  uppercase">{label}
    <input required={name === "title" || name === "slug"} name={name} type={type} defaultValue={value} className={`border border-ink-black/20 bg-transparent p-3 normal-case text-ink-black ${type === "date" ? "admin-lead-date" : ""}`}/>
  </label>;
}
