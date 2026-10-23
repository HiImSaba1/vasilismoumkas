import "server-only";
import { z } from "zod";
import type { Metadata } from "next";
import type { RowDataPacket } from "mysql2/promise";
import { getDatabase, isDatabaseConfigured } from "@/lib/database";
export const SEO_OVERRIDES_KEY = "public_seo_overrides_v1";
export const seoOverrideSchema = z.object({
  seoTitle: z.string().trim().max(160).default(""), metaDescription: z.string().trim().max(500).default(""),
  socialTitle: z.string().trim().max(160).default(""), socialDescription: z.string().trim().max(500).default(""),
  socialImage: z.string().trim().max(700).refine(value => value === "" || /^\/(?!\/)[^\\\s]+$/.test(value)).default(""),
  noindex: z.boolean().default(false),
});
export type SeoOverride = z.infer<typeof seoOverrideSchema>;
export const seoOverridesSchema=z.record(z.string(),seoOverrideSchema);
export async function getSeoOverrides(): Promise<Record<string, SeoOverride>> {
  if (!isDatabaseConfigured()) return {};
  const [rows] = await getDatabase().query<(RowDataPacket & { value_json: unknown })[]>("SELECT value_json FROM site_settings WHERE setting_key=?", [SEO_OVERRIDES_KEY]);
  if (!rows[0]) return {};
  return seoOverridesSchema.parse(typeof rows[0].value_json === "string" ? JSON.parse(rows[0].value_json) : rows[0].value_json);
}
export async function publicMetadata(value: { title: string; description: string; image: string; imageAlt: string }, canonical: string, type: "website" | "article" = "website"): Promise<Metadata> {
  const override = (await getSeoOverrides())[canonical];
  const seoTitle = override?.seoTitle || value.title;
  const metaDescription = override?.metaDescription || value.description;
  const title = override?.socialTitle || seoTitle;
  const description = override?.socialDescription || metaDescription;
  const image = override?.socialImage || value.image;
  return { title: { absolute: seoTitle }, description: metaDescription, alternates: { canonical },
    robots: override?.noindex ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: { title, description, url: canonical, type, images: [{ url: image, alt: value.imageAlt }] },
    twitter: { card: "summary_large_image", title, description, images: [image] } };
}
