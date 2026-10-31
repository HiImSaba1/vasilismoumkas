import "server-only";
import {readFile} from "node:fs/promises";
import path from "node:path";

const brandAssets={
  "/vm_img/Offer/vasilis-moumkas-logo-mail-signature.png":{filename:"vasilis-moumkas-logo-mail-signature.png",cid:"vm-signature@vasilismoumkas.com"},
  "/vm_img/Offer/email-social-instagram.png":{filename:"email-social-instagram.png",cid:"vm-instagram@vasilismoumkas.com"},
  "/vm_img/Offer/email-social-pinterest.png":{filename:"email-social-pinterest.png",cid:"vm-pinterest@vasilismoumkas.com"},
} as const;
// Fixed public branding assets only: never fetch URLs or accept a user file path.
// The stored HTML keeps its canonical public URLs; MIME embeds identical image bytes.
export async function inlineEmailBrandAssets(html:string){
  const selected=new Set<keyof typeof brandAssets>();
  const rendered=html.replace(/(<img\b[^>]*\bsrc=")([^"]+)(")/gi,(match,prefix:string,src:string,suffix:string)=>{
    let pathname:string;try{pathname=new URL(src,"https://vasilismoumkas.com").pathname}catch{return match}
    if(!Object.hasOwn(brandAssets,pathname))return match;
    const key=pathname as keyof typeof brandAssets;selected.add(key);return`${prefix}cid:${brandAssets[key].cid}${suffix}`;
  });
  const attachments=await Promise.all([...selected].map(async key=>{
    const asset=brandAssets[key];
    let content:Buffer;try{content=await readFile(path.join(process.cwd(),"public",key.slice(1)))}catch{throw new Error(`Email branding file missing: ${asset.filename}. Rebuild the release before sending.`)}
    return{filename:asset.filename,cid:asset.cid,content,contentType:"image/png",contentDisposition:"inline" as const};
  }));
  return{html:rendered,attachments};
}
