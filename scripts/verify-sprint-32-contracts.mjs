import {readFile} from "node:fs/promises";
import {resolve} from "node:path";

const read=path=>readFile(resolve(process.cwd(),path),"utf8");
const checks=[];
const requireText=(source,pattern,label)=>{if(!pattern.test(source))throw new Error(`FAIL - ${label}`);checks.push(`PASS - ${label}`)};

const[email,calendarData,calendarPage,reservedDay,calendarRoute,chrome,pdfData,pdfRoute,clientPage]=await Promise.all([
  read("src/lib/email-delivery.ts"),
  read("src/lib/admin-calendar.ts"),
  read("src/app/admin/calendar/page.tsx"),
  read("src/app/admin/calendar/CalendarReservedDay.tsx"),
  read("src/app/api/admin/calendar.ics/route.ts"),
  read("src/app/admin/AdminChrome.tsx"),
  read("src/lib/client-document-pdf.ts"),
  read("src/app/api/admin/clients/[id]/documents/[type]/pdf/route.ts"),
  read("src/app/admin/clients/[id]/page.tsx"),
]);

requireText(email,/ownerReplyAddress=.*vasilis\.moumkas@gmail\.com[\s\S]*clientReplyToAddresses\(\).*fromAddress\(\).*internalRecipient\(\).*ownerReplyAddress\(\)/,"client Reply-To includes the studio sender and Vasilis Gmail with duplicate removal");
requireText(email,/sendTrackedEmail[\s\S]*replyTo:clientReplyToAddresses\(\)/,"tracked manual and automated template deliveries use the shared Reply-To list");
requireText(email,/sendWebsiteAcknowledgement[\s\S]*replyTo:clientReplyToAddresses\(\)/,"Template 000 website acknowledgements use the same Reply-To list");

