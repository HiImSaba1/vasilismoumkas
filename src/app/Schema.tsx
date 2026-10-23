import {getPublicPageSettings} from "@/lib/public-page-settings";
import {getSeoSettings} from "@/lib/seo-settings";

export default async function Schema() {
  const [{business},{content}]=await Promise.all([getSeoSettings(),getPublicPageSettings("services")]);
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
    ...(business.addressConfirmed?{address: {
      "@type": "PostalAddress",
      streetAddress: business.streetAddress,
      addressLocality: business.addressLocality,
      addressRegion: business.addressRegion,
      postalCode: business.postalCode,
      addressCountry: business.addressCountry,
    }}:{}),
    areaServed: [{ "@type": "Country", name: "Greece" }, { "@type": "Country", name: "Italy" }],
    hasOfferCatalog: { "@type": "OfferCatalog", name: content.title, itemListElement: content.items.map(item => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: item.title, description: item.description.replace(/\[([^\]]+)\]\([^)]*\)/g,"$1") } })) },
    sameAs: [
      business.instagram,
      business.facebook,
      business.pinterest,
    ],

  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
    />
  );
}
