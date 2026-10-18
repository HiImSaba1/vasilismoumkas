import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/offer/', '/portal/', '/timeline/'],
    },
    sitemap: 'https://vasilismoumkas.com/sitemap.xml',
  };
}
