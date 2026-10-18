import { TestimonialsData } from "./(site)/data/TestimonialsData"; 
import {getSeoSettings} from "@/lib/seo-settings";

export default async function Schema() {
  const {business}=await getSeoSettings();
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://vasilismoumkas.com#business",
    name: business.name,
    alternateName: "Vasilis Moumkas",
    description: business.description,
    image: "https://vasilismoumkas.com/vm_img/Metadata/og-main.jpg",
    logo: "https://vasilismoumkas.com/favicon.ico", 
    url: "https://vasilismoumkas.com",
    telephone: business.telephone,
    email: business.email,
    priceRange: "$$$",
    ...(business.addressConfirmed?{address: {
      "@type": "PostalAddress",
      streetAddress: business.streetAddress,
      addressLocality: business.addressLocality,
      addressRegion: business.addressRegion,
      postalCode: business.postalCode,
      addressCountry: business.addressCountry,
    }}:{}),
    areaServed: [
      { "@type": "Country", name: "Greece" },
      { "@type": "Country", name: "Italy" },
      { "@type": "Country", name: "France" },
      { "@type": "Country", name: "Spain" },
      { "@type": "City", name: "Santorini" },
      { "@type": "City", name: "Mykonos" },
      { "@type": "City", name: "Lake Como" },
      { "@type": "City", name: "Naxos" },
      { "@type": "City", name: "Thessaloniki" },
      { "@type": "City", name: "Athens" },
    ],
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "09:00",
      closes: "21:00",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Professional Photography Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Luxury Wedding Photography",
            description: "High-end editorial and documentary wedding photography for discerning couples."
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Destination Wedding Photography",
            description: "Bespoke travel wedding coverage across Greece, Italy, and Europe."
          },
        },
      ],
    },
    sameAs: [
      business.instagram,
      business.facebook,
      business.pinterest,
    ],
    review: TestimonialsData.map((t) => ({
      "@type": "Review",
      author: { "@type": "Person", name: t.couple },
      reviewBody: t.quote,
      reviewRating: {
        "@type": "Rating",
        ratingValue: "5",
        bestRating: "5",
      },
    })),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5",
      reviewCount: TestimonialsData.length.toString(),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
