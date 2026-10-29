// Owner-run read-only browser audit against an explicitly supplied running origin.
// No server startup, authentication, form submission, database mutation or email.
import {chromium} from "@playwright/test";
import {mkdir,writeFile} from "node:fs/promises";
import {resolve} from "node:path";
const argument=process.argv.find(value=>value.startsWith("--base-url="));
if(!argument)throw Error("Supply --base-url=http://existing-origin:existing-port. This script starts no server.");
const url=new URL(argument.slice("--base-url=".length));
if(!["http:","https:"].includes(url.protocol)||url.username||url.password||url.pathname!=="/"||url.search||url.hash)throw Error("Supply an origin only, without credentials or private paths.");
const base=url.origin;
const output=resolve("artifacts/verification",`education-contact-${new Date().toISOString().replace(/[:.]/g,"-")}`);
await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:"msedge",headless:true});
const report=[];
try{
  for(const width of [320,375,390,430,1440]){
    const page=await browser.newPage({viewport:{width,height:width>=768?1000:844},isMobile:width<768,deviceScaleFactor:1});
    await page.addInitScript(()=>sessionStorage.setItem("hasLoadedOnce","true"));
    for(const path of ["/contact","/education"]){
      const response=await page.goto(base+path,{waitUntil:"domcontentloaded"});
      if(response.status()!==200)throw Error(`${path}: HTTP ${response.status()}. Check the configured environment; no credential changes were made.`);
      await page.evaluate(()=>document.fonts.ready);
      await page.waitForTimeout(5000);
      const evidence=await page.evaluate(()=>{
        const header=document.querySelector("[data-site-header]");
        const hero=document.querySelector("[data-contact-hero]");
        const rows=[...document.querySelectorAll("[data-education-row]")];
        return{overflow:document.documentElement.scrollWidth>innerWidth+2,headerBottom:header?.getBoundingClientRect().bottom,heroTop:hero?.getBoundingClientRect().top,
          canonical:document.querySelector('link[rel="canonical"]')?.href,title:document.title,description:document.querySelector('meta[name="description"]')?.content,
          h2:rows.map(row=>row.querySelector("h2")?.textContent.trim()),
          imageAlts:[...document.querySelectorAll("main img")].map(image=>({src:image.getAttribute("src"),alt:image.getAttribute("alt")}))};
      });
      const failures=[];
      if(evidence.overflow)failures.push("Horizontal overflow");
      if(path==="/contact"&&width<768&&(evidence.heroTop===undefined||evidence.headerBottom===undefined||evidence.heroTop<evidence.headerBottom-2))failures.push("Contact image overlaps header");
      if(path==="/education"&&(evidence.h2.length!==4||evidence.h2.some(title=>!title)))failures.push("Expected four section H2s");
      if(evidence.canonical!==`https://vasilismoumkas.com${path}`)failures.push("Canonical mismatch");
      if(evidence.imageAlts.some(image=>/^Visual [123]$/.test(image.alt??"")))failures.push("Generic Education visual alt");
      await page.screenshot({path:resolve(output,`${path.slice(1)}-${width}-top.png`)});
      if(path==="/contact"){
        const form=page.locator("form").first();
        await form.scrollIntoViewIfNeeded();
        await page.waitForTimeout(1500);
        await form.screenshot({path:resolve(output,`contact-${width}-form.png`)});
      }else{
        for(const [index,row] of (await page.locator("[data-education-row]").all()).entries()){
          await row.scrollIntoViewIfNeeded();
          await page.waitForTimeout(1600);
          await row.screenshot({path:resolve(output,`education-${width}-section-${index+1}.png`)});
        }
      }
      report.push({path,width,...evidence,failures});
      console.log(`${failures.length?"REVIEW":"PASS"} - ${path} at ${width}px: ${failures.join("; ")||"layout and metadata checks"}`);
    }
    await page.close();
  }
  if(process.argv.includes("--public-hosts")){
    // Real public GETs only. Use after deployment; predeployment results are a baseline.
    const context=await browser.newContext();
    for(const path of ["/?origin_audit=sprint58","/about?origin_audit=sprint58","/contact?origin_audit=sprint58","/education?origin_audit=sprint58"]){
      const response=await context.request.get(`https://www.vasilismoumkas.com${path}`,{maxRedirects:0});
      const status=response.status();
      const location=response.headers().location;
      const expected=`https://vasilismoumkas.com${path}`;
      const failures=[301,308].includes(status)&&location===expected?[]:["Expected permanent redirect preserving path/query"];
      report.push({path,status,location,expected,failures});
      console.log(`${failures.length?"REVIEW":"PASS"} - public www ${path}: ${status}`);
    }
    const sitemap=await context.request.get("https://vasilismoumkas.com/sitemap.xml");
    const xml=await sitemap.text();
    const failures=sitemap.status()===200&&!/<loc>https?:\/\/www\.vasilismoumkas\.com/.test(xml)?[]:["Sitemap status/origin mismatch"];
    report.push({path:"/sitemap.xml",failures});
    await context.close();
  }
}finally{
  await writeFile(resolve(output,"report.json"),JSON.stringify(report,null,2));
  await browser.close();
  console.log(`Report and screenshots: ${output}`);
}
if(report.some(item=>item.failures.length))throw Error("Browser audit requires review. Preserve report.json and screenshots.");
console.log("PASS - READ-ONLY BROWSER CHECKS. Real iPhone Safari/Instagram and authenticated publishing still require owner acceptance.");
