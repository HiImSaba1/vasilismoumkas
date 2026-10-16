import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  alternates:{canonical:"/contact"},
  description: "Inquire about your wedding date. Let's discuss your destination wedding photography in Greece, Italy, or anywhere your love takes you.",
  openGraph: {
    title: "Contact | Vasilis Moumkas Photography",
    url:"/contact",
    description:"Inquire about destination wedding photography in Greece, Italy and worldwide.",
    images: [{ 
      url: "/vm_img/Metadata/og-contact.jpg", 
      width: 1200, 
      height: 630,
      alt: "Contact Vasilis Moumkas"
    }],
  },
  twitter:{card:"summary_large_image",title:"Contact | Vasilis Moumkas Photography",description:"Inquire about destination wedding photography in Greece, Italy and worldwide.",images:["/vm_img/Metadata/og-contact.jpg"]},
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
