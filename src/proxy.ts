import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {getProjectRedirects} from "@/lib/project-url-history";

const COOKIE_NAME = "moumkas_admin_session";

async function validSession(token?: string) {
  const secret = process.env.ADMIN_SESSION_SECRET ?? (process.env.NODE_ENV === "production" ? undefined : process.env.ADMIN_PASSWORD);
  if (!token || !secret || secret.length < 32) return false;
  const [expiresAt, receivedSignature, extra] = token.split(".");
  if (!expiresAt || !receivedSignature || extra || !/^\d+$/.test(expiresAt)) return false;
  if (Number(expiresAt) <= Math.floor(Date.now() / 1000)) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`moumkas-admin:${expiresAt}`));
  const expected = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  if (expected.length !== receivedSignature.length) return false;
  let difference = 0;
  for (let index = 0; index < expected.length; index += 1) difference |= expected.charCodeAt(index) ^ receivedSignature.charCodeAt(index);
  return difference === 0;
}

export async function proxy(request: NextRequest) {
  const session = request.cookies.get(COOKIE_NAME)?.value;
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/portfolio/project/")) {
    const rule = (await getProjectRedirects()).find(item => item.from === pathname);
    return rule ? NextResponse.redirect(new URL(rule.to, request.url), 301) : NextResponse.next();
  }
  if (!pathname.startsWith("/admin")) {
    const response = NextResponse.next();
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    return response;
  }
  const authenticated = await validSession(session);

  // 1. Protect the Dashboard
  if (pathname !== "/admin" && pathname.startsWith("/admin")) {
    if (!authenticated) {
      // Redirect to login if no valid session exists
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  // 2. Prevent logged-in users from seeing the login page again
  if (pathname === "/admin" && authenticated) {
    return NextResponse.redirect(new URL('/admin/overview', request.url));
  }

  const response=NextResponse.next();
  response.headers.set("X-Robots-Tag","noindex, nofollow, noarchive");
  return response;
}

// The matcher stays the same to tell Next.js which routes to watch
export const config = {
  matcher: ["/admin/:path*", "/offer/:path*", "/portal/:path*", "/timeline/:path*", "/questionnaire/:path*", "/portfolio/project/:slug"],
};
