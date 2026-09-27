import { createHmac } from "node:crypto";
import { expect,test } from "@playwright/test";
const secret=(()=>{const value=process.env.ADMIN_SESSION_SECRET??process.env.ADMIN_PASSWORD;if(!value||value.length<32)throw new Error("Client workspace verification requires a valid local session secret.");return value})();
test.beforeEach(async({context,baseURL})=>{if(!baseURL)throw new Error("Playwright baseURL is required.");await context.addInitScript(()=>{localStorage.setItem("moumkas-tour-v1:/admin/clients","done");localStorage.setItem("moumkas-tour-v1:/admin/clients/[id]","done");localStorage.setItem("moumkas-reminders-snoozed-until",String(Date.now()+3600000))});const expires=String(Math.floor(Date.now()/1000)+3600);const signature=createHmac("sha256",secret).update(`moumkas-admin:${expires}`).digest("base64url");await context.addCookies([{name:"moumkas_admin_session",value:`${expires}.${signature}`,url:baseURL,httpOnly:true,sameSite:"Strict"}])});

test("client workspace stays compact and opens one operational section at a time",async({page})=>{
  await page.goto("/admin/verification-client-workspace");
  await expect(page.locator("[data-client-summary]")).toBeVisible();
  const sections=page.locator("[data-client-workspace-section]");
  await expect(sections).toHaveCount(9);
  const offers=sections.filter({has:page.getByRole("heading",{name:"Offers",exact:true})});
  const mail=sections.filter({has:page.getByRole("heading",{name:"Mail",exact:true})});
  await offers.locator("summary").click();
  await expect(offers).toHaveAttribute("open","");
  await mail.locator("summary").click();
  await expect(mail).toHaveAttribute("open","");
  await expect(offers).not.toHaveAttribute("open","");
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
