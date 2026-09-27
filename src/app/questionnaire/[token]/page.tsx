import { notFound } from "next/navigation";
import { getQuestionnaireByToken } from "@/lib/questionnaires";
import { questionnaireFields } from "@/lib/questionnaire-definitions";
import { submitQuestionnaireAction } from "./actions";

export default async function QuestionnairePage({params,searchParams}:{params:Promise<{token:string}>;searchParams:Promise<{submitted?:string}>}){
  const{token}=await params;
  const query=await searchParams;
  const record=await getQuestionnaireByToken(token);
  if(!record)notFound();
  const greek=record.language==="gr";
  const baptism=record.eventType==="baptism";
  const questions=questionnaireFields(record.eventType,record.language);
  const savedAnswers=record.answers&&typeof record.answers==="object"&&!Array.isArray(record.answers)?record.answers:{};
  if(query.submitted==="true"||record.submittedAt)return <main className="grid min-h-svh place-items-center bg-[#f7f3e9] px-5"><div className="max-w-xl text-center"><p className="text-[10px] uppercase tracking-[0.2em]">Vasilis Moumkas Photography</p><h1 className="mt-5 text-5xl font-light uppercase">{greek?"Ευχαριστουμε":"Thank you"}</h1><p className="mt-5 text-sm leading-relaxed text-ink-black/60">{greek?"Το ερωτηματολογιο σας εχει παραληφθει και θα χρησιμοποιηθει για την οργανωση των επομενων βηματων.":"Your questionnaire has been received. I’ll review every detail and use it to guide our next steps together."}</p></div></main>;
  return <main className="min-h-svh bg-[#f7f3e9] px-5 py-12 text-ink-black sm:px-8 lg:py-20"><div className="mx-auto max-w-3xl"><p className="text-[10px] uppercase tracking-[0.2em]">{greek?`Ιδιωτικο ερωτηματολογιο ${baptism?"βαπτισης":"γαμου"}`:`Private ${baptism?"baptism":"wedding"} questionnaire`}</p><h1 className="mt-4 text-[clamp(3rem,7vw,6rem)] font-light uppercase leading-[.9] tracking-[-.05em]">{record.coupleNames}</h1><p className="mt-5 max-w-xl text-sm leading-relaxed text-ink-black/60">{greek?"Οι πληροφοριες αυτες θα με βοηθησουν να οργανωσω τη φωτογραφικη καλυψη με φροντιδα και ακριβεια.":"This helps me understand your day beyond logistics. Take your time; thoughtful, simple answers are perfect."}</p><form action={submitQuestionnaireAction} className="mt-12 grid gap-8"><input type="hidden" name="token" value={token}/>{questions.map(question=><label key={question.name} className="grid gap-2"><span className="text-sm uppercase">{question.label}</span><span className="text-sm  text-ink-black/45">{question.help}</span><textarea name={question.name} defaultValue={typeof savedAnswers[question.name]==="string"?savedAnswers[question.name] as string:""} rows={4} className="border border-ink-black/20 bg-transparent p-4 text-sm outline-none focus:border-ink-black"/></label>)}<button className="bg-ink-black px-6 py-5 text-sm  uppercase tracking-[0.16em] text-white">{greek?"Υποβολη ερωτηματολογιου":"Submit questionnaire"}</button><p className="text-sm  leading-relaxed text-ink-black/40">{greek?"Ο ιδιωτικος συνδεσμος δεχεται μια υποβολη. Επικοινωνηστε με το studio αν χρειαζεται διορθωση.":"This private link accepts one submission. Contact the studio if you need to correct something afterwards."}</p></form></div></main>;
}
