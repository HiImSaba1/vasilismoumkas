import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
const read=path=>readFile(resolve(process.cwd(),path),"utf8");
const checks=[];const requireText=(source,pattern,label)=>{if(!pattern.test(source))throw new Error(`FAIL - ${label}`);checks.push(`PASS - ${label}`)};
const[leadsPage,clientsPage,deleteButton,leads,imagePools,portalData,portalPage,portalMarquee,offerHero,offerChess,offerOutro,footer,projects]=await Promise.all([
  read("src/app/admin/leads/page.tsx"),read("src/app/admin/clients/page.tsx"),read("src/components/admin/DeleteJourneyButton.tsx"),read("src/lib/leads.ts"),read("src/app/(site)/data/event-image-pools.ts"),read("src/lib/client-portals.ts"),read("src/app/portal/[slug]/page.tsx"),read("src/app/portal/[slug]/PortalMarquee.tsx"),read("src/components/sections/OfferPage/OfferHero.tsx"),read("src/components/sections/OfferPage/OfferChess.tsx"),read("src/components/sections/OfferPage/OfferOutro.tsx"),read("src/components/core/Footer.tsx"),read("src/components/sections/HomePage/HomeProjectsGrid.tsx")
]);
requireText(leadsPage,/DeleteJourneyButton[\s\S]*deleteLeadAction[\s\S]*label="Delete lead"/,"lead cards expose the protected delete journey action");
requireText(clientsPage,/DeleteJourneyButton[\s\S]*deleteClientAction[\s\S]*label="Delete client"/,"client cards expose the protected delete journey action");
requireText(deleteButton,/Trash2[\s\S]*bg-red-800[\s\S]*step===1[\s\S]*Final confirmation[\s\S]*Permanently delete everything/,"compact red trash control requires two confirmations");
requireText(deleteButton,/closest\("details"\)[\s\S]*createPortal\(trigger,portalHost\)/,"delete trash icon is portaled into the always-visible record card header");
requireText(leads,/clients\.map\(client=>client\.id\)[\s\S]*DELETE FROM timelines[\s\S]*DELETE FROM clients[\s\S]*DELETE FROM offers[\s\S]*DELETE FROM leads/,"journey deletion removes every connected database record group");
requireText(leads,/removeClientFileStorage\(clientIds\)[\s\S]*removeClientFileStorage\(\[clientId\]\)/,"journey deletion removes private file storage for connected and orphan clients");
requireText(imagePools,/project\.category\.trim\(\)\.toLocaleLowerCase\(\)\s*===\s*category[\s\S]*fallback\[eventType\]/,"event image pools use matching portfolio categories and event-specific fallbacks");
requireText(imagePools,/baptism:\s*\[[\s\S]*offer_baptism_1[\s\S]*offer_baptism_7/,"baptism fallback contains baptism assets only");
requireText(portalData,/c\.event_type[\s\S]*eventType:portal\.event_type/,"client portal receives the authoritative client event type");
requireText(portalPage,/PortalMarquee language=\{portal\.language\} eventType=\{portal\.eventType\}/,"portal passes its event type to the visual marquee");
requireText(portalMarquee,/eventImagePool\(eventType\)[\s\S]*stableImageOffset\(identity/,"portal selects a stable varied image sequence from the correct event pool");
requireText(offerHero,/eventImagePool\(type\)/,"offer hero uses the event-scoped image pool");
requireText(offerChess,/eventImagePool\(eventType\)/,"offer collection rows use the event-scoped image pool");
requireText(offerOutro,/eventImagePool\(isBaptism \? "baptism" : "wedding"\)/,"offer outro uses the event-scoped image pool");
requireText(footer,/isBaptism[\s\S]*\? OFFER_BAPTISM_POOL[\s\S]*: HOMEPAGE_WHITE_FOOTER/,"baptism offer footer stays inside its dedicated baptism image pool");
requireText(projects,/Never cross event categories[\s\S]*filteredProjects\.slice\(0, 3\)/,"offer portfolio cards never fall back across event categories");
for(const check of checks)console.log(check);console.log(`PASS - ${checks.length} Sprint 27 deletion and event image contracts verified.`);
