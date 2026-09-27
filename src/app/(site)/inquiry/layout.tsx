import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services Inquiry | Vasilis Moumkas",
  description: "Enquire about 1-on-1 mentorship, web development, or creative workshops. Let's collaborate to elevate your craft and digital presence.",
  openGraph: {
    title: "Services Inquiry | Vasilis Moumkas",
    images: [{ 
      url: "/vm_img/Metadata/og-services.jpg", 
      width: 1200, 
      height: 630,
      alt: "Work with Vasilis Moumkas"
    }],
  },
};

export default function ContactFormServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}