import { getPortalBySlug } from "@/lib/client-portals";
import { renderClientDocumentPdf } from "@/lib/client-document-pdf";

// Backward-compatible endpoint used by older portal emails. It delegates to
// the same Unicode-safe renderer as the current document download controls.
export async function GET(_:Request,{params}:{params:Promise<{slug:string}>}){
  const portal=await getPortalBySlug((await params).slug);
  if(!portal)return Response.json({message:"Portal not found"},{status:404});
  const result=await renderClientDocumentPdf(portal.clientId,"contract");
  if(!result)return Response.json({message:"Contract not found"},{status:404});
  return new Response(Buffer.from(result.bytes),{headers:{"Content-Type":"application/pdf","Content-Disposition":`attachment; filename="${result.filename}"`,"Cache-Control":"private, no-store","X-Robots-Tag":"noindex, nofollow"}});
}
