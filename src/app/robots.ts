import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/offer/', '/portal/', '/timeline/', '/questionnaire/', '/admin', '/offer', '/portal'],
    },
    sitemap: 'https://vasilismoumkas.com/sitemap.xml',
  };
}
