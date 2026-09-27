import type { InvoicePaymentSummary } from "@/lib/invoice-payments";
import { removeGreekTonos } from "@/lib/greek-typography";

type Portal={coupleNames:string;email:string|null;eventDate:string|null;language:"gr"|"en";eventType?:"wedding"|"baptism"};
type Document={status:string;data:Record<string,string>}|undefined;

export function PortalInvoicePanel({portal,document,summary}:{portal:Portal;document:Document;summary:InvoicePaymentSummary|null}){
  const data=document?.data??{};
  const greek=portal.language==="gr";
  const money=(value:string|number|undefined)=>new Intl.NumberFormat(greek?"el-GR":"en-GB",{style:"currency",currency:"EUR"}).format(Number(String(value??"0").replace(",","."))||0);
  const total=summary?.invoiceTotal??(Number(data.total||data.subtotal)||0);
  const paid=summary?.totalPaid??(Number(data.prepaid_amount)||0);
  const balance=summary?.balanceDue??Math.max(0,total-paid);
  const payments=summary?.payments.filter(item=>!item.voidedAt)??[];
  const status=summary?.status??document?.status??"draft";
  const eventType=portal.eventType??"wedding";
  const statusLabel=greek?({draft:"ΠΡΟΣΧΕΔΙΟ",issued:"ΕΚΔΟΘΗΚΕ","part-paid":"ΜΕΡΙΚΩΣ ΠΛΗΡΩΜΕΝΟ",paid:"ΠΛΗΡΩΜΕΝΟ"} as Record<string,string>)[status]??status:status.replaceAll("-"," ");
  const details=[
    [greek?"Καλυψη":"Coverage",data.collection_hours?`${data.collection_hours} ${greek?"ωρες":"hours"}`:""],
    [greek?"Φωτογραφοι":"Photographers",data.collection_photographers],
    [greek?"Επεξεργασμενες φωτογραφιες":"Edited images",data.collection_images],
    [greek?"Αλμπουμ / κουτι / εκτυπωσεις":"Albums / box / prints",data.collection_album_prints],
    [greek?"Επιπλεον παροχες":"Also included",data.collection_extras],
  ].filter(([,value])=>value);

  return <>
    <div className="mt-6 flex flex-wrap items-start justify-between gap-4"><div><p className="text-[10px] uppercase tracking-[.16em] text-ink-black/45">{greek?"ΤΙΜΟΛΟΓΙΟ ΓΙΑ":"Invoice for"}</p><h2 className="portal-invoice-client-name mt-2 font-light uppercase">{removeGreekTonos(data.client_name||portal.coupleNames)}</h2><p className="mt-2 text-sm text-ink-black/55">{data.client_email||portal.email||""}</p><p className="text-sm text-ink-black/55">{data.client_phone||""}</p><p className="text-sm text-ink-black/55">{data.client_address||""}</p></div><span className="bg-soft-yellow px-3 py-2 text-xs uppercase">{statusLabel}</span></div>
    <div className="mt-8 border-y border-ink-black/15 py-6"><p className="text-[10px] uppercase text-ink-black/45">{greek?"ΕΠΙΛΕΓΜΕΝΗ ΣΥΛΛΟΓΗ":"Selected collection"}</p><h3 className="mt-2 mb-0 text-2xl font-light uppercase">{data.collection_name||(greek?`Επιλεγμενη συλλογη ${eventType==="baptism"?"βαπτισης":"γαμου"}`:`Selected ${eventType} collection`)}</h3><dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">{details.map(([label,value])=><div key={label} className="border-t border-ink-black/10 pt-3"><dt className="text-xs uppercase text-ink-black/45">{label}</dt><dd className="mt-1 whitespace-pre-wrap">{value}</dd></div>)}</dl>{data.collection_details&&<p className="mt-4 whitespace-pre-wrap text-sm text-ink-black/60">{data.collection_details}</p>}</div>
    <dl className="ml-auto mt-6 grid max-w-md gap-3 text-sm"><div className="flex justify-between"><dt>{greek?"ΥΠΟΣΥΝΟΛΟ":"Subtotal"}</dt><dd>{money(total)}</dd></div><div className="flex justify-between border-t border-ink-black/15 pt-3 text-lg"><dt>{greek?"ΣΥΝΟΛΟ":"Total"}</dt><dd>{money(total)}</dd></div></dl>
    <div className="mt-8 overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="border-y border-ink-black/20 text-[10px] uppercase"><tr><th className="p-3">{greek?"ΚΑΤΑΣΤΑΣΗ":"Status"}</th><th className="p-3">{greek?"ΗΜΕΡΟΜΗΝΙΑ":"Date"}</th><th className="p-3">{greek?"ΤΡΟΠΟΣ / ΑΝΑΦΟΡΑ":"Method / reference"}</th><th className="p-3 text-right">{greek?"ΠΟΣΟ":"Amount"}</th></tr></thead><tbody>{payments.map(item=><tr key={item.id} className="border-b border-ink-black/10"><td className="p-3"><strong className="uppercase">{greek?"ΠΛΗΡΩΘΗΚΕ":"Paid"}</strong></td><td className="p-3">{item.paidAt}</td><td className="p-3">{[item.paymentMethod,item.reference].filter(Boolean).join(" · ")||"—"}</td><td className="p-3 text-right">{money(item.amount)}</td></tr>)}{!payments.length&&<tr className="border-b border-ink-black/10"><td className="p-3"><strong className="uppercase">{greek?"ΑΠΛΗΡΩΤΟ":"Unpaid"}</strong></td><td className="p-3">—</td><td className="p-3">—</td><td className="p-3 text-right">{money(total)}</td></tr>}</tbody></table></div>
    <div className="mt-8 grid gap-5 border-t border-ink-black/20 pt-6 sm:grid-cols-2 sm:items-end"><div><p className="text-[10px] uppercase text-ink-black/45">{greek?"ΥΠΟΛΟΙΠΟ":"Balance due"}</p><p className="mt-1 text-3xl font-light">{money(balance)}</p>{paid>0&&<p className="mt-1 text-sm text-green-800">{greek?"ΚΑΤΑΧΩΡΗΜΕΝΕΣ ΠΛΗΡΩΜΕΣ":"Payments recorded"} · {money(paid)}</p>}</div><p className="border-l-4 border-soft-yellow bg-[#f7f3e9] p-4 text-sm leading-relaxed text-ink-black/65">{greek?"Οι πληρωμες συμφωνουνται απευθειας με το studio. Το υπολοιπο ενημερωνεται εδω μολις καταχωρηθει η πληρωμη απο τον Βασιλη.":"Payments are arranged directly with the studio. This balance updates after Vasilis records each received payment."}</p></div>
  </>;
}
