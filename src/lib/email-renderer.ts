import { readEmailComposition } from "./email-composition";
import { renderStructuredEmail, renderEmailSignature } from "./structured-email-renderer";
export type EmailRenderLocale="el"|"en";

export type EmailRenderOptions={
  locale:EmailRenderLocale;
  siteUrl?:string;
  assetBaseUrl?:string;
  headerImageUrl?:string;
  offerUrl?:string;
  portalUrl?:string;
  galleryUrl?:string;
};

const fallbackSiteUrl="https://vasilismoumkas.com";
const fallbackHeaderPath="/uploads/portfolio/natasa-stamatis/7099163a-198e-4cf5-ab4c-799e6ae5757a.webp";

const escapeHtml=(value:string)=>value.replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[char]!);
const escapeAttribute=escapeHtml;
const normalizeUrl=(value?:string)=>value?.trim()||"";
const absoluteUrl=(value:string,siteUrl:string)=>/^https?:\/\//i.test(value)?value:`${siteUrl}${value.startsWith("/")?value:`/${value}`}`;
const signatureStart=/^Vasilis Moumkas\s*\|\s*Fine Art Wedding Photographer\s*$/im;
const closingStart=/^(kind regards|best regards|warm regards|με εκτίμηση|φιλικά|με φιλικούς χαιρετισμούς)[,\s]/i;

export function removeLegacySignature(bodyText:string){
  const match=signatureStart.exec(bodyText);
  return (match?bodyText.slice(0,match.index):bodyText).trim();
}

function linkedText(value:string){
  const escaped=escapeHtml(value);
  return escaped.replace(/https?:\/\/[^\s<]+/gi,url=>{
    const clean=url.replace(/[),.;!?]+$/g,"");
    const suffix=url.slice(clean.length);
    return `<a href="${escapeAttribute(clean)}" target="_blank" style="display:inline-block;max-width:100%;padding:12px 18px;background:#D9CEC3;color:#292724;font-size:12px;line-height:18px;font-weight:700;letter-spacing:.03em;text-decoration:none;word-break:break-all">${clean}</a>${suffix}`;
  });
}

function paragraphHtml(value:string){
  const lines=value.split(/\r?\n/).map(line=>line.trim()).filter(Boolean);
  const normalized=closingStart.test(lines[0]??"")?lines.join("\n"):lines.join(" ");
  return linkedText(normalized).replaceAll("\n","<br>");
}

function normalizedTextBody(value:string){
  return removeLegacySignature(value).split(/(?:\r?\n){2,}/).filter(Boolean).map(block=>{
    const lines=block.split(/\r?\n/).map(line=>line.trim()).filter(Boolean);
    return closingStart.test(lines[0]??"")?lines.join("\n"):lines.join(" ");
  }).join("\n\n");
}

function button(label:string,url:string){
  const background="#D9CEC3";
  const color="#292724";
  const border="#b7aaa0";
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:26px 0"><tr><td align="center"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="${background}" style="border:1px solid ${border}"><a href="${escapeAttribute(url)}" target="_blank" style="display:inline-block;padding:15px 24px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:16px;font-weight:700;letter-spacing:.08em;color:${color};text-decoration:none">${escapeHtml(label)}</a></td></tr></table></td></tr></table>`;
}

