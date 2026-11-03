"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { analyticsPath, CONSENT_EVENT, CONSENT_KEY, GA4_ID } from "@/lib/analytics-consent";

type AnalyticsWindow = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void; [key: `ga-disable-${string}`]: boolean };
let configured = false;
let lastPath: string | null = null;
let previousLocation = "";

export default function GoogleAnalytics() {
  const pathname = usePathname();
  useEffect(() => {
    const target = window as unknown as AnalyticsWindow;
    const path = analyticsPath(pathname);
    let consent = "declined";
    try { consent = localStorage.getItem(CONSENT_KEY) || "declined"; } catch { /* Fail closed. */ }
    const update = () => {
      const enabled = consent === "accepted" && path !== null && location.hostname === "vasilismoumkas.com";
      target[`ga-disable-${GA4_ID}`] = !enabled;
      if (!enabled) { lastPath = null; previousLocation = ""; return; }
      target.dataLayer ||= [];
      // Google tag expects the arguments-object queue format.
      // eslint-disable-next-line prefer-rest-params
      target.gtag ||= function () { target.dataLayer!.push(arguments); };
      if (!configured) {
        target.gtag("consent", "default", { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
        target.gtag("consent", "update", { analytics_storage: "granted" });
        target.gtag("js", new Date());
        target.gtag("config", GA4_ID, { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false, page_location: location.origin + path, page_referrer: "" });
        configured = true;
        const script = document.createElement("script");
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
        script.id = "vm-ga4";
        document.head.appendChild(script);
      }
      if (lastPath !== path) {
        const pageLocation = location.origin + path;
        target.gtag("event", "page_view", { send_to: GA4_ID, page_location: pageLocation, page_title: document.title, page_referrer: previousLocation });
        lastPath = path;
        previousLocation = pageLocation;
      }
    };
    const onConsent = (event: Event) => { consent = (event as CustomEvent<string>).detail; update(); };
    const onStorage = (event: StorageEvent) => { if (event.key === CONSENT_KEY) { consent = event.newValue || "declined"; update(); } };
    window.addEventListener(CONSENT_EVENT, onConsent);
    window.addEventListener("storage", onStorage);
    update();
    return () => { window.removeEventListener(CONSENT_EVENT, onConsent); window.removeEventListener("storage", onStorage); target[`ga-disable-${GA4_ID}`] = true; };
  }, [pathname]);
  return null;
}
