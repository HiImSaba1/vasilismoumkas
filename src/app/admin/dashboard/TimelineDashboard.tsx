// FILE: src/app/admin/dashboard/TimelineDashboard.tsx
"use client";

import React, { useState, useRef } from "react";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import {
  defaultMilestones,
  MilestoneItem,
} from "@/app/(site)/data/TimelineData";
import { saveTimelineAction } from "@/app/admin/actions";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useSearchParams } from "next/navigation";

interface TimelineDashboardProps {
  onBack: () => void;
  editSlug?: string;
}

type TimelineParticipant={leadId:string;clientId:string|null;names:string;date:string;status:string};
const timelineSlug=(names:string,date:string)=>`${names}-${date||"date-pending"}`.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,165);

export default function TimelineDashboard({ onBack, editSlug }: TimelineDashboardProps) {
  const searchParams=useSearchParams();
  const initialClientId=searchParams.get("client")??undefined;
  const initialNames=searchParams.get("names")??undefined;
  const initialDate=searchParams.get("date")??undefined;
  const [slug, setSlug] = useState(initialNames?timelineSlug(initialNames,initialDate??""):"maria-nikos");
  const [clientId,setClientId]=useState<string|undefined>(initialClientId);
  const [selectedLead,setSelectedLead]=useState("");
  const [participants,setParticipants]=useState<TimelineParticipant[]>([]);
  const [namesGr, setNamesGr] = useState(initialNames??"Μαρία & Νίκος");
  const [namesEn, setNamesEn] = useState(initialNames??"Maria & Nikos");
  const [eventDate, setEventDate] = useState(initialDate??"24 June 2026");
  const [milestones, setMilestones] =
    useState<MilestoneItem[]>(defaultMilestones);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [lang, setLang] = useState<"en" | "gr">("gr");

  const containerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  React.useEffect(()=>{fetch("/api/admin/timeline-participants").then(response=>response.ok?response.json():Promise.reject()).then((items:TimelineParticipant[])=>setParticipants(items)).catch(()=>setStatus("error"))},[]);

  const chooseParticipant=(leadId:string)=>{setSelectedLead(leadId);const participant=participants.find(item=>item.leadId===leadId);if(!participant)return;setClientId(participant.clientId??undefined);setNamesGr(participant.names);setNamesEn(participant.names);setEventDate(participant.date);setSlug(timelineSlug(participant.names,participant.date))};

  React.useEffect(() => {
    if (!editSlug) return;
    fetch(`/api/admin/timelines/${encodeURIComponent(editSlug)}`)
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((record) => {
        const payload = record.payload ?? {};
        setSlug(record.slug);
        setLang(record.language ?? "gr");
        setNamesGr(String(payload.names_gr ?? ""));
        setNamesEn(String(payload.names_en ?? ""));
        setEventDate(String(payload.date ?? ""));
        if (Array.isArray(payload.items)) setMilestones(payload.items);
      })
      .catch(() => setStatus("error"));
  }, [editSlug]);

  // Smooth cinematic workspace stagger animation matching Wedding Dashboard layout profiles
  useGSAP(
    () => {
      const activeView = containerRef.current?.querySelector(
        `.timeline-form-container`,
      );
      if (!activeView) return;

      const cards = activeView.querySelectorAll<HTMLElement>(".anim-card");
      const inputs = activeView.querySelectorAll<HTMLElement>(".anim-input");

      const tl = gsap.timeline();
      gsap.set([cards, inputs], { opacity: 0, y: 20 });

      tl.to(cards, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
      }).to(
        inputs,
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.03,
          ease: "power2.out",
        },
        "-=0.3",
      );
    },
    { scope: containerRef, dependencies: [lang] },
  );

  const addMilestone = () => {
    setMilestones([
      ...milestones,
      {
        time: "",
        title_gr: "",
        title_en: "",
        location_gr: "",
        location_en: "",
        desc_gr: "",
        desc_en: "",
      },
    ]);
  };

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const updateMilestone = (
    index: number,
    field: keyof MilestoneItem,
    value: string,
  ) => {
    const updated = [...milestones];
    updated[index][field] = value;
    setMilestones(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug) return alert("Please provide a valid slug configuration.");
    setLoading(true);
    setStatus("idle");

    // Enforce isolated tracking string slug paths based on language selector
    const finalSlug = slug.endsWith(`-${lang}`) ? slug : `${slug}-${lang}`;

    const timelineDataPayload = {
      clientId,
      names_gr: namesGr,
      names_en: namesEn,
      date: eventDate,
      items: milestones,
    };

    const res = await saveTimelineAction(finalSlug, timelineDataPayload);

    if (res.success) {
      setStatus("success");
    } else {
      setStatus("error");
    }
    setLoading(false);
  };

  const previewSlug = slug.endsWith(`-${lang}`) ? slug : `${slug}-${lang}`;

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-soft-white text-black py-6 md:px-3"
    >
      <div className="mx-auto space-y-8 timeline-form-container">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-lg tracking-wider text-black/50 hover:text-black transition-colors px-0"
          >
            <ArrowLeft className="w-4 h-4" />{" "}
            {lang === "gr" ? "Πίσω στις επιλογές" : "Back to Selection"}
          </button>

          <div className="flex gap-2">
            {["en", "gr"].map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l as "en" | "gr")}
                className={`px-4 py-1 text-[16px] tracking-widest transition-all border ${lang === l ? "bg-black text-white border-black" : "border-black/20 text-black/40 hover:border-black/60"}`}
              >
                {l === "en" ? "En" : "Gr"}
              </button>
            ))}
          </div>
        </div>

        <header className="border-b border-black/10 pb-2 px-6">
          <span className="text-5xl md:text-6xl tracking-tighter">
            {lang === "gr" ? "Διαχείριση Timeline" : "Timeline Scheduler"}
          </span>
        </header>

        <form onSubmit={handleSave} className="space-y-8">
          {/* Section 1: Client Logistics Metadata Card */}
          <div className="bg-white p-6 border border-black/5 rounded-sm space-y-6 anim-card shadow-md">
            <span className="text-3xl  tracking-tight border-b border-black/5 pb-2">
              {lang === "gr" ? "1. Στοιχεία Πελάτη" : "1. Client Data"}
            </span>
            {!editSlug&&<label className="anim-input grid gap-2 text-sm  uppercase tracking-wider">{lang==="gr"?"Επιλογή ενδιαφερόμενου":"Select available lead"}<select value={selectedLead} onChange={event=>chooseParticipant(event.target.value)} className="border border-black/20 bg-white px-4 py-3 text-sm normal-case"><option value="">{lang==="gr"?"Επιλέξτε ζευγάρι…":"Choose a couple…"}</option>{participants.map(item=><option key={item.leadId} value={item.leadId}>{item.names} · {item.date||"Date pending"} · {item.status}</option>)}</select><span className="text-[10px] normal-case tracking-normal text-black/45">{lang==="gr"?"Τα ονόματα, η ημερομηνία και το slug συμπληρώνονται αυτόματα. Τα υπάρχοντα ορόσημα παραμένουν ως έχουν.":"Names, date and slug are filled automatically. The existing milestone defaults remain unchanged."}</span></label>}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="anim-input">
                <label className="text-red-500 block text-sm   tracking-wider mb-2 mt-3">
                  Base URL Slug
                </label>
                <div className="flex items-center border-b border-black/20 focus-within:border-black pb-2">
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    required
                    className="w-full bg-transparent outline-none text-lg font-mono"
                  />
                  <span className="text-black/40 font-mono text-sm px-2 bg-black/5 rounded-sm">
                    -{lang}
                  </span>
                </div>
              </div>

              <div className="anim-input">
                <label className="text-red-500 block text-sm  tracking-wider mb-2">
                  {lang === "gr" ? "Ημερομηνία Εκδήλωσης" : "Event Date String"}
                </label>
                <input
                  type="text"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full bg-transparent border-b border-black/20 focus:border-black outline-none pb-2 text-lg"
                />
              </div>

              <div className="anim-input">
                {lang === "gr" ? (
                  <>
                    <label className="text-red-500 block text-sm  tracking-wider mb-2">
                      Ονόματα (Ελληνικά)
                    </label>
                    <input
                      type="text"
                      value={namesGr}
                      onChange={(e) => setNamesGr(e.target.value)}
                      className="w-full bg-transparent border-b border-black/20 focus:border-black outline-none pb-2 text-lg"
                    />
                  </>
                ) : (
                  <>
                    <label className="text-red-500 block text-sm  tracking-wider mb-2">
                      Names (English)
                    </label>
                    <input
                      type="text"
                      value={namesEn}
                      onChange={(e) => setNamesEn(e.target.value)}
                      className="w-full bg-transparent border-b border-black/20 focus:border-black outline-none pb-2 text-lg"
                    />
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Interactive Milestone Timeline Form Mapping */}
          <div className="space-y-4">
            <div className="flex flex-wrap justify-between items-center border-b border-black/5 pb-2 px-6">
              <span className="text-3xl  tracking-tight">
                {lang === "gr"
                  ? "2. Ροή Προγράμματος"
                  : "2. Day Schedule Milestones"}
              </span>
              <button
                type="button"
                onClick={addMilestone}
                className="flex items-center gap-1 text-sm  tracking-widest bg-black text-soft-white   px-3 py-1.5 rounded-sm hover:opacity-80"
              >
                <Plus className="w-3.5 h-3.5" />{" "}
                {lang === "gr" ? "Προσθήκη" : "Add Milestone"}
              </button>
            </div>

            {milestones.map((item, index) => (
              <div
                key={index}
                className="bg-white p-6 border border-black/5 rounded-sm relative space-y-4 group shadow-2xl anim-card"
              >
                <button
                  type="button"
                  onClick={() => removeMilestone(index)}
                  className="absolute top-4 right-4 text-black/30 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  <div className="md:col-span-3 anim-input">
                    <label className="text-red-500 block text-[14px]   tracking-wider mb-1">
                      Time Track
                    </label>
                    <input
                      type="text"
                      value={item.time}
                      onChange={(e) =>
                        updateMilestone(index, "time", e.target.value)
                      }
                      className="w-full bg-transparent border-b border-black/20 focus:border-black outline-none pb-1 font-mono text-lg"
                    />
                  </div>

                  <div className="md:col-span-9 anim-input">
                    {lang === "gr" ? (
                      <>
                        <label className="text-red-500 block text-[14px]   tracking-wider mb-1">
                          Τίτλος
                        </label>
                        <input
                          type="text"
                          value={item.title_gr}
                          onChange={(e) =>
                            updateMilestone(index, "title_gr", e.target.value)
                          }
                          className="w-full bg-transparent border-b border-black/20 focus:border-black outline-none pb-1 text-lg"
                        />
                      </>
                    ) : (
                      <>
                        <label className="text-red-500 block text-[14px]   tracking-wider mb-1">
                          Title (EN)
                        </label>
                        <input
                          type="text"
                          value={item.title_en}
                          onChange={(e) =>
                            updateMilestone(index, "title_en", e.target.value)
                          }
                          className="w-full bg-transparent border-b border-black/20 focus:border-black outline-none pb-1 text-lg"
                        />
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 anim-input">
                  <div>
                    {lang === "gr" ? (
                      <>
                        <label className="text-red-500 block text-[14px]   tracking-wider mb-1">
                          Τοποθεσία
                        </label>
                        <input
                          type="text"
                          value={item.location_gr}
                          onChange={(e) =>
                            updateMilestone(
                              index,
                              "location_gr",
                              e.target.value,
                            )
                          }
                          className="w-full bg-transparent border-b border-black/20 focus:border-black outline-none pb-1 text-lg"
                        />
                      </>
                    ) : (
                      <>
                        <label className="text-red-500 block text-[14px]   tracking-wider mb-1">
                          Location (EN)
                        </label>
                        <input
                          type="text"
                          value={item.location_en}
                          onChange={(e) =>
                            updateMilestone(
                              index,
                              "location_en",
                              e.target.value,
                            )
                          }
                          className="w-full bg-transparent border-b border-black/20 focus:border-black outline-none pb-1 text-lg"
                        />
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 anim-input">
                  <div>
                    {lang === "gr" ? (
                      <>
                        <label className="text-red-500 block text-[14px]   tracking-wider mb-1">
                          Περιγραφή
                        </label>
                        <textarea
                          rows={3}
                          value={item.desc_gr}
                          onChange={(e) =>
                            updateMilestone(index, "desc_gr", e.target.value)
                          }
                          className="w-full bg-transparent border border-black/10 rounded-sm p-2 text-lg outline-none focus:border-black resize-y"
                        />
                      </>
                    ) : (
                      <>
                        <label className="text-red-500 block text-[14px]   tracking-wider mb-1">
                          Description (EN)
                        </label>
                        <textarea
                          rows={3}
                          value={item.desc_en}
                          onChange={(e) =>
                            updateMilestone(index, "desc_en", e.target.value)
                          }
                          className="w-full bg-transparent border border-black/10 rounded-sm p-2 text-lg outline-none focus:border-black resize-y"
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Action Section Bar */}
          <div className="flex flex-col items-center justify-between sm:flex-row gap-6 py-12 border-t border-black/10 anim-card">
            <div className="flex items-center justify-between">
              <button
                type="submit"
                disabled={loading}
                className="px-12 py-4 bg-black text-soft-white hover:bg-black/90 disabled:opacity-50 text-sm  tracking-widest font-medium rounded-sm transition-opacity"
              >
                {loading
                  ? "Saving Records..."
                  : lang === "gr"
                    ? "Αποθήκευση Timeline"
                    : "Save Timeline Configuration"}
              </button>
            </div>

            {/* Notification & Generated Link Area */}
            <div className="space-y-6">
              {status === "success" && (
                <div className="space-y-4">
                  <p className="text-green-600 text-lg font-medium">
                    ✓ Timeline configurations written successfully.
                  </p>

                  {/* Link Box */}
                  <div className="flex items-stretch border border-black overflow-hidden max-w-lg">
                    <div className="flex-1 p-4 bg-[#f2e8da] break-all font-mono text-[11px] select-all">
                      {`${window.location.origin}/timeline/${previewSlug}`}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const link = `${window.location.origin}/timeline/${previewSlug}`;
                        navigator.clipboard.writeText(link);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="bg-black text-white px-6 uppercase font-bold text-[10px] hover:bg-zinc-800 transition-colors shrink-0"
                    >
                      {copied
                        ? lang === "gr"
                          ? "Αντιγράφηκε!"
                          : "Copied!"
                        : lang === "gr"
                          ? "Αντιγραφή"
                          : "Copy"}
                    </button>
                  </div>
                </div>
              )}

              {status === "error" && (
                <p className="text-red-500 text-lg font-medium">
                  ✕ Failed to write timeline configuration data matrix.
                </p>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
