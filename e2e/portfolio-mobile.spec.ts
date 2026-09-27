import { expect,test } from "@playwright/test";

test("portfolio project images preserve their mobile aspect ratio without horizontal overflow",async({page},testInfo)=>{
  await page.goto("/portfolio");
  const projectLink=page.locator('a[href^="/portfolio/project/"]').first();
  await expect(projectLink).toBeVisible();
  const href=await projectLink.getAttribute("href");
  expect(href).toBeTruthy();
  await page.goto(href!);
  const mobile=testInfo.project.name.startsWith("mobile-");
  if(mobile){
    const images=page.locator("[data-mobile-natural-aspect] img");
    await expect(images.first()).toBeVisible();
    const count=Math.min(await images.count(),6);
    for(let index=0;index<count;index++){
      const image=images.nth(index);
      await expect(image).toBeVisible();
      const ratio=await image.evaluate(element=>{const img=element as HTMLImageElement;const box=img.getBoundingClientRect();return{rendered:box.width/box.height,natural:img.naturalWidth/img.naturalHeight}});
      expect(Math.abs(ratio.rendered-ratio.natural)).toBeLessThan(0.03);
    }
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  }else{
    await expect(page.locator("[data-mobile-natural-aspect]").first()).toBeHidden();
    await expect(page.locator("[data-portfolio-gallery-item]").first()).toBeHidden();
    const desktopImages=page.locator("[data-desktop-metro-gallery] img");
    await expect(desktopImages.first()).toBeVisible();
    const count=Math.min(await desktopImages.count(),6);
    for(let index=0;index<count;index++){
      const image=desktopImages.nth(index);
      await image.scrollIntoViewIfNeeded();
      await expect.poll(()=>image.evaluate(element=>(element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
      const ratio=await image.evaluate(element=>{const img=element as HTMLImageElement;const box=img.getBoundingClientRect();return{rendered:box.width/box.height,natural:img.naturalWidth/img.naturalHeight}});
      expect(Math.abs(ratio.rendered-ratio.natural)).toBeLessThan(0.03);
    }
    const landscape=page.locator('[data-desktop-metro-gallery][data-landscape="true"]').first();
    await expect(landscape).toBeVisible();
    const span=await landscape.evaluate(element=>getComputedStyle(element.parentElement!).gridColumnEnd);
    expect(span).toContain("span 2");
  }
});

test("portfolio cards preserve the title image ratio on mobile",async({page},testInfo)=>{
  test.skip(!testInfo.project.name.startsWith("mobile-"),"Mobile card contract");
  await page.goto("/");
  const image=page.locator("[data-portfolio-card-image]").first();
  await expect(image).toBeVisible();
  const ratio=await image.evaluate(element=>{const img=element as HTMLImageElement;const box=img.getBoundingClientRect();return{rendered:box.width/box.height,natural:img.naturalWidth/img.naturalHeight}});
  expect(Math.abs(ratio.rendered-ratio.natural)).toBeLessThan(0.03);
});
