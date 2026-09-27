import { requireAdmin } from "@/lib/admin-auth";
import { calendarIcs,listCalendarBookings } from "@/lib/admin-calendar";

export async function GET(){
  await requireAdmin();
  const body=calendarIcs(await listCalendarBookings());
  return new Response(body,{headers:{"Content-Type":"text/calendar; charset=utf-8","Content-Disposition":"attachment; filename=vasilis-moumkas-client-calendar.ics","Cache-Control":"private, no-store"}});
}
