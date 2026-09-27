import { createHmac } from "node:crypto";
import { expect, test } from "@playwright/test";

const sessionSecret = (() => {
  const value = process.env.ADMIN_SESSION_SECRET ?? process.env.ADMIN_PASSWORD;
  if (!value || value.length < 32) throw new Error("Admin header verification requires a valid local session secret.");
  return value;
})();

test.beforeEach(async ({ context, baseURL }) => {
  if (!baseURL) throw new Error("Playwright baseURL is required.");
  await context.addInitScript(() => localStorage.setItem("moumkas-tour-v1:/admin/overview", "done"));
  const expiresAt = String(Math.floor(Date.now() / 1000) + 3600);
  const signature = createHmac("sha256", sessionSecret).update(`moumkas-admin:${expiresAt}`).digest("base64url");
  await context.addCookies([{ name:"moumkas_admin_session", value:`${expiresAt}.${signature}`, url:baseURL, httpOnly:true, sameSite:"Strict" }]);
});

test("mobile notifications stay in the header immediately left of the menu", async ({ page }) => {
  await page.goto("/admin/overview");
  const notification=page.locator('[data-testid="admin-notifications"]:visible');
  const menu=page.getByTestId("admin-menu");
  await expect(notification).toBeVisible();
  await expect(menu).toBeVisible();
  const boxes=await Promise.all([notification.boundingBox(),menu.boundingBox()]);
  expect(boxes[0]).not.toBeNull();
  expect(boxes[1]).not.toBeNull();
  expect(boxes[0]!.x+boxes[0]!.width).toBeLessThanOrEqual(boxes[1]!.x+2);
  expect(Math.abs(boxes[0]!.y-boxes[1]!.y)).toBeLessThan(8);
  await notification.click();
  await expect(page.getByRole("dialog",{name:"Workflow reminders"})).toBeVisible();
});
