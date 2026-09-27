import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services | Vasilis Moumkas Photography",
  description:
    "Bespoke wedding photography services for luxury destination weddings in Greece, Italy, and worldwide. Specialist in Athens, Naxos, Thessaloniki, Chalkidiki and Santorini.",
  openGraph: {
    title: "Cinematic Services | Vasilis Moumkas Photography",
    description:
      "Bespoke photography collections for luxury weddings and destination events across Greece and the Mediterranean.",
    images: [
      {
        url: "/vm_img/Homepage/Metadata/og-services.jpg",
        width: 1200,
        height: 630,
        alt: "Vasilis Moumkas Photography Services",
      },
    ],
  },
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}