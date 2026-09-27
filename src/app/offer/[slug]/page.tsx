// FILE: src/app/offer/[slug]/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import OfferLayout from "@/components/sections/OfferPage/OfferLayout";
import { getOffer } from "@/lib/crm-records";
import OfferResponse from "@/components/sections/OfferPage/OfferResponse";
import { GreekUppercaseNormalizer } from "@/components/GreekUppercaseNormalizer";
import { randomInt } from "node:crypto";

const IMAGES = {
  wedding: "/vm_img/Offer/vasilis_moumkas_offer_3.webp",
  baptism: "/vm_img/Projects/Zoi_baptism/vasilis_moumkas_zoi_baptism_13.webp"
};

async function getOfferData(slug: string) {
  return getOffer(slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const offerData = await getOfferData(decodedSlug);

  if (!offerData || offerData.expired) return { title: "Offer Not Available" };

  const isGreek = offerData.lang === "gr";
  const naming = offerData.n || "Client";
  const isBaptism = offerData.type === "baptism";

  // Επιλογή εικόνας από τα standard paths
  const ogImage = isBaptism ? IMAGES.baptism : IMAGES.wedding;

  const title = isBaptism 
    ? (isGreek ? `Προσφορά Φωτογράφισης Βάπτισης για ${naming} | Vasilis Moumkas` : `Baptism Photography Offer for ${naming} | Vasilis Moumkas`)
    : (isGreek ? `Προσφορά Φωτογράφισης Γάμου για ${naming} | Vasilis Moumkas` : `Wedding Photography Offer for ${naming} | Vasilis Moumkas`);

  const description = isBaptism
    ? (isGreek ? `Εξατομικευμένες συλλογές φωτογράφισης για τη βάπτιση του ${naming}.` : `Custom baptism photography collections for ${naming}.`)
    : (isGreek ? `Εξατομικευμένες συλλογές φωτογράφισης για τον γάμο των ${naming}.` : `Custom wedding photography collections for ${naming}.`);

  return {
    title,
    description,
    openGraph: {
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      images: [ogImage],
    }
  };
}

export default async function DynamicOfferPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const offerData = await getOffer(decodedSlug, true);

  if (!offerData) return notFound();

  if (offerData.expired) {
    return <main className="flex min-h-screen items-center justify-center bg-soft-white px-6 text-center text-ink-black"><p className="max-w-2xl text-2xl">Η συγκεκριμένη πρόταση δεν είναι πλέον διαθέσιμη. Αν εξακολουθείτε να ενδιαφέρεστε, θα χαρώ να επικοινωνήσετε μαζί μου ώστε να ετοιμάσω μια νέα, ενημερωμένη πρόταση.</p></main>;
  }

  const language: "en" | "gr" = offerData.lang === "gr" ? "gr" : "en";
  const packageKeys = offerData.type === "baptism" ? ["b1","b2","b3"] : ["c1","c2","c3"];
  const savedPackages = packageKeys.map((key) => {
    const collection = offerData[key];
    return collection && typeof collection === "object" && "ph" in collection ? String(collection.ph ?? "") : "";
  }).filter(Boolean);
  const packages = savedPackages.length > 0
    ? savedPackages
    : offerData.type === "baptism"
      ? ["The Essential Collection", "The Signature Collection"]
      : ["Essential", "Most Popular", "Full Wedding Experience"];
  const status=typeof offerData._offerStatus==="string"?offerData._offerStatus:"sent";
  const imageSeed=randomInt(0,2_147_483_647);
  return <GreekUppercaseNormalizer active={language==="gr"}><OfferLayout initialData={offerData} imageSeed={imageSeed}/><OfferResponse slug={decodedSlug} lang={language} packages={packages} status={status}/></GreekUppercaseNormalizer>;
}
