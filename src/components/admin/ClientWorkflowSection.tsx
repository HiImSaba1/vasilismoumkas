import { getClientWorkflow } from "@/lib/client-workflow";
import { ClientWorkflowTracker } from "./ClientWorkflowTracker";

export async function ClientWorkflowSection({leadId}:{leadId:string}){const workflow=await getClientWorkflow(leadId);return workflow?<ClientWorkflowTracker workflow={workflow}/>:null}
