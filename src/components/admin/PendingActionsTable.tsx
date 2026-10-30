"use client";
import {useState} from "react";
import Link from "next/link";
import type {PendingAction} from "@/lib/pending-actions";
const labels={owner:"Χρειάζεται δική μου ενέργεια",waiting:"Περιμένει πελάτη",next:"Επόμενο βήμα",failed:"Αποτυχία automation"};
export function PendingActionsTable({items}:{items:PendingAction[]}){
  const [filter,setFilter]=useState("all");
  const [search,setSearch]=useState("");
  const shown=items.filter(item=>(filter==="all"||item.status===filter)&&(item.clientName+" "+item.title).toLocaleLowerCase().includes(search.toLocaleLowerCase()));
  return <div data-admin-locale-isolated="true"><div className="my-6 flex flex-wrap gap-3"><input aria-label="Αναζήτηση εκκρεμοτήτων" placeholder="Αναζήτηση πελάτη ή ενέργειας" value={search} onChange={event=>setSearch(event.target.value)} className="min-w-0 flex-1 border border-ink-black/20 bg-white p-3 text-sm"/><select aria-label="Φίλτρο κατάστασης" value={filter} onChange={event=>setFilter(event.target.value)} className="border border-ink-black/20 bg-white p-3 text-sm"><option value="all">Όλες ({items.length})</option>{Object.entries(labels).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></div><div className="grid gap-3">{shown.map(item=><article key={item.id} className={`grid gap-4 border-l-4 bg-white p-5 md:grid-cols-[minmax(0,1fr)_auto] ${item.priority==="critical"?"border-red-700":"border-orange-500"}`}><div><p className="text-xs uppercase opacity-60">{item.clientName} · {item.eventDate??"Χωρίς ημερομηνία εκδήλωσης"}</p><h2 className="mt-2 !text-xl">{item.title}</h2><p className="text-sm opacity-70">{item.description}</p><p className="mt-2 text-xs">{labels[item.status]}</p></div><Link href={item.href} className="self-center border border-ink-black px-4 py-3 text-center text-xs uppercase">Άνοιγμα σχετικής ενέργειας →</Link></article>)}{!shown.length&&<p className="border border-ink-black/15 bg-white p-8 text-center">Δεν υπάρχουν εκκρεμότητες για αυτά τα φίλτρα.</p>}</div></div>;
}
