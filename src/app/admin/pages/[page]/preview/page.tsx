import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { publicPageSchemas } from "@/lib/public-page-content";
import { getPublicPageSettings, publicPageSettingKey } from "@/lib/public-page-settings";
import { getHomepageSettings, homepageSettingsSchema, HOMEPAGE_SETTINGS_KEY } from "@/lib/homepage-settings";
import { getContentWorkspace } from "@/lib/content-workspace";
import { ManagedHome } from "@/components/sections/ManagedHome";
import { ManagedAbout, ManagedServices } from "@/components/sections/ManagedPages";
import ContactPage from "@/app/(site)/contact/ContactPageClient";
import ClientLayout from "@/ClientLayout";
import { getWebsiteSettings } from "@/lib/website-settings";
import { getSeoSettings } from "@/lib/seo-settings";
export const metadata: Metadata = { title: "Private content preview", robots: { index: false, follow: false } };
export default async function Preview({ params }: { params: Promise<{ page: string }> }) {
  await requireAdmin();
  const { page } = await params;
  if (page !== "home" && page !== "about" && page !== "services" && page !== "contact") notFound();
  const [work, website, seo] = await Promise.all([getContentWorkspace(page === "home" ? HOMEPAGE_SETTINGS_KEY : publicPageSettingKey(page)), getWebsiteSettings(), getSeoSettings()]);
  const raw = work.workspace.draft ?? (page === "home" ? await getHomepageSettings() : (await getPublicPageSettings(page)).content);
  const body = page === "home" ? <ManagedHome settings={homepageSettingsSchema.parse(raw)}/> : page === "about" ? <ManagedAbout content={publicPageSchemas.about.parse(raw)}/> : page === "services" ? <ManagedServices content={publicPageSchemas.services.parse(raw)}/> : <ContactPage content={publicPageSchemas.contact.parse(raw)} previewOnly/>;
  return <ClientLayout homeFooterLines={page==="home"?homepageSettingsSchema.parse(raw).footerCtaLines:undefined} previewPublic websiteSettings={website} businessSettings={seo.business}><div className="fixed left-0 top-0 z-[9999] w-full bg-soft-yellow px-4 py-2 text-center text-xs text-ink-black">PRIVATE PREVIEW · {work.workspace.draft ? "Saved draft" : "Current public version"} · Contact submissions are disabled · <a href={`/admin/pages/${page}`} className="underline">Back to editor</a></div>{body}</ClientLayout>;
}
