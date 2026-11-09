export const GA4_ID = "G-DPY8NZFS7Z";
export const CONSENT_KEY = "vm_cookie_consent";
export const CONSENT_EVENT = "vm-cookie-consent";
// Only public editorial routes; never send queries, hashes or private tokens.
export function analyticsPath(path: string): string | null {
  if (["/", "/about", "/services", "/contact", "/inquiry", "/education", "/portfolio", "/instagram", "/cookies", "/privacy-policy"].includes(path)) return path;
  return /^\/(?:portfolio\/(?:project\/)?|destinations\/)[a-z0-9-]+\/?$/.test(path) ? path : null;
}
export function saveCookieConsent(value: "accepted" | "declined") {
  try { localStorage.setItem(CONSENT_KEY, value); } catch { /* Session choice still applies. */ }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
}

const trackedInquiries = new Set<string>();
export function trackInquiry(id: string | undefined, type: "wedding" | "baptism" | "education") {
  try {
    if (localStorage.getItem(CONSENT_KEY) !== "accepted" || location.hostname !== "vasilismoumkas.com") return;
    const target = window as Window & { gtag?: (...args: unknown[]) => void };
    if (!id || !target.gtag || trackedInquiries.has(id)) return;
    trackedInquiries.add(id);
    target.gtag("event", "generate_lead", { send_to: GA4_ID, inquiry_type: type, page_location: location.origin + location.pathname, page_referrer: "" });
  } catch {
    // Analytics must never turn a saved inquiry into a form error.
  }
}
