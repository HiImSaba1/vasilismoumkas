import "server-only";
import type { RowDataPacket } from "mysql2/promise";
import { getDatabase } from "@/lib/database";

export type CalendarBooking={id:string;coupleNames:string;eventType:"wedding"|"baptism";eventDate:string;location:string|null;bookingStatus:string;email:string|null};
export type CalendarLeadInterest={id:string;coupleNames:string;eventType:"wedding"|"baptism";eventDate:string;status:string};

export async function listCalendarBookings():Promise<CalendarBooking[]>{
  const[rows]=await getDatabase().query<(RowDataPacket&{id:string;couple_names:string;event_type:string;event_date:string;location:string|null;booking_status:string|null;email:string|null})[]>(`SELECT c.id,c.couple_names,c.event_type,DATE_FORMAT(c.event_date,'%Y-%m-%d') event_date,COALESCE(c.reception_location,c.ceremony_location) location,o.booking_status,c.email
    FROM clients c LEFT JOIN onboarding o ON o.client_id=c.id
    WHERE c.event_date IS NOT NULL AND COALESCE(o.booking_status,'pending')<>'cancelled'
    ORDER BY c.event_date,c.couple_names`);
  return rows.filter(row=>/^\d{4}-\d{2}-\d{2}$/.test(row.event_date)).map(row=>({id:row.id,coupleNames:row.couple_names,eventType:row.event_type==="baptism"?"baptism":"wedding",eventDate:row.event_date,location:row.location,bookingStatus:row.booking_status??"pending",email:row.email}));
}

export async function listCalendarLeadInterests():Promise<CalendarLeadInterest[]>{
  const[rows]=await getDatabase().query<(RowDataPacket&{id:string;couple_names:string;event_type:string;event_date:string;status:string})[]>(`SELECT l.id,l.couple_names,l.event_type,DATE_FORMAT(l.event_date,'%Y-%m-%d') event_date,l.status
    FROM leads l
    WHERE l.event_date IS NOT NULL
      AND l.status IN ('new','awaiting-information','qualified','offer-draft','offer-sent','follow-up')
      AND NOT EXISTS (SELECT 1 FROM clients c WHERE c.lead_id=l.id)
    ORDER BY l.event_date,l.updated_at DESC`);
  return rows.filter(row=>/^\d{4}-\d{2}-\d{2}$/.test(row.event_date)).map(row=>({id:row.id,coupleNames:row.couple_names,eventType:row.event_type==="baptism"?"baptism":"wedding",eventDate:row.event_date,status:row.status}));
}

const escapeIcs=(value:string)=>value.replace(/\\/g,"\\\\").replace(/\r?\n/g,"\\n").replace(/,/g,"\\,").replace(/;/g,"\\;");
const compactDate=(value:string)=>value.replaceAll("-","");
const nextDate=(value:string)=>{const date=new Date(`${value}T00:00:00Z`);date.setUTCDate(date.getUTCDate()+1);return date.toISOString().slice(0,10)};

export function googleCalendarUrl(item:CalendarBooking){
  const title=`${item.eventType==="baptism"?"Baptism":"Wedding"} · ${item.coupleNames}`;
  const details=`Moumkas Studio client booking · ${item.bookingStatus}`;
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${compactDate(item.eventDate)}/${compactDate(nextDate(item.eventDate))}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(item.location??"")}`;
}

export function calendarIcs(items:CalendarBooking[]){
  const stamp=new Date().toISOString().replace(/[-:]/g,"").replace(/\.\d{3}Z$/,"Z");
  const events=items.map(item=>["BEGIN:VEVENT",`UID:client-${item.id}@vasilismoumkas.com`,`DTSTAMP:${stamp}`,`DTSTART;VALUE=DATE:${compactDate(item.eventDate)}`,`DTEND;VALUE=DATE:${compactDate(nextDate(item.eventDate))}`,`SUMMARY:${escapeIcs(`${item.eventType==="baptism"?"Baptism":"Wedding"} · ${item.coupleNames}`)}`,`DESCRIPTION:${escapeIcs(`Moumkas Studio · ${item.bookingStatus}`)}`,item.location?`LOCATION:${escapeIcs(item.location)}`:"","END:VEVENT"].filter(Boolean).join("\r\n")).join("\r\n");
  return ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Vasilis Moumkas//Studio CRM//EN","CALSCALE:GREGORIAN","METHOD:PUBLISH",events,"END:VCALENDAR",""].join("\r\n");
}
