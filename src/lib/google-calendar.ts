import "server-only";
import { createCipheriv,createDecipheriv,createHash,randomBytes } from "node:crypto";
import type { RowDataPacket } from "mysql2/promise";
import { getDatabase } from "@/lib/database";
import { listCalendarBookings } from "@/lib/admin-calendar";

const calendarScope="https://www.googleapis.com/auth/calendar.events";
const scopes=["openid","email",calendarScope];
const googleRequestTimeoutMs=15_000;
const googleFetch=(input:string|URL,init:RequestInit={})=>fetch(input,{...init,signal:AbortSignal.timeout(googleRequestTimeoutMs)});
const required=(name:string)=>{const value=process.env[name]?.trim();if(!value)throw new Error(`${name} is not configured.`);return value};
const tokenKey=()=>{const secret=required("GOOGLE_CALENDAR_TOKEN_KEY");if(secret.length<32)throw new Error("GOOGLE_CALENDAR_TOKEN_KEY must contain at least 32 characters.");return createHash("sha256").update(secret).digest()};
const redirectUri=()=>process.env.GOOGLE_CALENDAR_REDIRECT_URI?.trim()||`${required("NEXT_PUBLIC_SITE_URL").replace(/\/$/,"")}/api/admin/google-calendar/callback`;
const tomorrow=(value:string)=>{const date=new Date(`${value}T00:00:00Z`);date.setUTCDate(date.getUTCDate()+1);return date.toISOString().slice(0,10)};
const athensToday=()=>new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Athens",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());

export function googleCalendarConfigured(){return Boolean(process.env.GOOGLE_CALENDAR_CLIENT_ID&&process.env.GOOGLE_CALENDAR_CLIENT_SECRET&&process.env.GOOGLE_CALENDAR_TOKEN_KEY&&process.env.NEXT_PUBLIC_SITE_URL)}
export function googleAuthorizationUrl(state:string){const url=new URL("https://accounts.google.com/o/oauth2/v2/auth");url.search=new URLSearchParams({client_id:required("GOOGLE_CALENDAR_CLIENT_ID"),redirect_uri:redirectUri(),response_type:"code",access_type:"offline",prompt:"consent",include_granted_scopes:"true",scope:scopes.join(" "),state}).toString();return url.toString()}

const encrypt=(plain:string)=>{const iv=randomBytes(12);const cipher=createCipheriv("aes-256-gcm",tokenKey(),iv);const encrypted=Buffer.concat([cipher.update(plain,"utf8"),cipher.final()]);return{ciphertext:encrypted.toString("base64"),iv:iv.toString("base64"),tag:cipher.getAuthTag().toString("base64")}};
const decrypt=(ciphertext:string,iv:string,tag:string)=>{const decipher=createDecipheriv("aes-256-gcm",tokenKey(),Buffer.from(iv,"base64"));decipher.setAuthTag(Buffer.from(tag,"base64"));return Buffer.concat([decipher.update(Buffer.from(ciphertext,"base64")),decipher.final()]).toString("utf8")};

type ConnectionRow=RowDataPacket&{account_email:string;calendar_id:string;refresh_token_ciphertext:string;refresh_token_iv:string;refresh_token_tag:string;connected_at:Date;last_sync_at:Date|null};
async function connection(){const[rows]=await getDatabase().query<ConnectionRow[]>("SELECT account_email,calendar_id,refresh_token_ciphertext,refresh_token_iv,refresh_token_tag,connected_at,last_sync_at FROM google_calendar_connections WHERE id=1 LIMIT 1");return rows[0]??null}
export async function googleCalendarStatus(){let row:ConnectionRow|null=null;try{row=await connection()}catch{}return{configured:googleCalendarConfigured(),connected:Boolean(row),accountEmail:row?.account_email??null,connectedAt:row?.connected_at?new Date(row.connected_at).toISOString():null,lastSyncAt:row?.last_sync_at?new Date(row.last_sync_at).toISOString():null}}

export async function exchangeGoogleCode(code:string){
  const response=await googleFetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({code,client_id:required("GOOGLE_CALENDAR_CLIENT_ID"),client_secret:required("GOOGLE_CALENDAR_CLIENT_SECRET"),redirect_uri:redirectUri(),grant_type:"authorization_code"}),cache:"no-store"});
  const tokens=await response.json() as {access_token?:string;refresh_token?:string;scope?:string;error_description?:string};if(!response.ok||!tokens.access_token||!tokens.refresh_token)throw new Error(tokens.error_description||"Google did not return offline Calendar access. Reconnect and grant access.");
  const profileResponse=await googleFetch("https://openidconnect.googleapis.com/v1/userinfo",{headers:{Authorization:`Bearer ${tokens.access_token}`},cache:"no-store"});const profile=await profileResponse.json() as {email?:string};if(!profileResponse.ok||!profile.email)throw new Error("Google account email could not be verified.");
  const secret=encrypt(tokens.refresh_token);await getDatabase().execute("INSERT INTO google_calendar_connections (id,account_email,calendar_id,refresh_token_ciphertext,refresh_token_iv,refresh_token_tag,scope) VALUES (1,?,'primary',?,?,?,?) ON DUPLICATE KEY UPDATE account_email=VALUES(account_email),refresh_token_ciphertext=VALUES(refresh_token_ciphertext),refresh_token_iv=VALUES(refresh_token_iv),refresh_token_tag=VALUES(refresh_token_tag),scope=VALUES(scope),connected_at=CURRENT_TIMESTAMP,last_sync_at=NULL",[profile.email,secret.ciphertext,secret.iv,secret.tag,tokens.scope??calendarScope]);
}

