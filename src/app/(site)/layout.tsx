import ClientLayout from "@/ClientLayout";
import {getHomepageSettings} from "@/lib/homepage-settings";
import {getWebsiteSettings} from "@/lib/website-settings";
import {getSeoSettings} from "@/lib/seo-settings";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const[websiteSettings,seoSettings,home]=await Promise.all([getWebsiteSettings(),getSeoSettings(),getHomepageSettings()]);
  return <ClientLayout homeFooterLines={home.footerCtaLines} websiteSettings={websiteSettings} businessSettings={seoSettings.business}>{children}</ClientLayout>;
}
