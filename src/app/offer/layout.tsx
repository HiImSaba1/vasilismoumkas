import type {Metadata} from "next";
export const metadata:Metadata={robots:{index:false,follow:false,noarchive:true,nocache:true}};

export default function OfferLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* You can add a shared Header or Footer for all offer pages here */}
      {children}
    </>
  );
}
