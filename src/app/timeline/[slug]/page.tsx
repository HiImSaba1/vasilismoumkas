// FILE: src/app/timeline/[slug]/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import TimelineLayout from "@/components/sections/TimelinePage/TimelineLayout";
import { getTimeline } from "@/lib/crm-records";

type TimelineData = {
  names_gr: string;
  names_en: string;
  date: string;
  items: Array<{ time: string; title_gr: string; title_en: string; location_gr: string; location_en: string; desc_gr: string; desc_en: string }>;
};

async function getTimelineData(slug: string) {
  return getTimeline(slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const timelineData = await getTimelineData(decodedSlug);

  if (!timelineData) return { title: "Timeline Plan Not Found" };

  const naming = timelineData.names_en || "Client Timeline";

  return {
    title: `${naming} — Wedding Schedule | Vasilis Moumkas`,
    description: `Dynamic custom layout tracking workflow and timing for ${naming}.`,
    openGraph: {
      images: [{ url: "/vm_img/Offer/vasilis_moumkas_offer_1.webp" }],
    },
  };
}

export default async function DynamicTimelinePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const timelineData = await getTimelineData(decodedSlug);

  if (!timelineData) return notFound();

  // FIX: Detect language from the slug. 
  // If slug ends in '-gr', set lang to 'gr', otherwise default to 'en'.
  const lang: "en" | "gr" = decodedSlug.endsWith("-gr") ? "gr" : "en";

  // FIX: Pass the lang prop to the layout
  return <TimelineLayout data={timelineData as TimelineData} lang={lang} />;
}
