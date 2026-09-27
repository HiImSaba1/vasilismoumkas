import { notFound } from "next/navigation";
import { ClientWorkspaceSection } from "@/components/admin/ClientWorkspaceSection";

export const dynamic="force-dynamic";

const sections=["Workflow","Offers","Invoice","Contract","Questionnaire","Timeline","Mail","Client details","Activity and notes"];

export default function ClientWorkspaceVerificationPage(){
  if(process.env.NODE_ENV==="production")notFound();
  return <main className="min-h-screen bg-[#f1ede3] p-4 sm:p-8">
    <section className="mx-auto max-w-6xl border border-ink-black/15 bg-[#f7f3e9] p-5" data-client-summary>
      <p className="text-sm  uppercase tracking-[0.18em] opacity-55">Client workspace verification</p>
      <h1 className="mt-2 text-3xl font-light uppercase">Test Couple</h1>
    </section>
    <section className="mx-auto mt-6 max-w-6xl border border-ink-black/15 bg-white">
      {sections.map((title,index)=><ClientWorkspaceSection key={title} title={title} status={index===0?"In progress":"Ready"} tone={index===0?"orange":"grey"} summary={`Connected ${title.toLowerCase()} information`}>
        <div className="grid gap-3 sm:grid-cols-2"><p>Operational content for {title}.</p><button type="button" className="border border-ink-black px-4 py-3">Review action</button></div>
      </ClientWorkspaceSection>)}
    </section>
  </main>;
}
