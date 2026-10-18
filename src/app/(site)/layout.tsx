import ClientLayout from "@/ClientLayout";
import {getWebsiteSettings} from "@/lib/website-settings";
import {getSeoSettings} from "@/lib/seo-settings";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const[websiteSettings,seoSettings]=await Promise.all([getWebsiteSettings(),getSeoSettings()]);
  return <ClientLayout websiteSettings={websiteSettings} businessSettings={seoSettings.business}>{children}</ClientLayout>;
}
