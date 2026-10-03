import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin', '/api/', '/saved', '/search'] },
      // Let image/AdSense-style crawlers see the public assets they need to render previews.
      { userAgent: 'Googlebot-Image', allow: ['/og-image.png', '/icons/'] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
