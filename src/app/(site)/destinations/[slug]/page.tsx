import { notFound } from "next/navigation";
import { listDestinations,resolveDestinationProjectSlugs } from "@/lib/destinations";
import { listPortfolioProjects } from "@/lib/portfolio";
import { DestinationPage } from "@/components/sections/DestinationPage";
import { publicMetadata } from "@/lib/seo-overrides";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = (await listDestinations()).find(item => item.slug === slug);
  if (!item) return { robots: { index: false, follow: false } };
  return publicMetadata({ title: item.content.seoTitle, description: item.content.metaDescription, image: item.content.image, imageAlt: item.content.imageAlt }, `/destinations/${slug}`);
}
export default async function Destination({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = (await listDestinations()).find(item => item.slug === slug);
  if (!item) notFound();
  const slugs=await resolveDestinationProjectSlugs(item.content.projectSlugs);
  const projects = (await listPortfolioProjects()).filter(project => slugs.includes(project.slug));
  const ordered = slugs.flatMap(slug => projects.filter(project => project.slug === slug));
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "WebPage", name: item.content.title, description: item.content.metaDescription, url: `https://vasilismoumkas.com/destinations/${slug}` }).replace(/</g,"\\u003c") }}/><DestinationPage content={item.content} projects={ordered}/></>;
}
