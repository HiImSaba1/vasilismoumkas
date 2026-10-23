import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

const pages = [
  { name: "Homepage", href: "/admin/pages/home", description: "Images, stories, personal introduction and homepage content." },
  { name: "About", href: "/admin/pages/about", description: "Personal introduction and public common questions." },
  { name: "Services", href: "/admin/pages/services", description: "Service descriptions and Process & Journey text." },
  { name: "Contact", href: "/admin/pages/contact", description: "Contact heading, introduction and message prompt." },
];

export default async function PagesPage() {
  await requireAdmin();
  return <main className="px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
    <AdminPageHeader eyebrow="Website content" title="Pages" description="Choose a page, edit its content, then return here to choose another page. Public layout and animations stay protected." />
    <div className="mt-7 grid gap-4 md:grid-cols-2">
      {pages.map(page => <Link key={page.href} href={page.href} className="group border border-ink-black/15 bg-white p-6 transition-colors hover:bg-ink-black hover:text-white">
        <h2 className="text-2xl uppercase">{page.name}</h2><p className="mt-3 text-sm opacity-70">{page.description}</p><span className="mt-6 block text-xs uppercase">Edit page</span>
      </Link>)}
    </div>
    <div className="mt-7 flex flex-wrap gap-4 text-sm underline"><Link href="/admin/website">Shared footer, image library and offer settings</Link><Link href="/admin/seo">SEO settings</Link><Link href="/admin/seo/coverage">SEO coverage and social previews</Link><Link href="/admin/destinations">Destination pages</Link></div>
  </main>;
}
