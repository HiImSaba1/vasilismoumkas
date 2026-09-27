import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminTimeline } from "@/lib/timelines";
export async function GET(_request:Request,{params}:{params:Promise<{slug:string}>}){try{await requireAdmin();const{slug}=await params;const timeline=await getAdminTimeline(decodeURIComponent(slug));return timeline?NextResponse.json(timeline):NextResponse.json({error:"Not found"},{status:404})}catch{return NextResponse.json({error:"Unauthorized"},{status:401})}}
