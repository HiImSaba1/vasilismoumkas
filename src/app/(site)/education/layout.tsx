import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Education | Vasilis Moumkas Photography",
  description:
    "Educational resources and workshops for aspiring photographers, focusing on wedding and destination photography techniques.",
  openGraph: {
    title: "Education | Vasilis Moumkas Photography",
    description:
      "Learn from the best in the business with our educational workshops and resources for wedding and destination photography.",
    images: [
      {
        url: "/vm_img/Homepage/Metadata/og-services.jpg",
        width: 1200,
        height: 630,
        alt: "Vasilis Moumkas Photography Education",
      },
    ],
  },
};

export default function EducationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}