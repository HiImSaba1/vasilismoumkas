import Link from "next/link";
import {requireAdmin} from "@/lib/admin-auth";
import {listJourneyDashboardItems} from "@/lib/journey-dashboard";
import {listWorkflowReminders} from "@/lib/workflow-reminders";
import {buildPendingActions} from "@/lib/pending-actions";
import {PendingActionsTable} from "@/components/admin/PendingActionsTable";
export default async function PendingPage(){
  await requireAdmin();
  const journeys=await listJourneyDashboardItems();
  const reminders=await listWorkflowReminders(journeys);
  return <main className="px-5 py-8 sm:px-8 lg:px-10 lg:py-12"><div data-admin-locale-isolated="true"><p className="text-[12px] uppercase leading-relaxed tracking-widest opacity-70">CRM · Επόμενες ενέργειες</p><h1 className="mt-3 !text-4xl">Εκκρεμότητες</h1><span className="mt-4 block max-w-5xl text-xl leading-[1.1em] opacity-70">Οι ειδοποιήσεις, τα απαιτούμενα βήματα και όσα περιμένουν πελάτη βρίσκονται εδώ. Η λίστα ενημερώνεται από τις πραγματικές καρτέλες και δεν στέλνει email. Η ημερομηνία δίπλα στον πελάτη αφορά την εκδήλωση, όχι προθεσμία πληρωμής.</span><div className="mt-6 flex flex-wrap gap-3 text-lg"><Link href="/admin/journeys" className="border border-ink-black px-5 py-3 text-center uppercase transition-colors hover:bg-ink-black hover:text-white">Αναλυτική πορεία και ιστορικό</Link><Link href="/admin/automations" className="border border-ink-black px-5 py-3 text-center uppercase transition-colors hover:bg-ink-black hover:text-white">Queue και ιστορικό αυτοματισμών</Link></div></div><PendingActionsTable items={buildPendingActions(journeys,reminders)}/></main>;
}
