import Link from "next/link";
import { notFound } from "next/navigation";
import { getPortalBySlug } from "@/lib/client-portals";
import { getInvoicePaymentSummary } from "@/lib/invoice-payments";
import { removeGreekTonos } from "@/lib/greek-typography";
import { portalSlugPath } from "@/lib/portal-url";
import { questionnaireFields } from "@/lib/questionnaire-definitions";
import { acceptPortalContract,submitPortalQuestionnaire } from "./actions";
import { PortalInvoicePanel } from "./PortalInvoicePanel";
import { PortalMarquee } from "./PortalMarquee";

type Portal=NonNullable<Awaited<ReturnType<typeof getPortalBySlug>>>;
type PortalDocument={status:string;data:Record<string,string>}|undefined;
type PortalLanguage="gr"|"en";
type DocumentType="questionnaire"|"contract"|"invoice";

const documentTypes=["questionnaire","contract","invoice"] as const;
const tabs=["home",...documentTypes] as const;

function localizedStatus(status:string,language:PortalLanguage){
  if(language==="en")return status.replaceAll("-"," ");
  return({draft:"προσχεδιο",sent:"απεσταλμενο",completed:"ολοκληρωθηκε",signed:"υπογεγραμμενο",issued:"εκδοθηκε","part-paid":"μερικως πληρωμενο",paid:"πληρωμενο",pending:"σε αναμονη"} as Record<string,string>)[status]??status.replaceAll("-"," ");
}

export default async function PortalPage({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<{tab?:string;saved?:string}>}){
  const{slug}=await params;
  const query=await searchParams;
  const portal=await getPortalBySlug(slug);
  if(!portal)notFound();
  const tab=tabs.includes(query.tab as typeof tabs[number])?query.tab as typeof tabs[number]:"home";
  const document=portal.documents.find(item=>item.type===tab);
  const paymentSummary=tab==="invoice"?await getInvoicePaymentSummary(portal.clientId):null;
  const greek=portal.language==="gr";
  const path=portalSlugPath(portal.slug);
  const labels=greek?{home:"Αρχικη",questionnaire:"Ερωτηματολογιο",contract:"Συμφωνητικο",invoice:"Τιμολογιο"}:{home:"Home",questionnaire:"Questionnaire",contract:"Agreement",invoice:"Invoice"};

  return <main className="min-h-svh bg-[#f7f3e9] text-ink-black">
    <PortalMarquee language={portal.language} eventType={portal.eventType} identity={portal.slug}/>
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
      <h1 className="portal-client-name font-light uppercase">{removeGreekTonos(portal.coupleNames)}</h1>
      <p className="mt-2 text-sm text-ink-black/50">{portal.eventDate??(greek?"Η ημερομηνια εκκρεμει":"Event date pending")}</p>
      <nav className="mt-8 grid grid-cols-2 border border-ink-black/20 sm:grid-cols-4">
        {tabs.map(item=><Link key={item} href={`/portal/${path}?tab=${item}`} className={`p-4 text-center text-xs uppercase transition-colors hover:bg-ink-black hover:text-white ${tab===item?"bg-ink-black text-white":""}`}>
          {labels[item]}
          <span className="mt-1 block opacity-60">{item==="home"?`${portal.files.length} ${greek?"αρχεια":"files"}`:localizedStatus(portal.documents.find(entry=>entry.type===item)?.status??"draft",portal.language)}</span>
        </Link>)}
      </nav>
      {query.saved&&<p className="mt-5 bg-green-100 p-4 text-sm text-green-900">{greek?"Οι πληροφοριες σας αποθηκευτηκαν επιτυχως.":"Your information has been saved successfully."}</p>}
      <section className="mt-6 border border-ink-black/20 bg-white p-5 sm:p-8">
        {tab==="home"&&<Home portal={portal}/>} 
        {tab==="questionnaire"&&<Questionnaire slug={portal.slug} document={document} eventType={portal.eventType} language={portal.language}/>} 
        {tab==="contract"&&<Contract slug={portal.slug} document={document} eventType={portal.eventType} language={portal.language}/>} 
        {tab==="invoice"&&<><DocumentPdfActions slug={portal.slug} type="invoice" language={portal.language}/><PortalInvoicePanel portal={portal} document={document} summary={paymentSummary}/></>}
      </section>
    </div>
  </main>;
}

