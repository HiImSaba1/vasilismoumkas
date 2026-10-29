"use client";
import type { PortfolioEmailImage } from "@/lib/portfolio";
import type { PageFormValue } from "@/lib/public-page-form";
import {LinkedTextField} from "./LinkedTextField";
import { WebsiteImageSelect } from "./WebsiteImageSelect";

export type InternalLinkOption = { href: string; label: string; category?:string };
const input = "w-full border border-ink-black/20 bg-white p-3 text-sm normal-case";
export function ContentFields({ value, onChange, images, links, path = "content", fixedArrayPaths=[] }: {
  value: PageFormValue; onChange: (value: PageFormValue) => void; images: PortfolioEmailImage[]; links: InternalLinkOption[]; path?: string;
  fixedArrayPaths?:string[];
}) {
  const field = path.split(".").at(-1) ?? "";
  const label = field.replace(/([a-z])([A-Z])/g, "$1 $2").replaceAll("_", " ");
  if (typeof value === "boolean") return <label className="flex gap-3 text-sm"><input type="checkbox" checked={value} onChange={event => onChange(event.target.checked)} />Hidden from the public page</label>;
  if (typeof value === "string") {
    if (/image|portrait|biographyImage/i.test(field) && !/alt|caption/i.test(field) || field === "src" || /galleryImages\.\d+$/.test(path)) {
      return <WebsiteImageSelect key={`${path}:${value}`} name={path} label={label} value={value} images={images} onChange={onChange} />;
    }
    if (/href$/i.test(field)) return <label className="grid gap-2 text-xs uppercase">{label}<select className={input} value={value} onChange={event => onChange(event.target.value)}>
      {!links.some(link => link.href === value) && <option value={value}>Current link: {value}</option>}
      {links.map(link => <option key={link.href} value={link.href}>{link.label}</option>)}
    </select></label>;
    if (path==="content.story.title" || (/intro|description|sharedText|quote|text|answer/i.test(path) && !/title|heading|label|alt|image|video|seo/i.test(path))) return <LinkedTextField label={label} value={value} onChange={onChange} links={links}/>;
    return <label className="grid gap-2 text-xs uppercase">{label}<textarea className={input} rows={value.length > 180 ? 5 : 2} maxLength={6000} value={value} onChange={event => onChange(event.target.value)} /></label>;
  }
  if (Array.isArray(value)) {
    const repeatable = !fixedArrayPaths.includes(path) && ["faq", "journey", "galleryImages", "images", "galleryQuotes", "tags", "projectSlugs", "sections", "list"].includes(field);
    const add = () => {
      const template: PageFormValue = field === "faq" || field === "journey" ? { question: "New question", answer: "Add the approved answer.", date: "Details", hidden: true } :
        (field === "galleryImages"||field === "images") ? {src:"",alt:"Describe this photograph",caption:""} : field === "sections" ? { heading: "New section", text: "Add approved content." } : "";
      onChange([...value, template]);
    };
    return <fieldset className="grid gap-4 border border-ink-black/15 p-4"><legend className="px-2 uppercase">{label}</legend>
      {value.map((item, index) => <div key={index} className="grid gap-3 border border-ink-black/10 p-4">
        <div className="flex flex-wrap items-center gap-3 text-xs"><strong>{label} {index + 1}</strong>{repeatable && <>
          <button type="button" disabled={index === 0} className="underline disabled:opacity-30" onClick={() => { const next = [...value]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; onChange(next); }}>Move up</button>
          <button type="button" disabled={index === value.length - 1} className="underline disabled:opacity-30" onClick={() => { const next = [...value]; [next[index + 1], next[index]] = [next[index], next[index + 1]]; onChange(next); }}>Move down</button>
          <button type="button" className="underline" onClick={() => onChange(value.filter((_, i) => i !== index))}>Remove from draft</button>
        </>}</div>
        {field === "projectSlugs" && typeof item === "string" ? <select className={input} value={item} onChange={event => onChange(value.map((entry, i) => i === index ? event.target.value : entry))}><option value="">Choose a real wedding</option>{links.filter(link => link.href.startsWith("/portfolio/project/")&&/^weddings?$/i.test(link.category??"")).map(link => <option key={link.href} value={link.href.split("/").at(-1)}>{link.label}</option>)}</select> :
          <ContentFields value={item} path={`${path}.${index}`} images={images} links={links} fixedArrayPaths={fixedArrayPaths} onChange={next => onChange(value.map((entry, i) => i === index ? next : entry))} />}
      </div>)}
      {repeatable && value.length < 40 && <button type="button" className="w-fit border border-ink-black/20 px-4 py-2 text-xs uppercase" onClick={add}>Add {label}</button>}
      {field === "galleryImages" && <p className="text-xs">Leave empty to preserve the existing random image pool. Choose at least four images to replace it.</p>}
      {field === "galleryQuotes" && <p className="text-xs">Leave empty to preserve the existing quotes and colour accents.</p>}
    </fieldset>;
  }
  return <div className="grid gap-5">{Object.entries(value).map(([key, entry]) => <ContentFields key={key} value={entry} path={`${path}.${key}`} images={images} links={links} fixedArrayPaths={fixedArrayPaths} onChange={next => onChange({ ...value, [key]: next })} />)}</div>;
}
