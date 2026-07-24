import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/'],
    },
    // Replace with your actual domain later
    sitemap: 'https://galaxy-graphycs-1.onrender.com/sitemap.xml',
  };
}
