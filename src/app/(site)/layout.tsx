import ClientLayout from "@/ClientLayout";
import {getHomepageSettings} from "@/lib/homepage-settings";
import {getWebsiteSettings} from "@/lib/website-settings";
import {getSeoSettings} from "@/lib/seo-settings";
import {getPublicPageSettings} from "@/lib/public-page-settings";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const[websiteSettings,seoSettings,home,about]=await Promise.all([getWebsiteSettings(),getSeoSettings(),getHomepageSettings(),getPublicPageSettings("about")]);
  return <ClientLayout aboutFooterLines={about.content.footerCtaLines} homeFooterLines={home.footerCtaLines} websiteSettings={websiteSettings} businessSettings={seoSettings.business}>{children}</ClientLayout>;
}
