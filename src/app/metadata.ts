import type { Metadata, Viewport } from "next";

const metadataBase = new URL("https://vasilismoumkas.com");

export const viewport: Viewport = {
  colorScheme: "dark light",
};

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "Vasilis Moumkas | Luxury Wedding Photographer Greece & Italy",
    template: "%s | Vasilis Moumkas Photography",
  },
  description:
    "Vasilis Moumkas is a luxury destination wedding photographer based in Thessaloniki, Greece. Cinematic fine-art wedding photography in Santorini, Mykonos, Naxos, Lake Como, Tuscany & Amalfi Coast.",
  keywords: [
    "Wedding Photographer Greece", 
    "Italy Wedding Photographer",
    "Santorini Wedding Photography",
    "Luxury Destination Wedding",
    "Mykonos Wedding Photographer",
    "Lake Como Wedding Photographer",
    "Naxos Wedding Photographer",
    "Tuscany Wedding Photographer",
    "Cinematic Wedding Storytelling",
    "Fine Art Wedding Photography",
    "Editorial Wedding Photographer",
    "Greece Island Wedding",
    "Amalfi Coast Photographer",
    "Vasilis Moumkas",
    "Best Wedding Photographer Europe",
  ],
  authors: [{ name: "Vasilis Moumkas", url: "https://vasilismoumkas.com" }],
  creator: "Vasilis Moumkas",
  publisher: "Vasilis Moumkas",
  openGraph: {
    title: "Vasilis Moumkas | Luxury Wedding Photographer Greece & Italy",
    description: "Vasilis Moumkas is a luxury destination wedding photographer based in Thessaloniki, Greece. Cinematic fine-art wedding photography in Santorini, Mykonos, Naxos, Lake Como, Tuscany & Amalfi Coast.",
    url: "https://vasilismoumkas.com",
    siteName: "Vasilis Moumkas Photography",
    images: [
      {
        url: "/vm_img/Metadata/og-main.jpg",
        width: 1200,
        height: 630,
        alt: "Luxury Wedding Photographer Greece & Italy - Vasilis Moumkas",
        type: "image/jpeg", 
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vasilis Moumkas | Luxury Wedding Photographer Greece & Italy",
    description: "Vasilis Moumkas is a luxury destination wedding photographer based in Thessaloniki, Greece. Cinematic fine-art wedding photography in Santorini, Mykonos, Naxos, Lake Como, Tuscany & Amalfi Coast.",
    images: ["/vm_img/Metadata/og-main.jpg"],
  },
  alternates: {
    canonical: "https://vasilismoumkas.com",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.ico", type: "image/png" },
    ],
    apple: "/favicon.ico",
  },
};