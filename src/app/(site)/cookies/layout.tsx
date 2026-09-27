import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookies Policy",
  description: "Information about how we use cookies to improve your experience on our wedding photography portfolio.",
  openGraph: {
    images: [{ url: "/vm_img/Metadata/og-services.jpg" }],
  },
};


export default function CookiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}