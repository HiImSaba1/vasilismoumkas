import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Our commitment to protecting your data and your wedding memories. Review the privacy practices of Vasilis Moumkas Photography.",
  openGraph: {
    images: [{ url: "/vm_img/Metadata/og-main.jpg" }],
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}