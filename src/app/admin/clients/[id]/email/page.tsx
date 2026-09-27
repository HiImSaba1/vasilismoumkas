import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getClient } from "@/lib/clients";
import { smtpConfigured } from "@/lib/email-delivery";
import { listEmailTemplates } from "@/lib/email-templates";
import { getLatestOfferForLead } from "@/lib/offers";
import { getPortalForLead } from "@/lib/client-portals";
import { getInvoicePaymentSummary } from "@/lib/invoice-payments";
import { clientEmailFinancialValues,withClientFinancialParagraph } from "@/lib/client-email-financials";
import { listPortfolioEmailImages } from "@/lib/portfolio";
import { ClientEmailComposer } from "./ClientEmailComposer";

export default async function ClientEmailPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ template?: string }>;
}) {
  const { id } = await params;
  const { template: requestedTemplate } = await searchParams;
  const client = await getClient(id);
  if (!client) notFound();
  const [offer, portal, invoice, emailImages] = await Promise.all([
    client.leadId ? getLatestOfferForLead(client.leadId) : null,
    client.leadId ? getPortalForLead(client.leadId) : null,
    getInvoicePaymentSummary(client.id),
    listPortfolioEmailImages(),
  ]);
  const defaultLocale = offer?.language === "en" ? "en" : "el";
  const [englishTemplates,greekTemplates] = await Promise.all([
    listEmailTemplates(client.eventType,"en"),
    listEmailTemplates(client.eventType,"el"),
  ]);
  const templatesByLocale = {
    en: englishTemplates.filter((item) => item.isActive).map(item=>invoice?.invoiceTotal?withClientFinancialParagraph(item):item),
    el: greekTemplates.filter((item) => item.isActive).map(item=>invoice?.invoiceTotal?withClientFinancialParagraph(item):item),
  };
  const activeTemplates = templatesByLocale[defaultLocale];
  const initialTemplateId = activeTemplates.some((item) => item.id === requestedTemplate)
    ? requestedTemplate
    : activeTemplates[0]?.id;
  const origin = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const portalUrl = portal ? `${origin}/portal/${portal.slug}` : "";
  const offerUrl = offer ? `${origin}/offer/${offer.slug}` : "";

  return <main className="px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
    <AdminPageHeader eyebrow="Client communication" title={`Email · ${client.coupleNames}`} description={`Preview, choose EL or EN, edit and send one approved ${client.eventType} template to ${client.email ?? "a missing client email"}.`} action={<Link href={`/admin/clients/${client.id}`} className="border border-ink-black/20 px-4 py-3 text-sm  uppercase">← Client workspace</Link>}/>
    <section className="mt-8 border border-ink-black/20 bg-[#f7f3e9] p-6">
      <ClientEmailComposer key={initialTemplateId ?? "no-template"} client={client} templatesByLocale={templatesByLocale} defaultLocale={defaultLocale} initialTemplateId={initialTemplateId} smtpReady={smtpConfigured()} portalUrl={portalUrl} offerUrl={offerUrl} financialValues={clientEmailFinancialValues(invoice?.invoiceTotal??0)} emailImages={emailImages}/>
    </section>
  </main>;
}
