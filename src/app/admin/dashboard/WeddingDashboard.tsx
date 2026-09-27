// FILE: app/admin/dashboard/WeddingDashboard.tsx
"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { saveOfferAction, logoutAction } from "@/app/admin/actions"
import { format, isValid, parseISO } from "date-fns";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { AdminDatePicker } from "@/components/admin/AdminDatePicker";
import { AdminHelp } from "@/components/admin/AdminHelp";
import { OfferServiceList } from "@/components/admin/OfferServiceList";
import { GreekUppercaseNormalizer } from "@/components/GreekUppercaseNormalizer";

interface WeddingDashboardProps {
  onBack: () => void;
  initialLead?: { id: string; names: string; email: string; date: string; location: string; lang: "en" | "gr" };
}

export default function WeddingAdminDashboard({ onBack, initialLead }: WeddingDashboardProps) {
  const [step, setStep] = useState(1);
  const [lang, setLang] = useState<"en" | "gr">(initialLead?.lang ?? "en");
  const [generatedLink, setGeneratedLink] = useState("");
  const [copied, setCopied] = useState(false);
  const initialEventDate = initialLead?.date ? new Date(`${initialLead.date}T12:00:00`) : new Date();

  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const activeStep = containerRef.current?.querySelector(`.step-container`);
    if (!activeStep) return;

    const cards = activeStep.querySelectorAll<HTMLElement>(".anim-card");
    const inputs = activeStep.querySelectorAll<HTMLElement>(".anim-input");

    const tl = gsap.timeline();
    gsap.set([cards, inputs], { opacity: 0, y: 30 });

    tl.to(cards, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: "power3.out",
    })
    .to(inputs, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.04,
      ease: "power2.out",
    }, "-=0.5");

  }, { scope: containerRef, dependencies: [step] });

  const handleGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const getVal = (name: string) => String(fd.get(name) || "").trim();
    const getList = (name: string) => fd.getAll(name).map(String).map(item=>item.trim()).filter(Boolean);
    
    const rawNames = getVal("names") || "client";
    
    const baseSlug = rawNames
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\u0370-\u03FF-]/g, "");

    const secureToken = crypto.randomUUID().replaceAll("-", "").slice(0, 16);
    const slug = `${baseSlug}${lang === "gr" ? "-gr" : ""}-${secureToken}`;

    const submittedDate = parseISO(getVal("date"));
    const offerData = {
      type: "wedding",
      leadId: initialLead?.id,
      clientEmail: initialLead?.email,
      lang,
      n: rawNames,
      d: isValid(submittedDate) ? format(submittedDate, "PPP") : getVal("date"), 
      loc: getVal("location"),
      pl: getVal("planner"),
      c1: { ph: getVal("ph1"), p: getVal("p1"), h: getVal("h1"), img: getVal("img1"), bx: getVal("bx1"), phot: getVal("phot1"), cs: getList("cs1") },
      c2: { ph: getVal("ph2"), p: getVal("p2"), h: getVal("h2"), img: getVal("img2"), bx: getVal("bx2"), phot: getVal("phot2"), cs: getList("cs2") },
      c3: { ph: getVal("ph3"), p: getVal("p3"), h: getVal("h3"), img: getVal("img3"), bx: getVal("bx3"), phot: getVal("phot3"), cs: getList("cs3") },
    };

    const result = await saveOfferAction(slug, offerData);
    if (result.success) {
      setGeneratedLink(`${window.location.origin}/offer/${encodeURIComponent(slug)}`);
      setCopied(false);
    } else {
      alert("Error: " + result.error);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  return (
    <GreekUppercaseNormalizer active={lang==="gr"}><main ref={containerRef} lang={lang==="gr"?"el":"en"} className="min-h-screen bg-soft-white flex flex-col lg:flex-row text-black">
      <section className="w-full lg:w-1/5 bg-ink-black text-soft-yellow pt-24 lg:pt-32 px-6 lg:px-4 shrink-0 flex flex-col justify-between">
        <div className="space-y-8">
          <div>
            <button 
              type="button"
              onClick={onBack}
              className="text-[12px] uppercase tracking-wider font-bold border border-[#FAF9F5]/20 text-[#FAF9F5]/60 hover:border-[#FAF9F5] hover:text-[#FAF9F5] px-4 py-2 w-full transition-all duration-300"
            >
              ← Back to Selection
            </button>
          </div>

          <div className="hidden lg:block block border-t border-[#FAF9F5]/10 pt-6">
            <h3 className="text-sm  uppercase tracking-widest text-[#FAF9F5]/40 mb-4">01 Wedding Wizard</h3>
            <div className="space-y-4 text-[1.2rem] uppercase font-bold">
               <div className={`transition-opacity ${step === 1 ? "opacity-100 underline" : "opacity-40"}`}>
                 {lang === "gr" ? "01 Συλλογές" : "01 Collections"}
               </div>
               <div className={`transition-opacity ${step === 2 ? "opacity-100 underline" : "opacity-40"}`}>
                 {lang === "gr" ? "02 Στοιχεία" : "02 Logistics"}
               </div>
            </div>
          </div>
        </div>

        <button onClick={() => logoutAction()} className="text-left text-[14px] lg:text-[16px] uppercase font-bold tracking-widest opacity-60 hover:opacity-100 transition-opacity flex items-center gap-2 py-8 mt-auto">
          <span>←</span> {lang === "gr" ? "Αποσύνδεση" : "Sign Out"}
        </button>
      </section>

      <section className="flex-1 bg-soft-white  px-4 lg:px-8 py-8 lg:py-12 overflow-y-auto">
        <form onSubmit={handleGenerate} className="mx-auto max-w-full">
          <div className={`${step === 1 ? "block" : "hidden"} step-container space-y-8`}>
            <header className="border-b border-ink-black/60 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
              <span className="text-3xl lg:text-5xl uppercase tracking-tighter">
                {lang === "gr" ? "Συλλογές Γάμου" : "Wedding Collections"}
              </span>
              <div className="mb-1">
                <p className="mb-2 flex items-center justify-end text-[10px] uppercase tracking-[0.16em] text-ink-black/55">
                  Client offer language
                  <AdminHelp>Choose the language the couple will see in their private offer. This does not change the admin interface language.</AdminHelp>
                </p>
                <div className="flex justify-end gap-2">
                  {["en", "gr"].map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLang(l as "en" | "gr")}
                      className={`px-4 py-1 text-[18px] lg:text-[22px] uppercase tracking-widest transition-all border ${lang === l ? "bg-ink-black text-soft-white border-ink-black" : "border-ink-black/20 text-black/40 hover:border-black/60"}`}
                    >
                      {l === "en" ? "En" : "Gr"}
                    </button>
                  ))}
                </div>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-2">
              <WeddingCollectionInputs lang={lang} num="1" title="Essential" price="1600" hours="10" imgs="1000+" box={lang === "gr" ? "Όχι" : "No"} phot={lang === "gr" ? "Όχι" : "No"} defCons={[lang==="gr"?"Βιντεογραφος":"Videographer"]}/>
              <WeddingCollectionInputs lang={lang} num="2" title="Most Popular" price="1900" hours="10" imgs="1200+" box={lang === "gr" ? "50 Εκτυπώσεις" : "50 Prints"} phot={lang === "gr" ? "Ναι" : "Yes"} defCons={[lang==="gr"?"Βιντεογραφος":"Videographer"]}/>
              <WeddingCollectionInputs lang={lang} num="3" title="Full Wedding Experience" price="2300" hours="12" imgs="1500+" box={lang === "gr" ? "100 Εκτυπώσεις" : "100 Prints"} phot={lang === "gr" ? "Ναι" : "Yes"} defCons={[lang==="gr"?"Βιντεογραφος":"Videographer"]}/>
            </div>

            <button type="button" data-testid="wedding-logistics-next" onClick={() => setStep(2)} className="w-full border border-ink-black/60 bg-ink-black text-white py-6 uppercase font-bold hover:bg-soft-yellow hover:text-ink-black transition-all duration-500">
              {lang === "gr" ? "Επόμενο Βήμα" : "Next Step"}
            </button>
          </div>

          <div className={`${step === 2 ? "block" : "hidden"} step-container space-y-8`}>
            <header className="border-b border-ink-black/60 pb-4">
              <span className="text-3xl lg:text-5xl uppercase tracking-tighter">
                {lang === "gr" ? "Στοιχεία Γάμου" : "Wedding Logistics"}
              </span>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 anim-card">
              <InputGroup label={lang === "gr" ? "Ονόματα Ζευγαριού" : "Couple Names"} name="names" def={initialLead?.names || (lang === "gr" ? "Ονομα-Ονομα" : "Laura-Alex")} />
              
              <AdminDatePicker label={lang === "gr" ? "Ημερομηνία Γάμου" : "Wedding Date"} name="date" initialDate={initialEventDate} help={<AdminHelp>Select the confirmed event date. It appears on the proposal and later drives timeline scheduling.</AdminHelp>}/>

              <InputGroup label={lang === "gr" ? "Τοποθεσία" : "Location"} name="location" def={initialLead?.location || (lang === "gr" ? "ΕΛΛΑΔΑ" : "GREECE")} />
              <InputGroup label={lang === "gr" ? "Planner" : "Planner"} name="planner" def="Direct" />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-8">
              <button type="button" onClick={() => setStep(1)} className="anim-card w-full sm:w-auto p-6 border border-ink-black/60 bg-soft-white  text-ink-black py-6 uppercase hover:bg-ink-black/50 hover:text-soft-white transition-all duration-500">
                {lang === "gr" ? "Πίσω" : "Back"}
              </button>
              <button type="submit" className="anim-card w-full border border-ink-black/60 bg-ink-black text-white py-6 uppercase hover:bg-soft-yellow hover:text-ink-black transition-all duration-500">
                {lang === "gr" ? "Δημιουργία Link" : "Generate Offer Link"}
              </button>
            </div>

            {generatedLink && (
              <div className="mx-auto mt-8 w-full anim-card">
              <div className="flex w-full flex-col items-stretch overflow-hidden border border-black sm:flex-row">
                <div className="flex-1 p-4 lg:p-6 bg-[#f2e8da] break-all font-mono text-[10px] lg:text-[11px] selection:bg-black selection:text-white">
                  <span className="block mb-2 font-bold uppercase text-[12px]  opacity-50">Generated Link:</span>
                  {generatedLink}
                </div>
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="bg-black text-white px-8 py-4 sm:py-0 uppercase font-bold text-[10px] hover:bg-zinc-800 transition-colors shrink-0"
                >
                  {copied ? (lang === "gr" ? "Αντιγράφηκε!" : "Copied!") : (lang === "gr" ? "Αντιγραφή" : "Copy Link")}
                </button>
              </div>
              {initialLead&&<Link href={`/admin/leads?workflowLead=${encodeURIComponent(initialLead.id)}&workflowStep=3`} className="mx-auto mt-4 block w-full bg-ink-black px-6 py-6 text-center text-base font-bold uppercase tracking-wider text-soft-yellow transition-colors hover:bg-soft-yellow hover:text-ink-black sm:text-lg">← Back to lead workflow</Link>}
              </div>
            )}
          </div>
        </form>
      </section>
    </main></GreekUppercaseNormalizer>
  );
}

