export const GA4_ID = "G-DPY8NZFS7Z";
export const CONSENT_KEY = "vm_cookie_consent";
export const CONSENT_EVENT = "vm-cookie-consent";
// Only public editorial routes; never send queries, hashes or private tokens.
export function analyticsPath(path: string): string | null {
  if (["/", "/about", "/services", "/contact", "/education", "/portfolio", "/instagram", "/cookies", "/privacy-policy"].includes(path)) return path;
  return /^\/(?:portfolio\/(?:project\/)?|destinations\/)[a-z0-9-]+\/?$/.test(path) ? path : null;
}
export function saveCookieConsent(value: "accepted" | "declined") {
  try { localStorage.setItem(CONSENT_KEY, value); } catch { /* Session choice still applies. */ }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
}
