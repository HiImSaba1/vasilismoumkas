import "server-only";
import { z } from "zod";
import type { RowDataPacket } from "mysql2/promise";
import { getDatabase, isDatabaseConfigured } from "@/lib/database";
import { internalLink } from "@/lib/public-page-content";
import {getProjectRedirects} from "@/lib/project-url-history";
export const destinationSlug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).min(2).max(100);
const text = z.string().trim().max(6000);
export const destinationSchema = z.object({
  title: text, intro: text, image: z.string().max(700).refine(value => value === "" || /^\/(?!\/)[^\\\s]+$/.test(value)), imageAlt: text,
  images:z.array(z.object({src:z.string().regex(/^\/(?!\/)[^\\\s]+$/),alt:text,caption:text})).max(20).default([]),
  faq:z.array(z.object({question:text,answer:text,date:text,hidden:z.boolean()})).max(30).default([]),
  sections: z.array(z.object({ heading: text, text })).max(20), projectSlugs: z.array(destinationSlug).max(20),
  buttonLabel: text, buttonHref: internalLink, seoTitle: text, metaDescription: text, published: z.boolean(),
});
export type DestinationContent = z.infer<typeof destinationSchema>;
export const emptyDestination: DestinationContent = { title: "", intro: "", image: "", imageAlt: "", images:[],faq:[], sections: [], projectSlugs: [], buttonLabel: "Inquire Now", buttonHref: "/contact", seoTitle: "", metaDescription: "", published: false };
export const destinationKey = (slug: string) => `destination:${destinationSlug.parse(slug)}`;
export async function resolveDestinationProjectSlugs(slugs:string[]) {
  const aliases=await getProjectRedirects();
  return slugs.map(slug=>aliases.find(rule=>rule.from===`/portfolio/project/${slug}`)?.to.split("/").at(-1)||slug);
}
export async function listDestinations(includeDrafts = false) {
  if (!isDatabaseConfigured()) return [];
  const [rows] = await getDatabase().query<(RowDataPacket & { setting_key: string; value_json: unknown })[]>("SELECT setting_key,value_json FROM site_settings WHERE LEFT(setting_key,12)='destination:' OR LEFT(setting_key,22)='workspace:destination:' ORDER BY setting_key");
  const items = new Map<string, DestinationContent>();
  for (const row of rows) {
    const raw = typeof row.value_json === "string" ? JSON.parse(row.value_json) : row.value_json;
    if (row.setting_key.startsWith("destination:")) items.set(row.setting_key.slice(12), destinationSchema.parse(raw));
    else if (includeDrafts && !items.has(row.setting_key.slice(22))) {
      const draft = (raw as { draft: unknown }).draft;
      if (draft) items.set(row.setting_key.slice(22), { ...destinationSchema.parse(draft), published: false });
    }
  }
  return Array.from(items, ([slug, content]) => ({ slug, content })).filter(row => includeDrafts || row.content.published);
}
export async function getDestination(slug: string) {
  return (await listDestinations(true)).find(item => item.slug === slug)?.content ?? emptyDestination;
}
