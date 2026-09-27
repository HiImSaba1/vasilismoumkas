import "server-only";
import { listClients } from "@/lib/clients";
import { getClientWorkflow, type WorkflowStep } from "@/lib/client-workflow";
import { listLeads } from "@/lib/leads";

export type JourneyGroup="do-now"|"do-next"|"waiting"|"completed";
export type JourneyDashboardItem={
  leadId:string;
  clientId:string|null;
  coupleNames:string;
  email:string|null;
  eventType:"wedding"|"baptism";
  eventDate:string|null;
  group:JourneyGroup;
  currentStep:WorkflowStep|null;
  completedCount:number;
  totalCount:number;
  actionHref:string;
  actionLabel:string;
  instruction:string;
};

export async function listJourneyDashboardItems(){
  const[leads,clients]=await Promise.all([listLeads(),listClients()]);
  const clientByLead=new Map(clients.filter(client=>client.leadId).map(client=>[client.leadId!,client]));
  const activeLeads=leads.filter(lead=>lead.status!=="lost");
  const workflows=await Promise.all(activeLeads.map(lead=>getClientWorkflow(lead.id)));
  return activeLeads.flatMap((lead,index):JourneyDashboardItem[]=>{
    const workflow=workflows[index];
    if(!workflow)return[];
    const client=clientByLead.get(lead.id)??null;
    const current=workflow.currentStep;
    const group:JourneyGroup=workflow.isComplete?"completed":workflow.waitingFor?"waiting":current?.requirement==="conditional"?"do-next":"do-now";
    const fallbackHref=client?`/admin/clients/${client.id}#workflow`:`/admin/leads/${lead.id}`;
    const instruction=workflow.isComplete?"Every required workflow step is complete.":workflow.waitingFor?.title??(current?`${current.number} · ${current.title}`:"Review this journey before continuing.");
    return[{leadId:lead.id,clientId:client?.id??null,coupleNames:client?.coupleNames??lead.coupleNames,email:client?.email??lead.email,eventType:lead.eventType,eventDate:client?.eventDate??lead.eventDate,group,currentStep:current,completedCount:workflow.completedCount,totalCount:workflow.totalCount,actionHref:workflow.nextAction?.href??fallbackHref,actionLabel:workflow.nextAction?.label??(workflow.isComplete?"Open completed journey":"Open journey"),instruction}];
  });
}
