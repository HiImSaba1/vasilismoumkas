import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services",
  alternates:{canonical:"/services"},
  description:
    "Bespoke wedding photography services for luxury destination weddings in Greece, Italy, and worldwide. Specialist in Athens, Naxos, Thessaloniki, Chalkidiki and Santorini.",
  openGraph: {
    title: "Cinematic Services | Vasilis Moumkas Photography",
    description:
      "Bespoke photography collections for luxury weddings and destination events across Greece and the Mediterranean.",
    url:"/services",
    images: [
      {
        url: "/vm_img/Homepage/Metadata/og-services.jpg",
        width: 1200,
        height: 630,
        alt: "Vasilis Moumkas Photography Services",
      },
    ],
  },
  twitter:{card:"summary_large_image",title:"Cinematic Services | Vasilis Moumkas Photography",description:"Bespoke photography collections for luxury weddings and destination events across Greece and the Mediterranean.",images:["/vm_img/Homepage/Metadata/og-services.jpg"]},
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
