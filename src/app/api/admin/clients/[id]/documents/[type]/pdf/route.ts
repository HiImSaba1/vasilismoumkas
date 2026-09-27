import { requireAdmin } from "@/lib/admin-auth";
import { renderClientDocumentPdf,type DownloadableDocumentType } from "@/lib/client-document-pdf";

const allowed=new Set<DownloadableDocumentType>(["contract","questionnaire","invoice"]);
export async function GET(_:Request,{params}:{params:Promise<{id:string;type:string}>}){
  await requireAdmin();const{id,type}=await params;if(!allowed.has(type as DownloadableDocumentType))return Response.json({message:"Unsupported document"},{status:400});const result=await renderClientDocumentPdf(id,type as DownloadableDocumentType);if(!result)return Response.json({message:"Document not found"},{status:404});return new Response(Buffer.from(result.bytes),{headers:{"Content-Type":"application/pdf","Content-Disposition":`attachment; filename="${result.filename}"`,"Cache-Control":"private, no-store"}});
}
