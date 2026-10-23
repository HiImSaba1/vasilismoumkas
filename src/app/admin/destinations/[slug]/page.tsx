import {ContentMediaUpload} from "@/components/admin/ContentMediaUpload";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { destinationSlug, destinationKey, destinationSchema, emptyDestination } from "@/lib/destinations";
import { getContentWorkspace, getPublishedContentSnapshot } from "@/lib/content-workspace";
import { listWebsiteImages } from "@/lib/website-media";
import { listInternalLinks } from "@/lib/internal-links";
import { DestinationForm } from "../DestinationForm";
export default async function DestinationEditor({ params }: { params: Promise<{ slug: string }> }) {
  await requireAdmin(); const result = destinationSlug.safeParse((await params).slug); if (!result.success) notFound(); const slug = result.data;
  const [snapshot, work, images, links] = await Promise.all([getPublishedContentSnapshot(destinationKey(slug),emptyDestination), getContentWorkspace(destinationKey(slug)), listWebsiteImages(), listInternalLinks()]);
  return <main className="grid gap-5 p-6"><Link href="/admin/destinations" className="underline">Back to destinations</Link><h1 className="text-3xl">{slug}</h1><ContentMediaUpload scope={`/admin/destinations/${slug}`}/><DestinationForm slug={slug} content={destinationSchema.parse(snapshot.content)} version={snapshot.version} work={work.workspace} workspaceVersion={work.version} images={images} links={links}/></main>;
}
