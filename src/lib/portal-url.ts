export function normalizePortalSlugValue(slug:string){
  try{return decodeURIComponent(slug).normalize("NFC")}catch{return slug.normalize("NFC")}
}

export function portalSlugPath(slug:string){
  return encodeURIComponent(normalizePortalSlugValue(slug));
}
