import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Inquire about your wedding date. Let's discuss your destination wedding photography in Greece, Italy, or anywhere your love takes you.",
  openGraph: {
    title: "Contact | Vasilis Moumkas Photography",
    images: [{ 
      url: "/vm_img/Metadata/og-contact.jpg", 
      width: 1200, 
      height: 630,
      alt: "Contact Vasilis Moumkas"
    }],
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}