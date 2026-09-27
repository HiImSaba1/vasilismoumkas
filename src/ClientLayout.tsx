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
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  /** * Check if the current route is a "special" page that should 
   * not display the default Navbar and Footer.
   */
  const isSpecialPage = useMemo(() => {
    return (
      pathname?.startsWith("/instagram") ||
      pathname?.startsWith("/admin") ||
      pathname?.startsWith("/offer")
    );
  }, [pathname]);

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
    <InitialLoadProvider>
        <PageTransitionProvider>
          <ReactLenis root options={lenisOptions}>
            <ScrollReset />
            
            {/* Navbar is hidden on Instagram, Admin, and Offer pages */}
            {!isSpecialPage && <Navbar />}
            
            <main className="relative isolate">
              {children}
            </main>
            
            {/* Footer is hidden on Instagram, Admin, and Offer pages */}
            {!isSpecialPage && <Footer />}
            
            <CookieBanner />
          </ReactLenis>
        </PageTransitionProvider>
    </InitialLoadProvider>
  );
}