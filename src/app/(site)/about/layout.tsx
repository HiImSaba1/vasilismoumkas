import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  alternates:{canonical:"/about"},
  description: "Meet Vasilis Moumkas, a luxury wedding photographer specializing in authentic, fine-art storytelling for destination weddings in Europe and Greek Islands.",
  openGraph: {
    title: "About Vasilis Moumkas | Fine Art Wedding Photographer",
    description: "Capturing the art of love through a cinematic and editorial lens.",
    url:"/about",
    images: [{ url: "/vm_img/Metadata/og-about.jpg", width: 1200, height: 630, alt: "About Vasilis Moumkas" }],
  },
  twitter:{card:"summary_large_image",title:"About Vasilis Moumkas | Fine Art Wedding Photographer",description:"Capturing the art of love through a cinematic and editorial lens.",images:["/vm_img/Metadata/og-about.jpg"]},
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
