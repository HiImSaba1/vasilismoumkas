import {ApplyCollectionStyle} from "./ApplyCollectionStyle";
import {buildTestEmailLayout} from "@/lib/email-test-layout";
import {listPortfolioEmailImages} from "@/lib/portfolio";
import {AdminPageHeader} from "@/components/admin/AdminPageHeader";
import {listEmailDeliveries,smtpConfigured} from "@/lib/email-delivery";
import {listAllEmailTemplates,normalizeTemplateEventType,normalizeTemplateLocale} from "@/lib/email-templates";
import {TemplateChooser} from "./TemplateChooser";
import {TemplateEditor} from "./TemplateEditor";

export default async function EmailTemplatesPage({searchParams}:{searchParams:Promise<{template?:string;event?:string;locale?:string;edit?:string}>}) {
  const params=await searchParams;
  const event=normalizeTemplateEventType(params.event),locale=normalizeTemplateLocale(params.locale);
  const[savedTemplates,deliveries,images]=await Promise.all([listAllEmailTemplates(),listEmailDeliveries(),listPortfolioEmailImages()]);
  const templates=[...savedTemplates];for(const source of savedTemplates.filter(item=>item.id==="000")){if(!templates.some(item=>item.id==="010"&&item.eventType===source.eventType&&item.locale===source.locale))templates.push(buildTestEmailLayout(source,images));}
  const choices=templates.filter(item=>item.eventType===event&&item.locale===locale);
  // The proposal is the clearest starting point for designing the visual identity.
  const selected=choices.find(item=>item.id===(params.template??"001"))??choices[0];
  if(!selected)return <main className="p-8"><h1 className="text-3xl">Email Templates</h1><p className="mt-4">No saved templates are available for this collection.</p></main>;
  const smtpReady=smtpConfigured();
  return <main className="px-5 py-8 sm:px-8 lg:px-10">
    <AdminPageHeader eyebrow="Client communication" title="Email designer" description="Choose a template, edit it on the left and see the result on the right." action={<TemplateChooser templates={templates.map(({id,name,eventType,locale,isActive})=>({id,name,eventType,locale,isActive}))} eventType={event} locale={locale}/>}/>
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border border-ink-black/15 bg-[#F5F3EF] px-4 py-3"><p className="text-sm">1. Choose template → 2. Change photo & text → 3. Preview → 4. Save</p><span className="text-sm text-ink-black/60">{event==="baptism"?"Baptism":"Wedding"} · {locale==="el"?"Ελληνικά":"English"} · Version {selected.version}</span></div>
    <ApplyCollectionStyle eventType={event} locale={locale} versions={choices.filter(item=>/^00\d$/.test(item.id)).map(({id,version})=>({id,version}))}/>
    <TemplateEditor key={`${selected.id}-${event}-${locale}-${selected.version}`} template={selected} smtpReady={smtpReady}/>
    <details className="mt-8 border border-ink-black/15 bg-white p-5"><summary className="cursor-pointer text-base">Delivery history & technical details</summary><p className="mt-4 text-sm">SMTP: {smtpReady?"Ready":"Not configured"}. Editing here changes a shared template after saving. To compose for a particular customer, open their client card → Compose email.</p><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm"><thead><tr className="border-b"><th className="p-3">Template</th><th className="p-3">Recipient</th><th className="p-3">Subject</th><th className="p-3">Status</th></tr></thead><tbody>{deliveries.map(item=><tr key={item.id} className="border-b"><td className="p-3">{item.templateId}</td><td className="p-3">{item.recipient}</td><td className="p-3">{item.subject}</td><td className="p-3">{item.status}</td></tr>)}{!deliveries.length&&<tr><td colSpan={4} className="p-4">No deliveries yet.</td></tr>}</tbody></table></div></details>
  </main>;
}