type CollectionInputProps = { num: string; title: string; price: string; hours: string; imgs: string; box?: string; phot: string; lang: "en" | "gr"; defCons?: string[] };
function WeddingCollectionInputs({ num, title, price, hours, imgs, box, phot, lang, defCons }: CollectionInputProps) {
  return (
    <div className="anim-card border border-ink-black/60 p-4 lg:p-4 bg-soft-yellow/40 space-y-4">
      <InputGroup label={lang === "gr" ? "Όνομα Συλλογής" : "Collection Name"} name={`ph${num}`} def={title} />
      <InputGroup label={lang === "gr" ? "Τιμή" : "Price"} name={`p${num}`} def={price} />
      <InputGroup label={lang === "gr" ? "Ώρες" : "Hours"} name={`h${num}`} def={hours} />
      <InputGroup label={lang === "gr" ? "Φωτογραφίες" : "Images"} name={`img${num}`} def={imgs} />
      {box !== undefined && <InputGroup label={lang === "gr" ? "Κουτί" : "Box"} name={`bx${num}`} def={box} />}
      <SecondPhotographerSelect name={`phot${num}`} value={phot} lang={lang}/>
      <OfferServiceList key={`${num}-${lang}`} name={`cs${num}`} lang={lang} initial={defCons}/>
    </div>
  );
}

