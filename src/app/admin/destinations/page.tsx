import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { destinationSlug, listDestinations } from "@/lib/destinations";
export default async function Destinations() {
  await requireAdmin();
  const items = await listDestinations(true);
  async function open(form: FormData) { "use server"; await requireAdmin(); const result = destinationSlug.safeParse(form.get("slug")); if (!result.success) return; redirect(`/admin/destinations/${result.data}`); }
  return <main className="grid gap-5 p-6"><Link href="/admin/pages" className="underline">Back to Pages</Link><h1 className="text-3xl">Destination pages</h1><p className="text-sm">One shared template with separate approved copy and related real weddings. No destination is created or published automatically.</p><form action={open} className="flex flex-wrap gap-3"><input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" minLength={2} maxLength={100} placeholder="destination-slug" className="border p-3"/><button className="border px-4">Open / create draft editor</button></form>{items.map(item => <Link key={item.slug} href={`/admin/destinations/${item.slug}`} className="border bg-white p-5">{item.content.title || item.slug} · {item.content.published ? "Published" : "Draft"}</Link>)}</main>;
}
