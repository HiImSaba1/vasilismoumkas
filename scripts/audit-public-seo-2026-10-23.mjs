// Owner-run, read-only local browser acceptance. Does not submit any form.
import {chromium} from "@playwright/test";
import {writeFile,mkdir} from "node:fs/promises";
import {resolve} from "node:path";
const base=process.env.PHASE1_PREVIEW_URL??"http://127.0.0.1:3156";
const browser=await chromium.launch({channel:"msedge",headless:true});
const report=[];
try {
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  await page.addInitScript(()=>sessionStorage.setItem("hasLoadedOnce","true"));
  for(const path of ["/","/about","/services","/contact","/portfolio","/education","/cookies","/privacy-policy","/instagram","/inquiry"]){
    const response=await page.goto(base+path,{waitUntil:"domcontentloaded"});
    await page.waitForTimeout(1800);
    const result=await page.evaluate(()=>{
      const json=Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map(script=>JSON.parse(script.textContent));
      return{title:document.title,description:document.querySelector('meta[name="description"]')?.content,canonical:document.querySelector('link[rel="canonical"]')?.href,
        ogTitle:document.querySelector('meta[property="og:title"]')?.content,ogDescription:document.querySelector('meta[property="og:description"]')?.content,ogImage:document.querySelector('meta[property="og:image"]')?.content,
        headings:Array.from(document.querySelectorAll("h1,h2,h3")).map(element=>({tag:element.tagName,text:element.textContent.trim()})),structuredTypes:json.map(item=>item["@type"])};
    });
    const h1=result.headings.filter(item=>item.tag==="H1");
    const failures=[];
    if(response.status()!==200)failures.push(`HTTP ${response.status()}`);
    if(!result.title||!result.description||!result.ogTitle||!result.ogDescription||!result.ogImage)failures.push("Missing search/social metadata");
    if(result.canonical!==`https://vasilismoumkas.com${path==="/"?"/":path}`)failures.push("Canonical mismatch");
    if(h1.length!==1)failures.push(`Expected one H1; found ${h1.length}`);
    report.push({path,...result,failures});
    console.log(`${failures.length?"REVIEW":"PASS"} - ${path}: H1=${h1.length}; H2/H3=${result.headings.length-h1.length}; canonical=${result.canonical}`);
  }
  const privateResponse=await page.request.get(base+"/questionnaire/nonexistent-offline-test-token");
  if(!privateResponse.headers()["x-robots-tag"]?.includes("noindex"))throw Error("Private questionnaire noindex header is missing.");
  const sitemap=await page.request.get(base+"/sitemap.xml");
  const xml=await sitemap.text();
  if(sitemap.status()!==200||/<loc>[^<]*\/(admin|portal|offer|questionnaire|timeline)(\/|<)/.test(xml))throw Error("Sitemap status/private route check failed.");
  const storyPaths=[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match=>new URL(match[1]).pathname).filter(path=>path.startsWith("/portfolio/")||path.startsWith("/destinations/"));
  for(const path of storyPaths){
    const response=await page.goto(base+path,{waitUntil:"domcontentloaded"});
    await page.locator("h1").first().waitFor({state:"attached",timeout:12000}).catch(()=>{});
    const result=await page.evaluate(()=>({title:document.title,description:document.querySelector('meta[name="description"]')?.content,canonical:document.querySelector('link[rel="canonical"]')?.href,ogImage:document.querySelector('meta[property="og:image"]')?.content,h1:document.querySelectorAll("h1").length,headings:Array.from(document.querySelectorAll("h1,h2,h3")).map(element=>({tag:element.tagName,text:element.textContent.trim()}))}));
    const failures=[];
    if(result.h1!==1)failures.push("Published story must contain one H1");
    if(response.status()!==200||!result.title||!result.description||!result.ogImage||result.canonical!==`https://vasilismoumkas.com${path}`)failures.push("Published story HTTP or metadata mismatch");
    report.push({path,...result,failures});console.log(`${failures.length?"REVIEW":"PASS"} - published story SEO: ${path}`);
  }
  console.log("PASS - private questionnaire noindex header and sitemap private-route exclusion.");
}finally{
  await browser.close();await mkdir(resolve("artifacts/verification"),{recursive:true});
  await writeFile(resolve("artifacts/verification/content-seo-browser-2026-10-23.json"),JSON.stringify(report,null,2));
}
if(report.some(item=>item.failures.length))throw Error("Public SEO acceptance needs review. Preserve content-seo-browser-2026-10-23.json.");
