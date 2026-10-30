import "server-only";
import { listAutomationJobs } from "@/lib/automations";
import { listJourneyDashboardItems, type JourneyDashboardItem } from "@/lib/journey-dashboard";

export type WorkflowReminder={id:string;kind:"workflow"|"automation";priority:"critical"|"required";clientName:string;title:string;description:string;href:string;actionLabel:string};

export async function listWorkflowReminders(existingJourneys?:JourneyDashboardItem[]):Promise<WorkflowReminder[]>{
  const[journeys,jobs]=await Promise.all([existingJourneys??listJourneyDashboardItems(),listAutomationJobs()]);
  const workflowReminders:WorkflowReminder[]=journeys.filter(item=>item.group==="do-now"&&item.currentStep?.requirement==="required").map(item=>({id:`workflow:${item.leadId}:${item.currentStep!.key}`,kind:"workflow",priority:item.currentStep!.key==="004"?"critical":"required",clientName:item.coupleNames,title:`Step ${item.currentStep!.number} needs attention`,description:item.currentStep!.description,href:item.actionHref,actionLabel:item.actionLabel}));
  const automationReminders:WorkflowReminder[]=jobs.filter(job=>job.status==="failed"||job.status==="scheduled"&&job.isDue).map(job=>({id:`automation:${job.id}`,kind:"automation",priority:job.status==="failed"?"critical":"required",clientName:job.clientName??"Unnamed client",title:job.status==="failed"?"Email automation failed":"Email automation is due",description:job.status==="failed"?(job.lastError??"Open the queue, correct the cause and retry once."):`Template ${job.templateId??"—"} is ready for the automation runner.`,href:"/admin/automations",actionLabel:"Open Automation Queue"}));
  return[...workflowReminders,...automationReminders].sort((a,b)=>Number(b.priority==="critical")-Number(a.priority==="critical")||a.clientName.localeCompare(b.clientName));
}
