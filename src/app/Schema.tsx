import { TestimonialsData } from "./(site)/data/TestimonialsData"; 

export default function Schema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "PhotographyBusiness",
    "@id": "https://vasilismoumkas.com#business",
    name: "Vasilis Moumkas Photography",
    alternateName: "Vasilis Moumkas",
    description: "Luxury wedding and destination photographer based in Greece, specializing in cinematic fine-art storytelling across Europe and Italy.",
    image: "https://vasilismoumkas.com/vm_img/Metadata/og-main.jpg",
    logo: "https://vasilismoumkas.com/favicon.ico", 
    url: "https://vasilismoumkas.com",
    telephone: "+306972218775",
    priceRange: "$$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Melinas Merkouri 25",
      addressLocality: "Thessaloniki",
      addressRegion: "Central Macedonia",
      postalCode: "54655",
      addressCountry: "GR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 40.59469824153946,
      longitude: 22.95213755767078,
    },
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
      "https://www.instagram.com/vasilismoumkas",
      "https://www.facebook.com/VasilisMoumkasPhotography",
      "https://linkedin.com/in/vasilismoumkas",
      "https://www.pinterest.com/vasilismoumkas",
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