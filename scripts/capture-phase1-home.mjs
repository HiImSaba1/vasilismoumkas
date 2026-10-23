// Owner-run local screenshots. Visits Home only; never submits forms.
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
const baseURL = process.env.PHASE1_PREVIEW_URL ?? "http://127.0.0.1:3156";
const output = resolve("artifacts/verification/phase1-home-2026-10-23");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: "msedge", headless: true });
try {
  for (const [name, width, height, mobile] of [["mobile", 390, 844, true], ["desktop", 1440, 1000, false]]) {
    const page = await browser.newPage({ viewport: { width, height }, isMobile: mobile, deviceScaleFactor: 1 });
    await page.addInitScript(() => sessionStorage.setItem("hasLoadedOnce", "true"));
    await page.goto(baseURL, { waitUntil: "domcontentloaded" });
    const intro = page.locator("[data-home-personal-intro]");
    await intro.waitFor({ state: "visible", timeout: 30000 });
    await page.evaluate(() => document.fonts.ready);
    if (name === "desktop") {
      await page.waitForTimeout(3500);
      const headline = page.locator('[data-key="part5"]').first();
      await headline.locator("..").screenshot({ path: resolve(output, "desktop-headline.png") });
    }
    await page.evaluate(() => {
      const target = document.querySelector("[data-home-personal-intro]");
      if (target) window.scrollTo({ top: window.scrollY + target.getBoundingClientRect().top, behavior: "instant" });
    });
    await intro.scrollIntoViewIfNeeded();
    await page.waitForTimeout(2500);
    // Capture a legible end-state, not half-revealed lines from a scroll frame.
    // This affects only this disposable browser page; real animation acceptance is separate.
    await intro.evaluate(element => {
      for (const word of element.querySelectorAll("p [style]")) {
        if (word instanceof HTMLElement && word.style.transform) word.style.transform = "none";
      }
    });
    await intro.screenshot({ path: resolve(output, `${name}.png`), animations: "allow" });
    const layout = await intro.evaluate(element => ({
      paragraphCount: element.querySelectorAll(".grid p").length,
      overflowingParagraphs: Array.from(element.querySelectorAll(".grid p")).filter(p => p.scrollWidth > p.clientWidth + 2).length,
      fontFamily: getComputedStyle(element.querySelector(".grid p")).fontFamily,
      fontWeight: getComputedStyle(element.querySelector(".grid p")).fontWeight,
    }));
    console.log(`${name}: ${JSON.stringify(layout)}; image: ${resolve(output, `${name}.png`)}`);
    if (layout.overflowingParagraphs) throw new Error(`${name} introduction has horizontal text overflow.`);
    if (mobile && layout.fontWeight !== "300") throw new Error("Mobile introduction does not have its intended light weight.");
    if (mobile && !layout.fontFamily.includes("HomeIntroRoboto")) throw new Error("Mobile introduction is not using its readable scoped font.");
    if (layout.paragraphCount !== 3) console.log("REVIEW - Local saved introduction differs from the reported approved three-paragraph version. No saved text was changed by this capture.");
    await page.close();
  }
} finally { await browser.close(); }