async function accessToken(row:ConnectionRow){const refreshToken=decrypt(row.refresh_token_ciphertext,row.refresh_token_iv,row.refresh_token_tag);const response=await googleFetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({client_id:required("GOOGLE_CALENDAR_CLIENT_ID"),client_secret:required("GOOGLE_CALENDAR_CLIENT_SECRET"),refresh_token:refreshToken,grant_type:"refresh_token"}),cache:"no-store"});const data=await response.json() as {access_token?:string;error_description?:string};if(!response.ok||!data.access_token)throw new Error(data.error_description||"Google Calendar access expired. Reconnect the account.");return data.access_token}

export async function syncGoogleCalendar(){
  const row=await connection();if(!row)throw new Error("Connect Google Calendar first.");const token=await accessToken(row);const bookings=(await listCalendarBookings()).filter(item=>item.eventDate>=athensToday());let synced=0;const failures:string[]=[];
  for(const item of bookings){
    try{
      const[eventRows]=await getDatabase().query<(RowDataPacket&{google_event_id:string|null})[]>("SELECT google_event_id FROM google_calendar_events WHERE client_id=? LIMIT 1",[item.id]);
      let existing=eventRows[0]?.google_event_id??null;
      const base=`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(row.calendar_id)}/events`;
      const headers={Authorization:`Bearer ${token}`,"Content-Type":"application/json"};
      if(!existing){const lookup=new URL(base);lookup.searchParams.set("privateExtendedProperty",`moumkasClientId=${item.id}`);lookup.searchParams.set("showDeleted","false");lookup.searchParams.set("singleEvents","true");const lookupResponse=await googleFetch(lookup,{headers,cache:"no-store"});if(lookupResponse.ok){const result=await lookupResponse.json() as {items?:Array<{id?:string}>};existing=result.items?.find(candidate=>candidate.id)?.id??null}}
      const body={summary:`${item.eventType==="baptism"?"Baptism":"Wedding"} · ${item.coupleNames}`,description:`Moumkas Studio CRM · ${item.bookingStatus}\nClient ID: ${item.id}`,colorId:item.eventType==="baptism"?"5":"11",location:item.location??undefined,start:{date:item.eventDate},end:{date:tomorrow(item.eventDate)},extendedProperties:{private:{moumkasClientId:item.id}}};
      let response=await googleFetch(existing?`${base}/${encodeURIComponent(existing)}`:base,{method:existing?"PUT":"POST",headers,body:JSON.stringify(body),cache:"no-store"});
      if(existing&&response.status===404)response=await googleFetch(base,{method:"POST",headers,body:JSON.stringify(body),cache:"no-store"});
      const event=await response.json() as {id?:string;error?:{message?:string}};if(!response.ok||!event.id)throw new Error(event.error?.message||`Google rejected ${item.coupleNames}.`);
      await getDatabase().execute("INSERT INTO google_calendar_events (client_id,google_event_id,sync_status,last_error,last_attempt_at) VALUES (?,?,'synced',NULL,CURRENT_TIMESTAMP) ON DUPLICATE KEY UPDATE google_event_id=VALUES(google_event_id),sync_status='synced',last_error=NULL,last_attempt_at=CURRENT_TIMESTAMP,synced_at=CURRENT_TIMESTAMP",[item.id,event.id]);synced++;
    }catch(error){const message=error instanceof Error?error.message:"Unknown Google Calendar error";failures.push(`${item.coupleNames}: ${message}`);await getDatabase().execute("INSERT INTO google_calendar_events (client_id,google_event_id,sync_status,last_error,last_attempt_at) VALUES (?,NULL,'failed',?,CURRENT_TIMESTAMP) ON DUPLICATE KEY UPDATE sync_status='failed',last_error=VALUES(last_error),last_attempt_at=CURRENT_TIMESTAMP",[item.id,message.slice(0,4000)])}
  }
  await getDatabase().execute("UPDATE google_calendar_connections SET last_sync_at=CURRENT_TIMESTAMP WHERE id=1");if(failures.length)throw new Error(`${synced} events synced; ${failures.length} failed. ${failures.slice(0,3).join(" | ")}`);return synced;
}

export async function disconnectGoogleCalendar(){const row=await connection();if(row){try{const token=decrypt(row.refresh_token_ciphertext,row.refresh_token_iv,row.refresh_token_tag);await googleFetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(token)}`,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},cache:"no-store"})}catch{}}await getDatabase().execute("DELETE FROM google_calendar_events");await getDatabase().execute("DELETE FROM google_calendar_connections WHERE id=1")}
