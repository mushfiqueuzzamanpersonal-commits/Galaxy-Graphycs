import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/'],
    },
    // Replace with your actual domain later
    sitemap: 'https://galaxygraphycs.com/sitemap.xml',
  };
}
