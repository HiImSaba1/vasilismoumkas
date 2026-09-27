import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { runDueAutomations } from "@/lib/automation-runner";
import { prepareAutomationRun,recordAutomationRun,sendTomorrowAutomationDigest } from "@/lib/automations";
const authorized=(request:Request)=>{const expected=process.env.AUTOMATION_SECRET;if(!expected||expected.length<32)return false;const supplied=request.headers.get("authorization")?.replace(/^Bearer\s+/i,"")??"";const a=Buffer.from(expected),b=Buffer.from(supplied);return a.length===b.length&&timingSafeEqual(a,b)};
export async function POST(request:Request){if(!authorized(request))return NextResponse.json({error:"Unauthorized"},{status:401});await prepareAutomationRun();const preview=await sendTomorrowAutomationDigest();const result=await runDueAutomations();if(!("reason" in result))await recordAutomationRun(result);return NextResponse.json({...result,preview},{status:"reason" in result?503:200})}
