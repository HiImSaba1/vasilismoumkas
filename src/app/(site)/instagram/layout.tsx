import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Link in Bio | Vasilis Moumkas",
  description: "Exclusive services and templates for photographers by Vasilis Moumkas.",
};

export default function InstagramLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}