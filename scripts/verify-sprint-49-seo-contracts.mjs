import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const read=(path)=>readFile(path,"utf8");
const robots=await read("src/app/robots.ts");
assert(!robots.includes("'/_next/'"),"robots must not block /_next/");
assert(robots.includes("'/admin/'")&&robots.includes("'/portal/'"),"private routes must remain disallowed");

const sitemap=await read("src/app/sitemap.ts");
assert(sitemap.includes('dynamic="force-dynamic"'),"sitemap must reflect current portfolio data");
assert(sitemap.includes("project.updatedAt"),"sitemap lastmod must use content updatedAt");
assert(!sitemap.includes("project.dateShot ?"),"sitemap must not use shoot date as lastmod");

const portfolio=await read("src/lib/portfolio.ts");
for(const field of ["seo_title","meta_description","header_image_alt","updated_at","is_published","includeUnpublished"])assert(portfolio.includes(field),`portfolio mapping missing ${field}`);

const projectPage=await read("src/app/(site)/portfolio/project/[slug]/page.tsx");
assert(projectPage.includes("project.seoTitle")&&projectPage.includes("project.metaDescription")&&projectPage.includes("project.headerImageAlt"),"project metadata fields are not wired");

const category=await read("src/app/(site)/portfolio/[category]/page.tsx");
assert(category.includes("listPortfolioProjects"),"category pages must use the CRM portfolio source");
assert(category.includes("settings.editorial")&&category.includes("settings.engagement"),"category SEO controls are not wired");

const admin=await read("src/app/admin/seo/page.tsx");
assert(admin.includes("I confirm this is the current professional address"),"address confirmation boundary is missing");
assert(admin.includes("Portfolio project SEO")&&admin.includes("Homepage marquee alt texts")&&admin.includes("Business and schema"),"SEO controls are not centralized in /admin/seo");
assert(admin.includes('name="home.image"')&&admin.includes("Published on public website and sitemap"),"homepage social image or project publishing control is missing");
assert(admin.includes('required={false}')&&admin.includes('required={required}'),"project SEO fields must remain optional while page SEO stays required");

const seoAction=await read("src/app/admin/seo/actions.ts");
assert(seoAction.includes('(current.seoTitle??"")!==project.seoTitle')&&seoAction.includes('(current.metaDescription??"")!==project.metaDescription')&&seoAction.includes('(current.headerImageAlt??"")!==project.headerImageAlt'),"blank project SEO fallbacks must not create unrelated project overrides");

const home=await read("src/app/(site)/page.tsx");
assert(home.includes("seo.image")&&home.includes("seo.imageAlt"),"homepage social metadata must be independent from the hero image");

const menu=await read("src/components/core/FullScreenMenu.tsx");
assert(menu.includes("business.instagram")&&menu.includes("business.facebook")&&menu.includes("business.pinterest"),"menu social links must use shared business settings");

const schema=await read("src/app/Schema.tsx");
assert(schema.includes('"@type": "LocalBusiness"'),"schema must use the valid LocalBusiness type");
assert(schema.includes("business.addressConfirmed"),"unconfirmed addresses must not be emitted in schema");

const marquee=await read("src/components/sections/HomePage/HomeMarqueeImages.tsx");
assert(marquee.includes("image.alt")&&marquee.includes('alt={idx>=shuffledImages.length?"":image.alt}'),"marquee alt and duplicate accessibility contract is missing");

for(const path of ["src/app/admin/layout.tsx","src/app/offer/layout.tsx","src/app/portal/layout.tsx","src/app/timeline/layout.tsx","src/app/questionnaire/layout.tsx"]){assert((await read(path)).includes("index:false"),`${path} must be noindex`)}

console.log("PASS - SPRINT 49 SEO CONTRACTS VERIFIED");
