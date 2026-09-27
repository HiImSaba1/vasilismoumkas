import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Explore a curated collection of luxury wedding stories. From Santorini to Lake Como, view my cinematic destination wedding photography.",
  openGraph: {
    title: "Wedding Portfolio | Vasilis Moumkas",
    description: "Cinematic and timeless wedding photography across Greece and Italy.",
    images: [{ url: "/vm_img/Metadata/og-portfolio.jpg", width: 1200, height: 630, alt: "Vasilis Moumkas Portfolio" }],
  },
};

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}