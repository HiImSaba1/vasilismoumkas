// src/app/offer/[slug]/layout.tsx

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