export type EmailRenderLocale="el"|"en";

export type EmailRenderOptions={
  locale:EmailRenderLocale;
  siteUrl?:string;
  headerImageUrl?:string;
  offerUrl?:string;
  portalUrl?:string;
  galleryUrl?:string;
};

const fallbackSiteUrl="https://www.vasilismoumkas.com";
const fallbackHeaderPath="/uploads/portfolio/natasa-stamatis/7099163a-198e-4cf5-ab4c-799e6ae5757a.webp";
const instagramUrl="https://www.instagram.com/vasilismoumkas_weddings/";
const pinterestUrl="https://gr.pinterest.com/vasilismoumkas/";

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
    return `<a href="${escapeAttribute(clean)}" target="_blank" style="display:inline-block;max-width:100%;padding:12px 18px;background:#221f20;color:#ffffff;font-size:12px;line-height:18px;font-weight:700;letter-spacing:.03em;text-decoration:none;word-break:break-all">${clean}</a>${suffix}`;
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

function button(label:string,url:string,primary:boolean){
  const background="#221f20";
  const color="#ffffff";
  const border=primary?"#221f20":"#4d4844";
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
      return `${remaining?`<p style="margin:0 0 18px;text-align:center">${paragraphHtml(remaining)}</p>`:""}${button(options.locale==="el"?"ΔΕΙΤΕ ΤΗΝ ΠΡΟΣΩΠΙΚΗ ΣΑΣ ΠΡΟΤΑΣΗ":"VIEW YOUR PERSONAL PROPOSAL",offerUrl,true)}`;
    }
    if(portalUrl&&trimmed.includes(portalUrl)&&!used.has("portal")){
      used.add("portal");
      const remaining=trimmed.replace(portalUrl,"").trim();
      return `${remaining?`<p style="margin:0 0 18px;text-align:center">${paragraphHtml(remaining)}</p>`:""}${button("View Client Portal",portalUrl,true)}`;
    }
    if(galleryUrl&&trimmed.includes(galleryUrl)&&!used.has("gallery")){
      used.add("gallery");
      const remaining=trimmed.replace(galleryUrl,"").trim();
      return `${remaining?`<p style="margin:0 0 18px;text-align:center">${paragraphHtml(remaining)}</p>`:""}${button(options.locale==="el"?"ΔΕΙΤΕ ΜΙΑ ΟΛΟΚΛΗΡΩΜΕΝΗ WEDDING STORY":"VIEW A COMPLETE WEDDING STORY",galleryUrl,false)}`;
    }
    return `<p style="margin:0 0 18px;text-align:center">${paragraphHtml(trimmed)}</p>`;
  }).join("\n");
}

function footerHtml(siteUrl:string){return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #d9d5cc"><tr><td align="center" style="padding:28px 16px 34px;font-family:Arial,Helvetica,sans-serif;color:#221f20;text-align:center"><p style="margin:0 0 5px;font-size:14px;line-height:20px;font-weight:700">Vasilis Moumkas | Fine Art Wedding Photographer</p><p style="margin:0 0 18px;font-size:12px;line-height:18px;color:#6c6864">A Refined Storytelling Experience. Documenting Life, Light &amp; Love.</p><p style="margin:0 0 18px;font-size:12px;line-height:18px">Based in Greece &mdash; Available worldwide</p><table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin-bottom:12px"><tr><td bgcolor="#ffffff" style="border:1px solid #221f20"><a href="tel:+306972218775" style="display:inline-block;padding:12px 18px;font-family:Arial,Helvetica,sans-serif;font-size:10px;line-height:14px;font-weight:700;letter-spacing:.04em;color:#221f20;text-decoration:none">CALL ME &middot; +30 697 22 18775</a></td></tr></table><table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td bgcolor="#221f20" style="border:1px solid #221f20"><a href="${escapeAttribute(siteUrl)}" target="_blank" style="display:inline-block;padding:12px 16px;font-family:Arial,Helvetica,sans-serif;font-size:10px;line-height:14px;font-weight:700;letter-spacing:.04em;color:#ffffff;text-decoration:none">WEBSITE</a></td><td width="8">&nbsp;</td><td bgcolor="#FFFFC4" style="border:1px solid #d8d89d"><a href="${instagramUrl}" target="_blank" style="display:inline-block;padding:12px 16px;font-family:Arial,Helvetica,sans-serif;font-size:10px;line-height:14px;font-weight:700;letter-spacing:.04em;color:#221f20;text-decoration:none">INSTAGRAM</a></td><td width="8">&nbsp;</td><td bgcolor="#ffffff" style="border:1px solid #221f20"><a href="${pinterestUrl}" target="_blank" style="display:inline-block;padding:12px 16px;font-family:Arial,Helvetica,sans-serif;font-size:10px;line-height:14px;font-weight:700;letter-spacing:.04em;color:#221f20;text-decoration:none">PINTEREST</a></td></tr></table></td></tr></table>`}

export function renderEmailDocument(bodyText:string,options:EmailRenderOptions){
  const siteUrl=(options.siteUrl||fallbackSiteUrl).replace(/\/$/,"");
  const headerImageUrl=absoluteUrl(options.headerImageUrl||fallbackHeaderPath,siteUrl);
  return `<!doctype html><html lang="${options.locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="x-apple-disable-message-reformatting"><title></title><!--[if mso]><style>table,td,p,a{font-family:Arial,Helvetica,sans-serif!important}</style><![endif]--></head><body style="margin:0;padding:0;background:#f3f0ea;color:#221f20"><div style="display:none;max-height:0;overflow:hidden;opacity:0">&nbsp;</div><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f3f0ea"><tr><td align="center" style="padding:20px 8px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:640px;background:#fffdf9"><tr><td><a href="${escapeAttribute(siteUrl)}" target="_blank"><img src="${escapeAttribute(headerImageUrl)}" width="640" alt="Santorini" style="display:block;width:100%;max-width:640px;height:auto;border:0"></a></td></tr><tr><td style="padding:42px 20px 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#221f20;text-align:center">${bodyHtml(bodyText,options)}</td></tr><tr><td>${footerHtml(siteUrl)}</td></tr></table></td></tr></table></body></html>`;
}

const signatureText=`Vasilis Moumkas | Fine Art Wedding Photographer\nA Refined Storytelling Experience. Documenting Life, Light & Love.\n\nBased in Greece - Available worldwide\nt +30 697 22 18775\nwww.vasilismoumkas.com\n\nConnect: Instagram | Pinterest`;
export function renderEmailText(bodyText:string){return `${normalizedTextBody(bodyText)}\n\n---\n\n${signatureText}`}
