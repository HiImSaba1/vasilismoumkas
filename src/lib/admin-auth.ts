import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "moumkas_admin_session";
export const ADMIN_SESSION_SECONDS = 60 * 60 * 12;

function requiredSecret() {
  const value = process.env.ADMIN_SESSION_SECRET ?? (process.env.NODE_ENV === "production" ? undefined : process.env.ADMIN_PASSWORD);
  if (!value || value.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET must contain at least 32 characters.");
  }
  return value;
}

function safeEqual(received: string, expected: string) {
  const left = Buffer.from(received);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

function signature(expiresAt: string) {
  return createHmac("sha256", requiredSecret())
    .update(`moumkas-admin:${expiresAt}`)
    .digest("base64url");
}

export function createAdminSessionToken() {
  const expiresAt = String(Math.floor(Date.now() / 1000) + ADMIN_SESSION_SECONDS);
  return `${expiresAt}.${signature(expiresAt)}`;
}

export function verifyAdminSessionToken(token?: string) {
  if (!token) return false;
  const [expiresAt, receivedSignature, extra] = token.split(".");
  if (!expiresAt || !receivedSignature || extra) return false;
  if (!/^\d+$/.test(expiresAt) || Number(expiresAt) <= Math.floor(Date.now() / 1000)) return false;
  try {
    return safeEqual(receivedSignature, signature(expiresAt));
  } catch {
    return false;
  }
}

export function credentialsMatch(username: string, password: string) {
  const expectedUsername = process.env.ADMIN_USERNAME ?? "VASILIS";
  const expectedPassword = process.env.ADMIN_PASSWORD ?? "";
  return Boolean(expectedPassword) && safeEqual(username.toLocaleUpperCase("en-US"), expectedUsername.toLocaleUpperCase("en-US")) && safeEqual(password, expectedPassword);
}

export async function isAdminAuthenticated() {
  const token = (await cookies()).get(ADMIN_COOKIE_NAME)?.value;
  return verifyAdminSessionToken(token);
}

export async function requireAdmin() {
  if (!(await isAdminAuthenticated())) throw new Error("Unauthorized");
}
