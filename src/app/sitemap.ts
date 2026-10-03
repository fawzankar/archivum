import type { MetadataRoute } from 'next';
import { query } from '@/lib/db';
import { SITE_URL } from '@/lib/site';

// Rebuilt at most once an hour; a database hiccup falls back to the static pages only.
export const revalidate = 3600;

const PAGES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '/', priority: 1, changeFrequency: 'daily' },
  { path: '/notes', priority: 0.9, changeFrequency: 'daily' },
  { path: '/previous-papers', priority: 0.9, changeFrequency: 'daily' },
  { path: '/tips', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/subjects', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/about', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/contributors', priority: 0.5, changeFrequency: 'weekly' },
  { path: '/contact', priority: 0.4, changeFrequency: 'yearly' },
  { path: '/guidelines', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/privacy', priority: 0.2, changeFrequency: 'yearly' },
  { path: '/terms', priority: 0.2, changeFrequency: 'yearly' },
];

type Row = { id: number; slug: string | null; updated_at: string | null; approved_at: string | null; created_at: string | null };

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const pages: MetadataRoute.Sitemap = PAGES.map(p => ({ url: `${SITE_URL}${p.path === '/' ? '' : p.path}`, lastModified: now, changeFrequency: p.changeFrequency, priority: p.priority }));

  try {
    const rows = await query<Row>("SELECT id, slug, updated_at, approved_at, created_at FROM resources WHERE status = 'approved' ORDER BY created_at DESC LIMIT 5000");
    const resources: MetadataRoute.Sitemap = rows.map(r => {
      const stamp = new Date(r.updated_at || r.approved_at || r.created_at || now);
      return {
        url: `${SITE_URL}/resource/${encodeURIComponent(r.slug || String(r.id))}`,
        lastModified: Number.isNaN(stamp.getTime()) ? now : stamp,
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      };
    });
    return [...pages, ...resources];
  } catch (error) {
    console.error('[sitemap] resources unavailable', error);
    return pages;
  }
}