function InputGroup({ label, name, def }: { label: string; name: string; def: string }) {
  const help=name.startsWith("phot")?"State whether a second photographer is included.":name.startsWith("ph")?"Public collection title shown to the couple.":name.startsWith("p")?"Package price in euros; enter numbers only unless the public design requires text.":name.startsWith("h")?"Total photography coverage hours included.":name.startsWith("img")?"Expected edited image quantity or range.":name.startsWith("bx")?"Physical presentation box or print quantity included.":name==="names"?"Use the couple names exactly as they should appear publicly.":name==="location"?"Main ceremony or reception location shown in the proposal.":name==="planner"?"Planner name, or Direct when the couple is coordinating without one.":"Review this value before generating the private link.";
  return (
    <div className="anim-input flex flex-col gap-1">
      <label className="text-[1rem] lg:text-[1.2rem] uppercase text-ink-black/70">{label}<AdminHelp>{help}</AdminHelp></label>
      <input 
        name={name} 
        defaultValue={def} 
        autoComplete="off"
        className="border-b border-ink-black/50 bg-transparent py-1 outline-none focus:border-ink-black text-lg lg:text-xl text-ink-black transition-colors" 
      />
    </div>
  );
}

function SecondPhotographerSelect({name,value,lang}:{name:string;value:string;lang:"en"|"gr"}){
  const yes=/^(yes|true|1|ναι)$/i.test(value);
  return <div className="anim-input flex flex-col gap-1"><label className="text-[1rem] uppercase text-ink-black/70 lg:text-[1.2rem]">{lang==="gr"?"2ος Φωτογραφος":"2nd Photographer"}<AdminHelp>Select Yes only when a second photographer is included in this collection.</AdminHelp></label><select name={name} defaultValue={yes?"yes":"no"} className="border-b border-ink-black/50 bg-transparent py-2 text-lg text-ink-black outline-none"><option value="no">{lang==="gr"?"Οχι":"No"}</option><option value="yes">{lang==="gr"?"Ναι":"Yes"}</option></select></div>;
}
