import { notFound } from "next/navigation";
import { InvoicePaymentManager } from "@/app/admin/clients/[id]/InvoicePaymentManager";
import { PortalInvoicePanel } from "@/app/portal/[slug]/PortalInvoicePanel";
import type { InvoicePaymentSummary } from "@/lib/invoice-payments";

export const dynamic = "force-dynamic";

const clientId = "33333333-3333-4333-8333-333333333333";

const summary: InvoicePaymentSummary = {
  invoiceDocumentId: "11111111-1111-4111-8111-111111111111",
  baseCollectionTotal: 1300,
  extrasNet: 241.94,
  extrasVat: 58.06,
  extrasTotal: 300,
  invoiceTotal: 1600,
  requiredDeposit: 400,
  depositSatisfied: false,
  totalPaid: 350,
  balanceDue: 1250,
  status: "part-paid",
  documentUpdateRequired: true,
  payments: [
    {
      id: "22222222-2222-4222-8222-222222222222",
      clientId,
      amount: 350,
      paidAt: "2026-08-26",
      paymentMethod: "Bank transfer",
      reference: "TEST-350",
      note: "Deposit received",
      voidedAt: null,
      voidReason: null,
      createdAt: "2026-08-26T10:00:00.000Z",
      updatedAt: "2026-08-26T10:00:00.000Z",
    },
  ],
};

const portal = {
  coupleNames: "Paul Test",
  email: "paulsaba1710@gmail.com",
  eventDate: "2027-05-17",
  language: "en" as const,
  extras: [{id:"44444444-4444-4444-8444-444444444444",titleEl:"Επιπλέον ώρες",titleEn:"Additional hours",descriptionEl:null,descriptionEn:null,coverageScope:"Photography",quantity:2,unitPrice:150,vatRate:24,priceIncludesVat:true}],
};

const invoiceDocument = {
  status: "part-paid",
  data: {
    client_name: "Paul Test",
    client_email: "paulsaba1710@gmail.com",
    collection_name: "Essential",
    collection_hours: "8",
    collection_photographers: "2",
    total: "1600",
  },
};

export default function InvoicePaymentVerificationPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main className="min-h-screen bg-[#f1ede3] p-4 sm:p-8">
      <section className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-light uppercase">
          Invoice payment verification
        </h1>

        <div
          className="mt-6 border border-ink-black/20 bg-[#f7f3e9] p-5"
          data-admin-invoice
        >
          <InvoicePaymentManager
            clientId={clientId}
            summary={summary}
            contractReady
          />
        </div>

        <div
          className="mt-8 border border-ink-black/20 bg-white p-5"
          data-portal-invoice
        >
          <PortalInvoicePanel
            portal={portal}
            document={invoiceDocument}
            summary={summary}
          />
        </div>
      </section>
    </main>
  );
}
