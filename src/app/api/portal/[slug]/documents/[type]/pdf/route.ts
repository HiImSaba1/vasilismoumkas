import { getPortalBySlug } from "@/lib/client-portals";
import { renderClientDocumentPdf,type DownloadableDocumentType } from "@/lib/client-document-pdf";

const allowed=new Set<DownloadableDocumentType>(["contract","questionnaire","invoice"]);

export async function GET(request:Request,{params}:{params:Promise<{slug:string;type:string}>}){
  const{slug,type}=await params;
  if(!allowed.has(type as DownloadableDocumentType))return Response.json({message:"Unsupported document"},{status:400});
  const portal=await getPortalBySlug(slug);
  if(!portal)return Response.json({message:"Portal not found"},{status:404});
  const result=await renderClientDocumentPdf(portal.clientId,type as DownloadableDocumentType);
  if(!result)return Response.json({message:"Document not found"},{status:404});
  const download=new URL(request.url).searchParams.get("download")==="1";
  return new Response(Buffer.from(result.bytes),{headers:{"Content-Type":"application/pdf","Content-Disposition":`${download?"attachment":"inline"}; filename="${result.filename}"`,"Cache-Control":"private, no-store","X-Robots-Tag":"noindex, nofollow"}});
}
