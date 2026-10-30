import type {JourneyDashboardItem} from "@/lib/journey-dashboard";
import type {WorkflowReminder} from "@/lib/workflow-reminders";

export type PendingAction={id:string;clientName:string;eventDate:string|null;title:string;description:string;href:string;actionLabel:string;status:"owner"|"waiting"|"next"|"failed";kind:"workflow"|"automation";priority:"critical"|"required";};
// Reuse persisted workflow evidence. No completion flags, email sends or writes.
export function buildPendingActions(journeys:JourneyDashboardItem[],reminders:WorkflowReminder[]):PendingAction[]{
  const rows:PendingAction[]=journeys.filter(item=>item.group!=="completed").map<PendingAction>(item=>({
    id:`journey:${item.leadId}`,clientName:item.coupleNames,eventDate:item.eventDate,
    title:item.instruction,description:item.group==="waiting"?item.instruction:item.currentStep?.description??item.instruction,
    href:item.actionHref,actionLabel:item.actionLabel,status:item.group==="waiting"?"waiting":item.group==="do-next"?"next":"owner",
    kind:"workflow",priority:item.currentStep?.key==="004"?"critical":"required",
  }));
  for(const reminder of reminders.filter(item=>item.kind==="automation"))rows.push({...reminder,eventDate:null,status:reminder.priority==="critical"?"failed":"owner"});
  return rows.sort((a,b)=>Number(b.priority==="critical")-Number(a.priority==="critical")||(a.eventDate??"9999").localeCompare(b.eventDate??"9999")||a.clientName.localeCompare(b.clientName));
}
