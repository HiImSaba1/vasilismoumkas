import ClientLayout from "@/ClientLayout";
import {getWebsiteSettings} from "@/lib/website-settings";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const websiteSettings=await getWebsiteSettings();
  return <ClientLayout websiteSettings={websiteSettings}>{children}</ClientLayout>;
}
