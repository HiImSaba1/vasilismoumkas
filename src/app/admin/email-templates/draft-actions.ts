"use server";
import {z} from "zod";
import {requireAdmin} from "@/lib/admin-auth";
import {getClient} from "@/lib/clients";
import {getLead} from "@/lib/leads";
import {getEmailTemplate} from "@/lib/email-templates";
import {emailDraftSchema,readEmailDraft,writeEmailDraft} from "@/lib/email-drafts";
const scopeSchema=z.object({entityField:z.enum(["id","clientId"]),entityId:z.uuid(),templateId:z.string().regex(/^00\d$/),locale:z.enum(["el","en"])}).strict();
export type EmailDraftScope=z.infer<typeof scopeSchema>;
async function draftKey(scope:EmailDraftScope){
  const record=scope.entityField==="clientId"?await getClient(scope.entityId):await getLead(scope.entityId);
  if(!record)throw new Error("Lead/client not found.");
  const template=await getEmailTemplate(scope.templateId,record.eventType,scope.locale);
  if(!template?.isActive)throw new Error("Template is unavailable.");
  return `email-draft:${scope.entityField}:${record.id}:${record.eventType}:${scope.locale}:${scope.templateId}`;
}
export async function loadEmailDraftAction(input:unknown){
  try{await requireAdmin();const key=await draftKey(scopeSchema.parse(input));return{success:true as const,...await readEmailDraft(key)}}catch(error){return{success:false as const,message:error instanceof Error?error.message:"Unable to load draft."}}
}
export async function saveEmailDraftAction(input:unknown){
  try{await requireAdmin();const parsed=z.object({scope:scopeSchema,expectedRevision:z.number().int().nonnegative(),draft:emailDraftSchema.nullable()}).strict().parse(input);const key=await draftKey(parsed.scope);return{success:true as const,...await writeEmailDraft(key,parsed.draft,parsed.expectedRevision)}}catch(error){return{success:false as const,message:error instanceof Error?error.message:"Unable to save draft."}}
}
