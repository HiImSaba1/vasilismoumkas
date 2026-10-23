"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, CalendarClock, CalendarDays, CalendarRange, ContactRound, FilePlus2, Files, FileText, Images, LayoutDashboard, ListChecks, Mail, Menu, MonitorCog, PanelLeftClose, PanelLeftOpen, Search, Sparkles, UserRoundPlus, UsersRound, X } from "lucide-react";
import { logoutAction } from "./actions";
import { AdminTour } from "@/components/admin/AdminTour";
import { AdminLanguageSwitcher, AdminLocaleProvider } from "@/components/admin/AdminLocale";
import { WorkflowReminderCenter } from "@/components/admin/WorkflowReminderCenter";
import type { WorkflowReminder } from "@/lib/workflow-reminders";
import "./admin-interactions.css";

const navigation = [
  { label: "Overview", href: "/admin/overview", icon: LayoutDashboard },
  { label: "Journey Dashboard", href: "/admin/journeys", icon: ListChecks },
  { label: "Leads", href: "/admin/leads", icon: UserRoundPlus },
  { label: "Create Offer", href: "/admin/dashboard", icon: FilePlus2 },
  { label: "Offers", href: "/admin/offers", icon: Files },
  { label: "Clients", href: "/admin/clients", icon: ContactRound },
  { label: "Collaborators", href: "/admin/collaborators", icon: UsersRound },
  { label: "Calendar", href: "/admin/calendar", icon: CalendarDays },
  { label: "Onboarding", href: "/admin/onboarding", icon: UsersRound },
  { label: "Timelines", href: "/admin/timelines", icon: CalendarRange },
  { label: "Portfolio", href: "/admin/portfolio", icon: Images },
  { label: "Pages", href: "/admin/pages", icon: Files },
  { label: "Website", href: "/admin/website", icon: MonitorCog },
  { label: "SEO", href: "/admin/seo", icon: Search },
  { label: "Email Templates", href: "/admin/email-templates", icon: Mail },
  { label: "Document Templates", href: "/admin/document-templates", icon: FileText },
  { label: "Automation Queue", href: "/admin/automations", icon: CalendarClock },
  { label: "Guide", href: "/admin/guide", icon: BookOpen },
] as const;

export function AdminChrome({ children,reminders }: { children: React.ReactNode;reminders:WorkflowReminder[] }) {
  return <AdminLocaleProvider><AdminChromeContent reminders={reminders}>{children}</AdminChromeContent></AdminLocaleProvider>;
}

