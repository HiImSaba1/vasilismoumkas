import "server-only";
import type {RowDataPacket} from "mysql2/promise";
import {z} from "zod";
import {getDatabase,isDatabaseConfigured} from "@/lib/database";
import {listPortfolioEmailImages,storePortfolioFiles,type PortfolioEmailImage} from "@/lib/portfolio";
const item=z.object({src:z.string().startsWith("/uploads/portfolio/_website-media/"),alt:z.string().trim().min(1).max(300),filename:z.string().trim().min(1).max(255)});
const items=z.array(item).max(250);
const KEY="website_media_library_v1";
export async function listWebsiteMedia(){if(!isDatabaseConfigured())return[];const[rows]=await getDatabase().query<(RowDataPacket&{value_json:string|unknown})[]>("SELECT value_json FROM site_settings WHERE setting_key=? LIMIT 1",[KEY]);if(!rows[0])return[];const raw=typeof rows[0].value_json==="string"?JSON.parse(rows[0].value_json):rows[0].value_json;const parsed=items.safeParse(raw);return parsed.success?parsed.data:[]}
export async function listWebsiteImages():Promise<PortfolioEmailImage[]>{const[portfolio,media]=await Promise.all([listPortfolioEmailImages(),listWebsiteMedia()]);const standalone=media.map(value=>({src:value.src,alt:value.alt,projectTitle:"Website media",projectSlug:"_website-media",searchableText:`${value.filename} ${value.alt}`}));const seen=new Set<string>();return[...standalone,...portfolio].filter(value=>!seen.has(value.src)&&Boolean(seen.add(value.src)))}
export async function uploadWebsiteMedia(file:File,alt:string){const cleanAlt=z.string().trim().min(3,"Add a descriptive alt text.").max(300).parse(alt);if(!file.size)throw new Error("Choose an image to upload.");const[src]=await storePortfolioFiles("_website-media",[file]);const next=items.parse([...(await listWebsiteMedia()),{src,alt:cleanAlt,filename:file.name}]);await getDatabase().execute("INSERT INTO site_settings (setting_key,value_json) VALUES (?,?) ON DUPLICATE KEY UPDATE value_json=VALUES(value_json),updated_at=CURRENT_TIMESTAMP",[KEY,JSON.stringify(next)]);return src}
