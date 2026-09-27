import { createHmac } from "node:crypto";
import { expect, test } from "@playwright/test";

const sessionSecret = (() => {
  const value = process.env.ADMIN_SESSION_SECRET ?? process.env.ADMIN_PASSWORD;
  if (!value || value.length < 32) throw new Error("Sprint 05 browser verification requires ADMIN_SESSION_SECRET or a 32-character ADMIN_PASSWORD.");
  return value;
})();

test.beforeEach(async ({ context, baseURL }) => {
  if (!baseURL) throw new Error("Playwright baseURL is required.");
  await context.addInitScript(() => {
    localStorage.setItem("moumkas-tour-v1:/admin/dashboard", "done");
  });
  const expiresAt = String(Math.floor(Date.now() / 1000) + 3600);
  const signature = createHmac("sha256", sessionSecret).update(`moumkas-admin:${expiresAt}`).digest("base64url");
  await context.addCookies([{ name: "moumkas_admin_session", value: `${expiresAt}.${signature}`, url: baseURL, httpOnly: true, sameSite: "Strict" }]);
});

for (const eventType of ["wedding", "baptism"] as const) {
  test(`${eventType} standalone offer calendar changes year, month and date`, async ({ page }) => {
    await page.goto(`/admin/dashboard?type=${eventType}`);
    await page.getByTestId(`${eventType}-logistics-next`).click();
    const dateInput = page.getByTestId("date-native-input");
    await expect(dateInput).toBeVisible();
    await dateInput.fill("2028-09-14");
    await expect(dateInput).toHaveValue("2028-09-14");
  });

  test(`${eventType} standalone offer supports direct mobile date entry`, async ({ page }) => {
    await page.goto(`/admin/dashboard?type=${eventType}`);
    await page.getByTestId(`${eventType}-logistics-next`).click();
    const directInput = page.getByTestId("date-native-input");
    await expect(directInput).toBeVisible();
    await directInput.fill("2029-05-19");
    await expect(directInput).toHaveValue("2029-05-19");
  });
}