requireText(chrome,/label: "Calendar", href: "\/admin\/calendar"/,"the admin sidebar exposes the Calendar tab");
requireText(calendarData,/FROM clients c[\s\S]*c\.event_date IS NOT NULL[\s\S]*booking_status,'pending'\)<>'cancelled'/,"calendar bookings come from dated, non-cancelled clients rather than leads");
requireText(calendarData,/FROM leads l[\s\S]*l\.status IN \('new','awaiting-information','qualified','offer-draft','offer-sent','follow-up'\)[\s\S]*NOT EXISTS \(SELECT 1 FROM clients c WHERE c\.lead_id=l\.id\)/,"calendar lead interests include active contenders without duplicating converted clients");
requireText(calendarData,/"BEGIN:VCALENDAR"[\s\S]*"VERSION:2\.0"[\s\S]*"END:VCALENDAR"/,"calendar export wraps events in a standards-based VCALENDAR document");
requireText(calendarData,/"BEGIN:VEVENT"[\s\S]*`DTSTART;VALUE=DATE:\$\{compactDate\(item\.eventDate\)\}`[\s\S]*`DTEND;VALUE=DATE:[\s\S]*"END:VEVENT"/,"calendar exports bookings as standards-based all-day VEVENT records");
requireText(calendarData,/calendar\.google\.com\/calendar\/render\?action=TEMPLATE/,"each booking can be opened in Google Calendar without storing OAuth credentials");
requireText(calendarPage,/Download \.ics[\s\S]*Weddings[\s\S]*Baptisms[\s\S]*Upcoming bookings[\s\S]*Google/,"calendar page shows event counters, full export and per-event Google actions");
requireText(calendarPage,/Array\.from\(\{length:3\},\(_,offset\)=>.*YearCalendar[\s\S]*year=\{currentYear\+offset\}/,"calendar page presents the current year and next two years");
requireText(calendarPage,/<details className="group\/year[\s\S]*<summary[\s\S]*\{year\}[\s\S]*group-open\/year:rotate-45/,"each year starts as a collapsed accordion card and opens from its year heading");
requireText(calendarPage,/Array\.from\(\{length:12\}[\s\S]*grid-cols-7[\s\S]*CalendarReservedDay[\s\S]*reserved\.get\(date\)[\s\S]*interests\.get\(date\)/,"the current-year calendar renders all 12 month day grids with client and lead date records");
requireText(calendarPage,/bg-red-700[\s\S]*Wedding[\s\S]*bg-yellow-300[\s\S]*Baptism[\s\S]*Interested lead/,"calendar legend distinguishes weddings, baptisms and interested leads");
requireText(calendarPage,/hover:z-50 focus-within:z-50[\s\S]*CalendarReservedDay key=\{date\}/,"reserved days use the event-driven tooltip component above the month cards");
requireText(reservedDay,/handlers=\{onMouseEnter:openTooltip,onMouseLeave:closeTooltip,onFocus:openTooltip,onBlur:closeTooltip\}[\s\S]*phase==="open"\?"opacity-100 transition-none":"opacity-0 transition-opacity duration-300 ease-out"/,"calendar tooltips open immediately under the pointer and fade only after pointer exit");
requireText(reservedDay,/Clients · \$\{bookings\.length\}[\s\S]*item\.coupleNames[\s\S]*Interested leads · \$\{interests\.length\}/,"date tooltips list every client and interested lead on the selected date");
requireText(reservedDay,/bg-red-700[\s\S]*bg-yellow-300[\s\S]*ring-green-300[\s\S]*ring-blue-300[\s\S]*border-dashed[\s\S]*No client or active lead/,"calendar date cells use event colors with secondary booking-status rings and explain available dates");
requireText(reservedDay,/eventTypes\.has\("wedding"\)\?"W"[\s\S]*eventTypes\.has\("baptism"\)\?"B"[\s\S]*\{eventCode\}/,"calendar cells visibly identify wedding and baptism dates with W and B markers");
requireText(reservedDay,/total>1[\s\S]*bg-amber-300[\s\S]*\{total\}/,"dates with multiple clients or leads show the complete record count in a yellow badge");
requireText(calendarRoute,/await requireAdmin\(\)[\s\S]*calendarIcs\(await listCalendarBookings\(\)\)[\s\S]*text\/calendar/,"private calendar export requires an authenticated admin");

requireText(pdfData,/LEFT JOIN lead_document_records d ON d\.lead_id=c\.lead_id AND d\.document_type=\?[\s\S]*ORDER BY d\.updated_at DESC LIMIT 1/,"PDF rendering uses the newest stored client document and can fall back to a safe draft before provisioning");
requireText(pdfData,/resolveContractForWorkflowProfile\(data\.contract_text,row\.event_type,language\)/,"contract PDF keeps the client's event and language agreement profile");
requireText(pdfData,/ELECTRONIC ACCEPTANCE RECORD[\s\S]*signed_name[\s\S]*signed_at/,"signed contract PDFs preserve the electronic acceptance name and timestamp");
requireText(pdfRoute,/await requireAdmin\(\)[\s\S]*allowed\.has[\s\S]*Content-Type":"application\/pdf"/,"PDF downloads are restricted to authenticated admins and allowed document types");
for(const type of ["invoice","contract","questionnaire"])requireText(clientPage,new RegExp(`DocumentPdfLink clientId=\\{client\\.id\\} type="${type}"`),`client workspace exposes the ${type} PDF download when its record exists`);
requireText(chrome,/transition-\[grid-template-columns\][\s\S]*duration-1000[\s\S]*cubic-bezier\(0\.19,1,0\.22,1\)/,"desktop compact sidebar width opens and closes with a one-second cubic-bezier transition");
requireText(chrome,/compact\?"max-w-0 -translate-x-2 opacity-0":"max-w-48 translate-x-0 opacity-100"/,"sidebar labels animate instead of being abruptly mounted or removed");

console.log(checks.join("\n"));
console.log(`PASS - ${checks.length} Sprint 32 reply-to, calendar and admin PDF contracts verified.`);
