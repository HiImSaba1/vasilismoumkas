import Link from "next/link";
import { ArrowUpRight, Bot, FilePlus2, Files, HeartHandshake, Image, LayoutPanelLeft, Mail, PanelLeftClose, Route, UserRoundPlus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getAdminOverviewStats } from "@/lib/crm-records";

export default async function AdminOverviewPage() {
  const stats = await getAdminOverviewStats();
  const metrics = [
    ["Active leads", stats.leads], ["Live offers", stats.offers], ["Onboarding", stats.onboarding], ["Scheduled", stats.scheduled],
  ] as const;
  const actions = [
    { label: "Create offer", href: "/admin/dashboard", icon: FilePlus2, copy: "Build a personalized wedding or baptism proposal." },
    { label: "Add lead", href: "/admin/leads", icon: UserRoundPlus, copy: "Start the client journey from a new inquiry." },
    { label: "Onboarding", href: "/admin/onboarding", icon: HeartHandshake, copy: "Track questionnaire, agreement and deposit." },
    { label: "Email library", href: "/admin/email-templates", icon: Mail, copy: "Manage the eleven client journey messages." },
  ];
  const updates = [
    {path:"Leads → επιλογή lead → καρτέλα lead",href:"/admin/leads",icon:Route,title:"Νέα καρτέλα και Guided Workflow",items:["Άνοιξε ένα lead και πάτησε Continue Guided Workflow.","Ο οδηγός μένει μέσα στην καρτέλα και ανοίγει από το πραγματικό επόμενο βήμα.","Qualify: διάλεξε μία φορά Wedding/Baptism και GR/EN."]},
    {path:"Lead → Workflow → Next action",href:"/admin/leads",icon:LayoutPanelLeft,title:"Σωστή συνέχεια και ιστορικό",items:["Οι πραγματικές αποστολές ορίζουν το Next action.","Μετά το 003, επόμενο είναι το 004 και τα Upcoming ξεκινούν από 005.","Τα προηγούμενα βήματα σημειώνονται completed ή skipped automatically."]},
    {path:"Lead → Offer",href:"/admin/leads",icon:FilePlus2,title:"Καθαρή κατάσταση προσφοράς",items:["Χωρίς προσφορά: Create prefilled offer.","Με υπάρχουσα προσφορά: Revise offer.","Με αποδεκτή προσφορά: Offer accepted, χωρίς άσκοπη νέα δημιουργία."]},
    {path:"Guided Workflow → Send & Track",href:"/admin/leads",icon:Image,title:"Email και επιλογή εικόνας",items:["Φορτώνεται το πραγματικό επόμενο template.","Search εικόνας με ζευγάρι, project, τοποθεσία ή όνομα, π.χ. Alex.","Η επιλεγμένη εικόνα φαίνεται ολόκληρη και ενημερώνει το τελικό HTML preview."]},
    {path:"Email Templates → επιλογή template → Edit",href:"/admin/email-templates",icon:Mail,title:"Κοινό email image picker",items:["Ίδιο search, gallery, preview και Use default image με το Send & Track.","Το proposal button βρίσκεται πριν από το κλείσιμο και την υπογραφή.","Οι παράγραφοι και τα πλαϊνά περιθώρια έχουν διορθωθεί."]},
    {path:"Automation Queue",href:"/admin/automations",icon:Bot,title:"Ασφαλείς αυτοματισμοί",items:["Αυτόματη αποστολή μόνο για 002, 003, 007 και 009.","Δεν ξαναστέλνεται template που έχει ήδη παραδοθεί.","Υπάρχει 24ωρη προειδοποίηση και καθαρές ομάδες Waiting, Attention, Sending, Sent και Cancelled."]},
    {path:"Clients → επιλογή client",href:"/admin/clients",icon:LayoutPanelLeft,title:"Νέο client workspace",items:["Οι επιλογές μένουν συνεχόμενες δεξιά.","Η ενεργή επιλογή γίνεται σκούρα και ανοίγει στο μεγάλο αριστερό panel.","Offers, invoice, contract, questionnaire, timeline, mail και notes είναι συγκεντρωμένα."]},
    {path:"Client → Private files → View client portal",href:"/admin/clients",icon:Files,title:"Ιδιωτικά παραστατικά και Portal Home",items:["Admin upload PDF/JPG/PNG/WebP έως 5 MB.","Ο πελάτης βλέπει και κατεβάζει τα δικά του αρχεία από το νέο Home.","Τα uploads δεν αλλάζουν invoice total, balance ή payment status."]},
    {path:"Sidebar → switcher",href:"/admin/overview",icon:PanelLeftClose,title:"Περισσότερος χώρος εργασίας",items:["Το sidebar αλλάζει μεταξύ πλήρους και compact προβολής.","Στο compact mode παραμένουν μόνο τα icons.","Οι τίτλοι των Document Templates έγιναν μικρότεροι και δεν κόβονται."]},
  ];
  return (
    <main className="px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
      <div data-admin-locale-isolated="true" className="mb-6"><Link href="/admin/pending" className="inline-block border border-ink-black px-5 py-3 text-sm uppercase">Εκκρεμότητες · Τι χρειάζεται να γίνει →</Link></div><AdminPageHeader eyebrow="Studio command center" title="Overview" description="The complete wedding client journey—from first inquiry and personalized proposal to timeline, delivery and review." action={<Link href="/admin/dashboard" className="flex w-fit items-center gap-3 bg-ink-black px-5 py-4 text-sm  uppercase tracking-[0.15em] text-soft-white">Create offer <ArrowUpRight className="h-4 w-4" /></Link>} />
      <section className="mt-8 grid grid-cols-2 border-l border-t border-ink-black/20 xl:grid-cols-4">
        {metrics.map(([label, value]) => <div key={label} className="border-r border-b border-ink-black/20 bg-[#f7f3e9] p-5 sm:p-7"><p className="text-[10px] uppercase tracking-[0.18em] text-ink-black/45">{label}</p><p className="mt-5 font-[var(--font-karena)] text-6xl leading-none">{value}</p></div>)}
      </section>
      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between"><p className="text-sm  uppercase tracking-[0.18em]">Quick actions</p><span className={`px-2.5 py-1 text-[12px]  uppercase tracking-[0.14em] ${stats.database ? "bg-green-100 text-green-900" : "bg-soft-yellow"}`}>{stats.database ? "MySQL connected" : "Migration mode"}</span></div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {actions.map(({ label, href, icon: Icon, copy }) => <Link key={href} href={href} className="group flex min-h-48 min-w-0 flex-col justify-between border border-ink-black/20 p-5 transition-colors hover:bg-ink-black hover:text-soft-white"><Icon className="h-5 w-5" /><div className="min-w-0"><h2 className="mb-2 break-words !text-2xl !leading-tight uppercase tracking-normal">{label}</h2><p className="text-sm  leading-relaxed opacity-60">{copy}</p></div></Link>)}
        </div>
      </section>
      <section className="mt-12" data-todays-crm-updates>
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-ink-black/20 pb-4"><div><p className="text-[10px] uppercase tracking-[.18em] text-ink-black/45">Τι νέο υπάρχει σήμερα</p><h2 className="mt-2 !text-3xl font-light uppercase">Οδηγός νέων λειτουργιών</h2></div><span className="bg-soft-yellow px-3 py-2 text-[12px]  uppercase tracking-[.12em]">Τοπικά · αναμονή τελικού Sprint 21 PASS</span></div>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-ink-black/80">Βασίλη, ακολούθησε τη διαδρομή που γράφει κάθε κάρτα και έλεγξε τη λειτουργία που περιγράφεται. Οι κάρτες είναι προσωρινές και θα αφαιρεθούν μετά τον τελικό έλεγχο.</p>
        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{updates.map(({path,href,icon:Icon,title,items},index)=><Link key={path} href={href} data-overview-update-card className="group flex min-h-72 min-w-0 flex-col border border-ink-black/25 bg-[#f7f3e9] p-5 text-ink-black transition-colors hover:border-[#221f20] hover:bg-[#221f20] hover:text-white"><div className="flex items-start justify-between gap-3"><Icon className="size-5 shrink-0"/><span className="text-sm  font-semibold uppercase text-ink-black/65 group-hover:text-white">{String(index+1).padStart(2,"0")}</span></div><p className="mt-6 text-sm  font-semibold uppercase leading-relaxed tracking-[.08em] text-green-900 group-hover:text-white">{path}</p><h3 className="mt-2 !text-2xl font-medium uppercase leading-tight group-hover:text-white">{title}</h3><ul className="mt-4 grid gap-2 text-sm font-medium leading-relaxed text-ink-black/80 group-hover:text-white">{items.map(item=><li key={item} className="flex gap-2"><span aria-hidden="true">→</span><span>{item}</span></li>)}</ul><span className="mt-auto pt-5 text-sm  font-semibold uppercase underline group-hover:text-white">Άνοιγμα ενότητας →</span></Link>)}</div>
        <div className="mt-4 border-l-4 border-blue-500 bg-blue-50 p-4 text-sm  leading-relaxed text-blue-950"><strong>Επόμενο sprint:</strong> Google Calendar με διαθέσιμες, κλεισμένες και διπλοκρατημένες ημερομηνίες. Δεν έχει ενεργοποιηθεί ακόμη.</div>
      </section>
    </main>
  );
}
