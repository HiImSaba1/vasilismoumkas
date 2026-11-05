"use server";
import {z} from "zod";
import {requireAdmin} from "@/lib/admin-auth";
import {athensLocalToUtcSql} from "@/lib/athens-time";
import {recordExternalProposal} from "@/lib/external-email";
import {revalidateAdminWorkflow} from "@/lib/admin-workflow-revalidation";
export async function recordExternalProposalAction(_state:{success:boolean;message:string},form:FormData){
  try{
    await requireAdmin();
    const input=z.object({leadId:z.uuid(),offerId:z.coerce.number().int().positive(),recipient:z.email(),subject:z.string().trim().min(1).max(500),sentAt:z.string(),reference:z.string().trim().min(3).max(2000),confirmed:z.literal("yes")}).parse(Object.fromEntries(form));
    const sentAt=athensLocalToUtcSql(input.sentAt);
    if(!sentAt||new Date(sentAt.replace(" ","T")+"Z").getTime()>Date.now())throw new Error("Enter the actual past send date and time in Greece.");
    const created=await recordExternalProposal({...input,sentAt});
    revalidateAdminWorkflow({leadId:input.leadId});
    return{success:true,message:created?"Καταγράφηκε ως Gmail / εξωτερική αποστολή. Δεν στάλθηκε email. Τα 001/002/003 έχουν μπλοκαριστεί.":"Η εξωτερική αποστολή έχει ήδη καταγραφεί. Δεν δημιουργήθηκε δεύτερη εγγραφή."};
  }catch(error){return{success:false,message:error instanceof Error?error.message:"Unable to record external email."}}
}