function bodyHtml(bodyText:string,options:EmailRenderOptions){
  const offerUrl=normalizeUrl(options.offerUrl);
  const portalUrl=normalizeUrl(options.portalUrl);
  const galleryUrl=normalizeUrl(options.galleryUrl);
  const used=new Set<string>();
  const blocks=removeLegacySignature(bodyText).split(/(?:\r?\n){2,}/).filter(Boolean);
  let offerIndex=offerUrl?blocks.findIndex(block=>block.includes(offerUrl)):-1;
  let proposalIntroductionIndex=blocks.findIndex(block=>/(Στον παρακάτω σύνδεσμο θα βρείτε την προσωπική σας πρόταση|Through the link below, you will find your personal proposal)/i.test(block));
  if(offerIndex>=0&&proposalIntroductionIndex>=0&&offerIndex!==proposalIntroductionIndex+1){
    const remaining=blocks[offerIndex].replace(offerUrl,"").trim();
    if(offerIndex===proposalIntroductionIndex){
      blocks[offerIndex]=remaining;
    }else if(remaining){
      blocks[offerIndex]=remaining;
    }else{
      blocks.splice(offerIndex,1);
      if(offerIndex<proposalIntroductionIndex)proposalIntroductionIndex--;
    }
    blocks.splice(proposalIntroductionIndex+1,0,offerUrl);
    offerIndex=proposalIntroductionIndex+1;
  }
  const closingIndex=blocks.findIndex(block=>closingStart.test(block.trim()));
  if(offerIndex>closingIndex&&closingIndex>=0){const[offerBlock]=blocks.splice(offerIndex,1);blocks.splice(closingIndex,0,offerBlock)}
  return blocks.map(block=>{
    const trimmed=block.trim();
    if(offerUrl&&trimmed.includes(offerUrl)&&!used.has("offer")){
      used.add("offer");
      const remaining=trimmed.replace(offerUrl,"").trim();
      return `${remaining?`<p style="margin:0 0 18px;text-align:center">${paragraphHtml(remaining)}</p>`:""}${button(options.locale==="el"?"ΔΕΙΤΕ ΤΗΝ ΠΡΟΣΩΠΙΚΗ ΣΑΣ ΠΡΟΤΑΣΗ":"VIEW YOUR PERSONAL PROPOSAL",offerUrl)}`;
    }
    if(portalUrl&&trimmed.includes(portalUrl)&&!used.has("portal")){
      used.add("portal");
      const remaining=trimmed.replace(portalUrl,"").trim();
      return `${remaining?`<p style="margin:0 0 18px;text-align:center">${paragraphHtml(remaining)}</p>`:""}${button("View Client Portal",portalUrl)}`;
    }
    if(galleryUrl&&trimmed.includes(galleryUrl)&&!used.has("gallery")){
      used.add("gallery");
      const remaining=trimmed.replace(galleryUrl,"").trim();
      return `${remaining?`<p style="margin:0 0 18px;text-align:center">${paragraphHtml(remaining)}</p>`:""}${button(options.locale==="el"?"ΔΕΙΤΕ ΜΙΑ ΟΛΟΚΛΗΡΩΜΕΝΗ WEDDING STORY":"VIEW A COMPLETE WEDDING STORY",galleryUrl)}`;
    }
    return `<p style="margin:0 0 18px;text-align:center">${paragraphHtml(trimmed)}</p>`;
  }).join("\n");
}

function footerHtml(siteUrl:string,locale:EmailRenderLocale){return renderEmailSignature(locale,siteUrl)}

export function renderEmailDocument(bodyText:string,options:EmailRenderOptions){
  const composition=readEmailComposition(bodyText);
  if(composition)return renderStructuredEmail(composition,options).html;
  const siteUrl=(options.siteUrl||fallbackSiteUrl).replace(/\/$/,"");
  const headerImageUrl=absoluteUrl(options.headerImageUrl||fallbackHeaderPath,siteUrl);
  return `<!doctype html><html lang="${options.locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="x-apple-disable-message-reformatting"><title></title><!--[if mso]><style>table,td,p,a{font-family:Arial,Helvetica,sans-serif!important}</style><![endif]--></head><body style="margin:0;padding:0;background:#F5F3EF;color:#292724"><div style="display:none;max-height:0;overflow:hidden;opacity:0">&nbsp;</div><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#F5F3EF"><tr><td align="center" style="padding:20px 8px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:640px;background:#F5F3EF"><tr><td><a href="${escapeAttribute(siteUrl)}" target="_blank"><img src="${escapeAttribute(headerImageUrl)}" width="640" alt="Santorini" style="display:block;width:100%;max-width:640px;height:auto;border:0"></a></td></tr><tr><td style="padding:42px 20px 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#292724;text-align:center">${bodyHtml(bodyText,options)}</td></tr><tr><td>${footerHtml(siteUrl,options.locale)}</td></tr></table></td></tr></table></body></html>`;
}

const signatureText=`Vasilis Moumkas
Fine Art Photographer
+30 697 221 8775
vasilis.moumkas@gmail.com
https://vasilismoumkas.com
Instagram: https://www.instagram.com/vasilismoumkas_weddings/
Pinterest: https://gr.pinterest.com/vasilismoumkas/`;
export function renderEmailText(bodyText:string,options?:EmailRenderOptions){const composition=readEmailComposition(bodyText);if(composition)return renderStructuredEmail(composition,options??{locale:"el"}).text;return `${normalizedTextBody(bodyText)}\n\n---\n\n${signatureText}`}
