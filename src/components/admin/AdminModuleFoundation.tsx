import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AdminPageHeader } from "./AdminPageHeader";

export function AdminModuleFoundation({ eyebrow, title, description, items }: { eyebrow: string; title: string; description: string; items: Array<{ title: string; body: string; status: string }> }) {
  return (
    <main className="px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
      <AdminPageHeader eyebrow={eyebrow} title={title} description={description} />
      <section className="mt-8 grid gap-3 lg:grid-cols-3">
        {items.map((item, index) => (
          <article key={item.title} className="flex min-h-52 flex-col justify-between border border-ink-black/20 bg-[#f7f3e9] p-5">
            <div className="flex items-start justify-between gap-4">
              <span className="text-sm  tracking-[0.18em] text-ink-black/35">{String(index + 1).padStart(2, "0")}</span>
              <span className="bg-soft-yellow px-2.5 py-1 text-[12px]  uppercase tracking-[0.14em]">{item.status}</span>
            </div>
            <div>
              <h2 className="mb-2 text-3xl font-light uppercase leading-none tracking-[-0.035em]">{item.title}</h2>
              <p className="text-sm  leading-relaxed text-ink-black/55">{item.body}</p>
            </div>
          </article>
        ))}
      </section>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-ink-black/20 pt-5">
        <p className="text-sm  text-ink-black/50">This module is connected to the CRM foundation and will receive its operational forms in the next workflow sprint.</p>
        <Link href="/admin/overview" className="flex items-center gap-2 text-sm  uppercase tracking-[0.14em]">Back to overview <ArrowUpRight className="h-4 w-4" /></Link>
      </div>
    </main>
  );
}
