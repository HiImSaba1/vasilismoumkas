"use client";

import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { ReactLenis, useLenis } from "lenis/react";
import { InitialLoadProvider } from "@/providers/InitialLoadContext";
import PageTransitionProvider from "@/providers/PageTransitionProvider";
// import PageLoader from "@/components/core/Pageloader";
import Navbar from "@/components/core/Navbar";
import Footer from "@/components/core/Footer";
import CookieBanner from "./components/core/CookieBanner";
import {WebsiteSettingsProvider} from "@/providers/WebsiteSettingsContext";
import type {WebsiteSettings} from "@/lib/website-settings";
import type {SeoSettings} from "@/lib/seo-settings";

function ScrollReset() {
  const pathname = usePathname();
  const lenis = useLenis();

  useEffect(() => {
    if (lenis) {
      const timeout = setTimeout(() => {
        lenis.scrollTo(0, { immediate: true });
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [pathname, lenis]);

  return null;
}

export default function ClientLayout({
  children,websiteSettings,businessSettings,previewPublic=false,homeFooterLines,
}: {
  children: React.ReactNode;
  websiteSettings:WebsiteSettings;
  previewPublic?:boolean;
  homeFooterLines?:string[];
  businessSettings:SeoSettings["business"];
}) {
  const pathname = usePathname();

  /** * Check if the current route is a "special" page that should 
   * not display the default Navbar and Footer.
   */
  const isSpecialPage = useMemo(() => {
    return (
      pathname?.startsWith("/instagram") ||
      (pathname?.startsWith("/admin") && !previewPublic) ||
      pathname?.startsWith("/offer")
    );
  }, [pathname,previewPublic]);

  const lenisOptions = useMemo(
    () => ({
      lerp: 0.12,
      wheelMultiplier: 0.9,
      smoothWheel: true,
      autoRaf: true,
    }),
    [],
  );

  return (
    <WebsiteSettingsProvider value={websiteSettings}><InitialLoadProvider>
        <PageTransitionProvider>
          <ReactLenis root options={lenisOptions}>
            <ScrollReset />
            
            {/* Navbar is hidden on Instagram, Admin, and Offer pages */}
            {!isSpecialPage && <Navbar business={businessSettings}/>}
            
            <main className="relative isolate">
              {children}
            </main>
            
            {/* Footer is hidden on Instagram, Admin, and Offer pages */}
            {!isSpecialPage && <Footer business={businessSettings} homeTitleLines={homeFooterLines} homePreview={previewPublic&&pathname==="/admin/pages/home/preview"}/>}
            
            <CookieBanner />
          </ReactLenis>
        </PageTransitionProvider>
    </InitialLoadProvider></WebsiteSettingsProvider>
  );
}
