import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CollapsibleAdminCard } from "@/components/admin/CollapsibleAdminCard";
import { listOffers, OFFER_VALIDITY_DAYS } from "@/lib/offers";
import { statusClass } from "@/lib/admin-status";
import { DeleteOfferButton } from "./DeleteOfferButton";
import { OfferDecisionControls } from "./OfferDecisionControls";
import { markOfferSentAction, regenerateOfferAction, revokeOfferAction } from "./actions";

const date = (value: string | null) => value
  ? new Date(value).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })
  : "—";
const monthKey=(value:string)=>value.slice(0,7);
const monthLabel=(key:string)=>new Date(`${key}-01T12:00:00`).toLocaleDateString("en-GB",{month:"long",year:"numeric"});

export default async function OffersPage() {
  const allOffers = await listOffers();
  const offers=[...allOffers].sort((a,b)=>new Date(b.updatedAt).getTime()-new Date(a.updatedAt).getTime());
  const expired=offers.filter(offer=>offer.status==="expired");
  const current=offers.filter(offer=>offer.status!=="expired");
  const monthly=[...current.reduce((groups,offer)=>{const key=monthKey(offer.updatedAt);groups.set(key,[...(groups.get(key)??[]),offer]);return groups},new Map<string,typeof offers>())];
  const renderOffer=(offer:(typeof offers)[number]) => {
    const editable = offer.status === "draft" || offer.status === "revoked";
    const packages = Object.values(offer.payload).flatMap((value) => value && typeof value === "object" && !Array.isArray(value) && typeof (value as Record<string, unknown>).ph === "string" ? [String((value as Record<string, unknown>).ph)] : []);
    return <CollapsibleAdminCard key={offer.slug} title={offer.clientName ?? "Unnamed client"} subtitle={`${offer.slug} · ${offer.viewCount} open${offer.viewCount === 1 ? "" : "s"}`} className={statusClass(offer.status)} badges={<><span className={`px-2 py-1 text-[12px]  uppercase ${offer.status === "accepted" ? "bg-green-200 text-ink-black" : offer.status === "revoked" || offer.status === "rejected" ? "bg-red-100 text-ink-black" : "bg-soft-yellow text-ink-black"}`}>{offer.status}</span><span className="border border-current/20 px-2 py-1 text-[12px]  uppercase">{offer.eventType} · {offer.language}</span>{offer.viewCount > 1 && <span className="border border-current/20 px-2 py-1 text-[12px]  uppercase">Reopened · {offer.viewCount - 1}×</span>}</>}>
      <div className="grid gap-5 xl:grid-cols-[1fr_.8fr_1.2fr]">
        <div><p className="break-all font-mono text-sm  opacity-55">{offer.slug}</p>{offer.payload.response && <div className="mt-4 border-t border-current/10 pt-4"><p className="text-[10px] uppercase tracking-[0.14em] opacity-55">Latest client response</p><p className="mt-2 text-sm">{String((offer.payload.response as Record<string, unknown>).name ?? "")} · {String((offer.payload.response as Record<string, unknown>).action ?? "")}</p></div>}</div>
        <dl className="grid grid-cols-2 gap-3 text-sm  uppercase"><Meta label="Created" value={date(offer.createdAt)}/><Meta label="Sent" value={date(offer.sentAt)}/><Meta label="First opened" value={date(offer.firstViewedAt)}/><Meta label="Last opened" value={date(offer.lastViewedAt)}/><Meta label="Total opens" value={`${offer.viewCount}${offer.viewCount > 1 ? ` · ${offer.viewCount - 1} reopened` : ""}`}/><Meta label="Expires" value={date(offer.expiresAt)}/></dl>
        <div className="grid grid-cols-2 gap-2">
          <Link target="_blank" href={`/offer/${offer.slug}`} className="border border-ink-black/20 px-3 py-3 text-center text-[10px] uppercase">View</Link>
          <Link href={`/api/admin/offers/${encodeURIComponent(offer.slug)}/pdf`} className="border border-ink-black/20 px-3 py-3 text-center text-[10px] uppercase">Download PDF</Link>
          {editable && <Link href={`/admin/offers/${encodeURIComponent(offer.slug)}/edit`} className="border border-ink-black/20 px-3 py-3 text-center text-[10px] uppercase">Edit offer</Link>}
          {offer.status === "draft" && <form action={markOfferSentAction}><input type="hidden" name="slug" value={offer.slug}/><button className="h-full w-full bg-ink-black px-3 py-3 text-[10px] uppercase text-soft-white">Mark sent</button></form>}
          <form action={regenerateOfferAction}><input type="hidden" name="slug" value={offer.slug}/><button className="h-full w-full border border-ink-black/20 px-3 py-3 text-[10px] uppercase">{editable ? "Duplicate offer" : "Create revised link"}</button></form>
          {offer.status !== "accepted" && offer.status !== "revoked" && <form action={revokeOfferAction}><input type="hidden" name="slug" value={offer.slug}/><button className="h-full w-full border border-red-300 px-3 py-3 text-[10px] uppercase text-red-800">Revoke</button></form>}
          {offer.status !== "accepted" && offer.status !== "rejected" && <OfferDecisionControls slug={offer.slug} name={offer.clientName ?? ""} email={offer.clientEmail ?? ""} packages={packages}/>} 
          {editable && <DeleteOfferButton slug={offer.slug} name={offer.clientName ?? "this offer"}/>} 
        </div>
      </div>
      {offer.status === "accepted" && <p className="mt-4 border-t border-current/10 pt-4 text-sm  opacity-60">Accepted commercial record: view and PDF remain available, but editing and deletion are locked.</p>}
    </CollapsibleAdminCard>;
  };
  return <main className="px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
    <AdminPageHeader eyebrow="Sales / proposals" title="Offers" description="Offer cards stay compact until opened. Names, status, language and opening activity remain visible." action={<Link href="/admin/dashboard" className="bg-ink-black px-5 py-4 text-sm  uppercase tracking-[0.14em] text-soft-white">Create new offer →</Link>}/>
    <div className="mt-5 flex justify-between gap-4"><p className="text-sm  uppercase tracking-[0.16em]">Offer library · {offers.length}</p><p className="text-[10px] uppercase text-ink-black/45">{OFFER_VALIDITY_DAYS}-day validity after sending</p></div>
    <section className="mt-3 grid gap-4" data-monthly-offer-groups>
      {monthly.map(([month,records],index)=><details key={month} open={index===0} className="group/month border border-ink-black/15 bg-[#f7f3e9]"><summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-2 transition-colors hover:bg-ink-black hover:text-white"><div><p className="text-[8px] uppercase leading-none tracking-[.15em] opacity-55">Offers · recently updated first</p><span className="mt-0.5 block text-2xl font-light uppercase leading-none">{monthLabel(month)}</span></div><div className="flex items-center gap-3"><span className="text-[10px] uppercase">{records.length} records</span><span className="text-lg transition-transform group-open/month:rotate-45">+</span></div></summary><div className="grid gap-3 border-t border-ink-black/10 p-3">{records.map(renderOffer)}</div></details>)}
      {expired.length>0&&<details className="group/expired border border-red-200 bg-red-50"><summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-2 transition-colors hover:bg-red-900 hover:text-white"><div><p className="text-[8px] uppercase leading-none tracking-[.15em] opacity-60">Outside the {OFFER_VALIDITY_DAYS}-day validity window · newest first</p><span className="mt-0.5 block text-2xl font-light uppercase leading-none">Expired offers</span></div><div className="flex items-center gap-3"><span className="text-[10px] uppercase">{expired.length} records</span><span className="text-lg transition-transform group-open/expired:rotate-45">+</span></div></summary><div className="grid gap-3 border-t border-red-200 p-3">{expired.map(renderOffer)}</div></details>}
      {!offers.length && <div className="border border-dashed border-ink-black/25 py-16 text-center"><p className="text-sm text-ink-black/50">No offers have been created yet.</p></div>}
    </section>
  </main>;
}

function Meta({ label, value }: { label: string; value: string }) {
  return <div><dt className="opacity-45">{label}</dt><dd>{value}</dd></div>;
}
