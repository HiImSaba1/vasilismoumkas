import { createHmac } from "node:crypto";
import { expect,test } from "@playwright/test";

const secret=(()=>{const value=process.env.ADMIN_SESSION_SECRET??process.env.ADMIN_PASSWORD;if(!value||value.length<32)throw new Error("Invoice payment verification requires a valid local session secret.");return value})();

test.beforeEach(async({context,baseURL})=>{
  if(!baseURL)throw new Error("Playwright baseURL is required.");
  await context.addInitScript(()=>{
    localStorage.setItem("moumkas-tour-v1:/admin/clients/[id]","done");
    localStorage.setItem("moumkas-reminders-snoozed-until",String(Date.now()+3600000));
  });
  const expires=String(Math.floor(Date.now()/1000)+3600);
  const signature=createHmac("sha256",secret).update(`moumkas-admin:${expires}`).digest("base64url");
  await context.addCookies([{name:"moumkas_admin_session",value:`${expires}.${signature}`,url:baseURL,httpOnly:true,sameSite:"Strict"}]);
});

test("invoice ledger controls and portal balance remain clear and responsive",async({page})=>{
  await page.goto("/admin/verification-invoice-payments");
  const admin=page.locator("[data-admin-invoice]");const portal=page.locator("[data-portal-invoice]");
  await expect(admin.getByText("€1,600.00",{exact:true})).toBeVisible();await expect(admin.getByText("€350.00",{exact:true}).first()).toBeVisible();await expect(admin.getByText("€1,250.00",{exact:true})).toBeVisible();
  await expect(admin.getByRole("link",{name:"Compose deposit confirmation"})).toHaveAttribute("href",/email\?template=006$/);
  await admin.getByRole("button",{name:"Record payment"}).click();await expect(admin.getByRole("button",{name:"Save payment"})).toBeVisible();const amount=admin.getByLabel("Amount (€)");await expect(amount).toHaveAttribute("max","1250");await admin.getByRole("button",{name:/Use 25% deposit/}).click();await expect(amount).toHaveValue("400");
  await admin.getByRole("button",{name:"Cancel"}).click();await admin.getByRole("button",{name:"Delete"}).click();await expect(admin.getByRole("button",{name:"Yes, continue"})).toBeVisible();await admin.getByRole("button",{name:"Yes, continue"}).click();await expect(admin.getByLabel("Reason for deletion")).toBeVisible();
  await expect(portal.getByText("Payments are arranged directly with the studio.",{exact:false})).toBeVisible();await expect(portal.getByText("Pay Now")).toHaveCount(0);await expect(portal.getByText("Bank transfer · TEST-350")).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});
