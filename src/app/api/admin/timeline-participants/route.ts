import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { listLeads } from "@/lib/leads";
import { listClients } from "@/lib/clients";

export async function GET(){
  await requireAdmin();
  const[leads,clients]=await Promise.all([listLeads(),listClients()]);
  return NextResponse.json(leads.map(lead=>{const client=clients.find(item=>item.leadId===lead.id);return{leadId:lead.id,clientId:client?.id??null,names:lead.coupleNames,date:lead.eventDate??"",status:lead.status}}));
}