function Home({portal}:{portal:Portal}){
  const greek=portal.language==="gr";
  const path=portalSlugPath(portal.slug);
  const records={questionnaire:portal.documents.find(item=>item.type==="questionnaire"),contract:portal.documents.find(item=>item.type==="contract"),invoice:portal.documents.find(item=>item.type==="invoice")};
  const labels=greek?{questionnaire:"Ερωτηματολογιο",contract:"Συμφωνητικο",invoice:"Τιμολογιο"}:{questionnaire:"Questionnaire",contract:"Agreement",invoice:"Invoice"};
  return <div className="grid gap-9">
    <section><p className="text-[10px] uppercase tracking-[.16em] text-ink-black/45">{greek?"Καλως ηρθατε":"Welcome"}</p><h2 className="mt-2 text-3xl font-light uppercase sm:text-4xl">{greek?"Ο χωρος της συνεργασιας μας":"Your client portal overview"}</h2><p className="mt-5 max-w-3xl text-sm leading-7 text-ink-black/65">{greek?"Εδώ θα βρίσκετε συγκεντρωμένα το ερωτηματολόγιο, το συμφωνητικό, το τιμολόγιο και τα ιδιωτικά παραστατικά που έχει ανεβάσει το studio για εσάς.":"Your questionnaire, agreement, invoice and private files uploaded by the studio are kept together here for clear, safe access."}</p></section>
    <dl className="grid gap-3 border-y border-ink-black/15 py-5 text-sm sm:grid-cols-3"><div><dt className="text-xs uppercase text-ink-black/45">{greek?"Πελατης":"Client"}</dt><dd className="mt-1">{portal.coupleNames}</dd></div><div><dt className="text-xs uppercase text-ink-black/45">{greek?"Ημερομηνια":"Event date"}</dt><dd className="mt-1">{portal.eventDate??"—"}</dd></div><div><dt className="text-xs uppercase text-ink-black/45">{greek?"Τοποθεσια":"Location"}</dt><dd className="mt-1">{portal.location??"—"}</dd></div></dl>
    <section className="grid gap-4 sm:grid-cols-3">{documentTypes.map(type=><Link key={type} href={`/portal/${path}?tab=${type}`} className="border border-ink-black/15 bg-[#f7f3e9] p-4 transition-colors hover:bg-ink-black hover:text-white"><p className="text-xs uppercase opacity-60">{labels[type]}</p><p className="mt-3 text-sm uppercase">{localizedStatus(records[type]?.status??"draft",portal.language)}</p></Link>)}</section>
    {portal.team.length>0&&<section><p className="text-[10px] uppercase tracking-[.16em] text-ink-black/45">{greek?"ΟΜΑΔΑ ΚΑΛΥΨΗΣ":"Coverage team"}</p><h3 className="mt-2 text-2xl font-light uppercase">{greek?"Η ομαδα του γαμου σας":"Your event team"}</h3><div className="mt-4 grid gap-3 sm:grid-cols-2">{portal.team.map(member=><div key={member.id} className="border border-ink-black/15 bg-[#f7f3e9] p-4"><p className="text-sm uppercase">{member.fullName}</p><p className="mt-1 text-xs uppercase text-ink-black/50">{member.customRole||member.role.replaceAll("-"," ")}</p>{member.showContactInPortal&&<p className="mt-3 text-sm text-ink-black/60">{[member.email,member.phone].filter(Boolean).join(" · ")}</p>}{member.coverageStart&&<p className="mt-2 text-xs text-ink-black/45">{member.coverageStart}{member.coverageEnd?`–${member.coverageEnd}`:""}</p>}</div>)}</div></section>}
    <section><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] uppercase tracking-[.16em] text-ink-black/45">{greek?"Ιδιωτικα αρχεια":"Private files"}</p><h3 className="mt-2 text-2xl font-light uppercase">{greek?"Παραστατικα και αποδειξεις":"Receipts and documents"}</h3></div><span className="text-xs uppercase text-ink-black/45">{portal.files.length} {greek?"αρχεια":"files"}</span></div><div className="mt-4 grid gap-2">{portal.files.map(file=><a key={file.id} href={`/api/portal/${path}/files/${file.id}`} className="grid gap-2 border-t border-ink-black/10 py-4 transition-colors hover:bg-ink-black hover:px-3 hover:text-white sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"><div className="min-w-0"><p className="truncate text-sm">{file.originalName}</p><p className="mt-1 text-xs uppercase opacity-60">{(file.sizeBytes/1024/1024).toFixed(2)} MB{file.createdAt?` · ${new Date(file.createdAt).toLocaleDateString(greek?"el-GR":"en-GB")}`:""}</p></div><span className="text-xs uppercase underline">{greek?"Ληψη":"Download"} ↓</span></a>)}{!portal.files.length&&<p className="border border-dashed border-ink-black/20 p-5 text-sm text-ink-black/45">{greek?"Δεν έχουν ανέβει ακόμη ιδιωτικά παραστατικά.":"No private receipts have been uploaded yet."}</p>}</div><p className="mt-4 border-l-4 border-soft-yellow bg-[#f7f3e9] p-4 text-sm leading-relaxed text-ink-black/60">{greek?"Τα αρχεία παρέχονται για ενημέρωση και λήψη. Δεν μεταβάλλουν αυτόματα την αξία ή την κατάσταση του τιμολογίου.":"Files are provided for reference and download. They do not automatically change the invoice amount or payment status."}</p></section>
  </div>;
}