function AdminChromeContent({ children,reminders }: { children: React.ReactNode;reminders:WorkflowReminder[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);

  if (pathname === "/admin") return children;
  if (pathname.endsWith("/preview")) return <div data-admin-locale-isolated="true">{children}</div>;

  return (
    <div className={`admin-shell min-h-svh bg-soft-white text-ink-black lg:grid lg:transition-[grid-template-columns] lg:duration-1000 lg:ease-[cubic-bezier(0.19,1,0.22,1)] ${compact?"lg:grid-cols-[4.75rem_minmax(0,1fr)]":"lg:grid-cols-[17rem_minmax(0,1fr)]"}`}>
      <aside className={`${open ? "flex" : "hidden"} fixed inset-x-0 bottom-0 top-16 z-40 flex-col overflow-hidden bg-ink-black text-soft-white lg:sticky lg:top-0 lg:flex lg:h-svh`}>
        <div className={`border-b border-soft-white/15 transition-[padding] duration-1000 ease-[cubic-bezier(0.19,1,0.22,1)] ${compact?"px-2 py-4":"px-6 py-7"}`}>
          <Link href="/admin/overview" onClick={() => setOpen(false)} aria-label="Moumkas Studio overview" title={compact?"Moumkas Studio":undefined} className={`flex min-h-16 items-center overflow-hidden transition-all duration-1000 ease-[cubic-bezier(0.19,1,0.22,1)] ${compact?"justify-center":"justify-start"}`}><Sparkles className={`size-5 shrink-0 transition-all duration-1000 ease-[cubic-bezier(0.19,1,0.22,1)] ${compact?"opacity-100":"mr-0 w-0 opacity-0"}`}/><span className={`min-w-44 overflow-hidden transition-all duration-1000 ease-[cubic-bezier(0.19,1,0.22,1)] ${compact?"max-w-0 -translate-x-3 opacity-0":"max-w-48 translate-x-0 opacity-100"}`}><span className="block text-[10px] uppercase tracking-[0.24em] text-soft-white/50">Wedding CRM</span><span className="mt-2 block text-3xl uppercase leading-none tracking-[-0.04em]">Moumkas<br/>Studio</span></span></Link>
          <button type="button" onClick={()=>setCompact(value=>!value)} aria-pressed={compact} aria-label={compact?"Expand admin sidebar":"Collapse admin sidebar"} title={compact?"Show menu labels":"Show icons only"} className={`mt-4 hidden w-full items-center border border-soft-white/20 py-2 text-[12px]  uppercase text-soft-white/65 transition-all duration-1000 ease-[cubic-bezier(0.19,1,0.22,1)] hover:border-soft-yellow hover:text-soft-yellow lg:flex ${compact?"justify-center px-2":"justify-between px-3"}`}><span className={`overflow-hidden whitespace-nowrap transition-all duration-1000 ease-[cubic-bezier(0.19,1,0.22,1)] ${compact?"max-w-0 opacity-0":"max-w-32 opacity-100"}`}>Compact menu</span>{compact?<PanelLeftOpen className="size-4"/>:<PanelLeftClose className="size-4"/>}</button>
        </div>
        <nav aria-label="Admin navigation" className="flex-1 overflow-y-auto px-3 py-4">
          {navigation.map(({ label, href, icon: Icon }, index) => {
            const active = pathname === href || pathname.startsWith(`${href}/`) || (href === "/admin/pages" && pathname === "/admin/homepage");
            return (
              <Link key={href} href={href} onClick={() => setOpen(false)} aria-label={label} title={compact?label:undefined} aria-current={active ? "page" : undefined} className={`group flex items-center overflow-hidden border-b border-soft-white/10 py-3.5 text-sm uppercase tracking-[0.06em] transition-all duration-1000 ease-[cubic-bezier(0.19,1,0.22,1)] ${compact?"justify-center gap-0 px-2":"justify-start gap-3 px-3"} ${active ? "bg-soft-yellow text-ink-black" : "text-soft-white/70 hover:bg-soft-white/10 hover:text-soft-white"}`}>
                <span className={`shrink-0 overflow-hidden text-[10px] opacity-50 transition-all duration-1000 ease-[cubic-bezier(0.19,1,0.22,1)] ${compact?"w-0 opacity-0":"w-5"}`}>{String(index + 1).padStart(2, "0")}</span>
                <Icon className="h-4 w-4 shrink-0" />
                <span className={`overflow-hidden whitespace-nowrap transition-all duration-1000 ease-[cubic-bezier(0.19,1,0.22,1)] ${compact?"max-w-0 -translate-x-2 opacity-0":"max-w-48 translate-x-0 opacity-100"}`}>{label}</span>
              </Link>
            );
          })}
        </nav>
        <div className={`border-t border-soft-white/15 transition-[padding] duration-1000 ease-[cubic-bezier(0.19,1,0.22,1)] ${compact?"p-2":"p-5"}`}>
          <div aria-hidden={compact} className={`overflow-hidden transition-all duration-1000 ease-[cubic-bezier(0.19,1,0.22,1)] ${compact?"pointer-events-none max-h-0 -translate-x-2 opacity-0":"max-h-24 translate-x-0 opacity-100"}`}><AdminLanguageSwitcher /></div>
          <form action={logoutAction}>
            <button title={compact?"Sign out":undefined} aria-label="Sign out" className={`w-full border border-soft-white/25 py-3 text-sm  uppercase tracking-[0.16em] text-soft-white/70 transition-colors hover:border-soft-yellow hover:text-soft-yellow ${compact?"px-1 text-center":"px-4 text-left"}`}>{compact?"↗":"Sign out"}</button>
          </form>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-50 flex h-16 items-center justify-between bg-soft-white/95 px-5 backdrop-blur lg:px-8">
          <Link href="/admin/overview" className="flex items-center gap-2 uppercase tracking-[-0.03em] lg:hidden"><Sparkles className="h-4 w-4"/>Moumkas Studio</Link>
          <div className="hidden items-center gap-4 lg:flex"><p className="text-[11px] uppercase tracking-[0.22em] text-ink-black/45">Complete client journey · Greece</p>{pathname==="/admin/leads"&&<Link href="/admin/leads/manage" className="bg-soft-yellow px-3 py-2 text-[12px]  uppercase">Edit lead details</Link>}</div>
          <div className="flex items-center gap-2 lg:gap-4"><p className="hidden text-[11px] uppercase tracking-[0.22em] lg:block">Vasilis Moumkas</p><WorkflowReminderCenter reminders={reminders}/><button type="button" data-testid="admin-menu" aria-label={open ? "Close admin menu" : "Open admin menu"} aria-expanded={open} onClick={() => setOpen((value) => !value)} className="bg-transparent p-2 transition-colors hover:bg-ink-black hover:text-white lg:hidden">{open ? <X className="h-5 w-5"/> : <Menu className="h-5 w-5"/>}</button></div>
        </header>
        <div key={pathname} className="admin-page-enter min-h-[calc(100svh-4rem)]">{children}</div><AdminTour pathname={pathname.startsWith("/admin/clients/")&&!pathname.endsWith("/email")?"/admin/clients/[id]":pathname}/>
      </div>
    </div>
  );
}
