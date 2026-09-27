import { NextResponse } from "next/server";
import { getPortalBySlug } from "@/lib/client-portals";
import { readClientFile } from "@/lib/client-files";

export const runtime="nodejs";
export async function GET(_request:Request,{params}:{params:Promise<{slug:string;fileId:string}>}){const{slug,fileId}=await params;const portal=await getPortalBySlug(slug);if(!portal)return new NextResponse("Not found",{status:404});const file=await readClientFile(portal.clientId,fileId);if(!file)return new NextResponse("Not found",{status:404});const encoded=encodeURIComponent(file.originalName);return new NextResponse(new Uint8Array(file.buffer),{headers:{"Content-Type":file.mimeType,"Content-Length":String(file.sizeBytes),"Content-Disposition":`attachment; filename*=UTF-8''${encoded}`,"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}})}