function Questionnaire({slug,document,eventType,language}:{slug:string;document:PortalDocument;eventType:"wedding"|"baptism";language:PortalLanguage}){
  const questions=questionnaireFields(eventType,language,document?.data);
  return <><DocumentPdfActions slug={slug} type="questionnaire" language={language}/><h2 className="portal-document-heading mt-5 font-light uppercase">{language==="gr"?(eventType==="baptism"?"Ερωτηματολογιο βαπτισης":"Ερωτηματολογιο γαμου"):(eventType==="baptism"?"Baptism questionnaire":"Wedding questionnaire")}</h2>{document?.data.instructions&&<p className="mt-4 max-w-3xl whitespace-pre-wrap text-sm leading-6 text-ink-black/60">{document.data.instructions}</p>}{document?.status==="completed"?<p className="mt-5">{language==="gr"?"Ευχαριστουμε. Το ερωτηματολογιο σας εχει υποβληθει.":"Thank you. Your questionnaire has been submitted."}</p>:<form action={submitPortalQuestionnaire} className="mt-6 grid gap-5 md:grid-cols-2"><input type="hidden" name="slug" value={slug}/>{questions.map(({name,label,help})=><label key={name} className="grid gap-2 text-[10px] uppercase">{label}<span className="text-[10px] normal-case text-ink-black/45">{help}</span><textarea name={name} defaultValue={document?.data[name]??""} rows={3} className="border border-ink-black/20 p-3 text-sm normal-case"/></label>)}<button className="bg-ink-black px-5 py-4 text-sm uppercase text-white transition-colors hover:bg-soft-yellow hover:text-ink-black md:col-span-2">{language==="gr"?"Υποβολη ερωτηματολογιου":"Submit questionnaire"}</button></form>}</>;
}

function Contract({slug,document,eventType,language}:{slug:string;document:PortalDocument;eventType:"wedding"|"baptism";language:PortalLanguage}){
  const greek=language==="gr";
  return <><DocumentPdfActions slug={slug} type="contract" language={language}/><h2 className="portal-document-heading mt-5 font-light uppercase">{greek?(eventType==="baptism"?"Συμφωνητικο φωτογραφισης βαπτισης":"Συμφωνητικο φωτογραφισης γαμου"):(eventType==="baptism"?"Baptism photography agreement":"Wedding photography agreement")}</h2><DocumentData data={document?.data??{}} language={language}/>{document?.status==="signed"?<p className="mt-6 bg-green-100 p-4">{greek?`Το συμφωνητικο εγινε αποδεκτο απο ${document.data.signed_name}.`:`Agreement accepted by ${document.data.signed_name}.`}</p>:<form action={acceptPortalContract} className="mt-6 grid max-w-xl gap-2 sm:grid-cols-[minmax(0,1fr)_auto]"><input type="hidden" name="slug" value={slug}/><input required name="signed_name" placeholder={greek?"Πληρες ονοματεπωνυμο":"Full legal name"} className="min-w-0 border border-ink-black/20 p-3"/><button className="bg-ink-black px-5 py-3 text-sm uppercase text-white transition-colors hover:bg-soft-yellow hover:text-ink-black">{greek?"Αποδοχη συμφωνητικου":"Accept agreement"}</button></form>}</>;
}

function DocumentPdfActions({slug,type,language}:{slug:string;type:DocumentType;language:PortalLanguage}){
  const base=`/api/portal/${portalSlugPath(slug)}/documents/${type}/pdf`;
  const greek=language==="gr";
  return <div className="flex flex-wrap justify-end gap-2"><a href={base} target="_blank" rel="noreferrer" className="border border-ink-black/20 px-4 py-3 text-xs uppercase transition-colors hover:bg-ink-black hover:text-white">{greek?"Προβολη PDF":"Open PDF"} ↗</a><a href={`${base}?download=1`} className="bg-ink-black px-4 py-3 text-xs uppercase text-white transition-colors hover:bg-soft-yellow hover:text-ink-black">{greek?"Ληψη PDF":"Download PDF"} ↓</a></div>;
}

function DocumentData({data,language}:{data:Record<string,string>;language:PortalLanguage}){
  const entries=Object.entries(data).filter(([key])=>!key.startsWith("signed_")&&key!=="custom_questions");
  return entries.length?<dl className="mt-6 grid gap-4">{entries.map(([key,value])=><div key={key} className="border-t border-ink-black/10 pt-3"><dt className="text-xs uppercase text-ink-black/45">{key==="contract_text"?(language==="gr"?"Οροι συμφωνητικου":"Agreement terms"):key.replaceAll("_"," ")}</dt><dd className="mt-1 whitespace-pre-wrap text-sm">{value||"—"}</dd></div>)}</dl>:<p className="mt-5 text-sm text-ink-black/50">{language==="gr"?"Το studio προετοιμαζει αυτο το εγγραφο.":"The studio is preparing this document."}</p>;
}
