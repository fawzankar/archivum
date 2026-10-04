import Link from 'next/link';
import { unstable_cache } from 'next/cache';
import { query } from '@/lib/db';
import { AUpload as Upload, ACamera as Camera, AMail as Mail } from '@/components/AnimatedIcons';
import PageHead from '@/components/PageHead';
import type { Metadata } from 'next';
import { OG_IMAGE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contributors: Students Who Share Notes & Papers',
  description: 'Meet the students who upload notes and previous papers to ARCHIVUM, and see how you can contribute study material for your batch.',
  keywords: ['contributors', 'share notes', 'upload study material', 'student community', 'ARCHIVUM contributors'],
  alternates: { canonical: '/contributors' },
  openGraph: { title: 'Contributors | ARCHIVUM', description: 'Students who keep the archive growing.', url: '/contributors', type: 'website', images: [OG_IMAGE] },
};

// Served from the static cache and refreshed in the background every 5 minutes (same as Home, Notes and Papers),
// so the page opens instantly instead of waiting on the database for every visit.
export const revalidate = 300;

type Contributor = { contributor_name: string; uploads: number; latest_title: string | null; latest_id: number | null };

const getContributors = unstable_cache(
  async () => query<Contributor>(`
    WITH ranked AS (
      SELECT contributor_name, title, id,
        ROW_NUMBER() OVER (PARTITION BY contributor_name ORDER BY created_at DESC) AS rn
      FROM resources
      WHERE status='approved'
        AND contributor_name IS NOT NULL
        AND TRIM(contributor_name) != ''
    )
    SELECT contributor_name,
      COUNT(*) AS uploads,
      MAX(CASE WHEN rn=1 THEN title END) AS latest_title,
      MAX(CASE WHEN rn=1 THEN id END) AS latest_id
    FROM ranked
    GROUP BY contributor_name
    ORDER BY uploads DESC, contributor_name ASC
    LIMIT 500
  `),
  ['contributors-v4'],
  { revalidate: 300, tags: ['library'] },
);

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0] || '?').slice(0, 2)).toUpperCase();
}

export default async function ContributorsPage() {
  let list: Contributor[] = [];
  let loadFailed = false;
  try {
    list = (await getContributors()).map((c) => ({ ...c, uploads: Number(c.uploads) }));
  } catch (error) {
    console.error('[contributors] database unavailable', error);
    loadFailed = true;
  }
  const total = list.reduce((n, c) => n + c.uploads, 0);

  return (
    <main className="cbx">
      <PageHead title="People building the archive." art="default" tone="mint">Everyone who has had notes or papers approved on ARCHIVUM, ranked by how much they have shared.</PageHead>

      {loadFailed ? (
        <p className="cbx-note">The contributor list couldn’t load just now. Please refresh in a minute.</p>
      ) : list.length === 0 ? (
        <p className="cbx-note">No contributors yet. Be the first to have approved material listed here.</p>
      ) : (
        <>
          <div className="cbx-summary"><h2>Contributors</h2><span>{list.length} {list.length === 1 ? 'person' : 'people'} · {total} {total === 1 ? 'upload' : 'uploads'}</span></div>
          <ol className="cbx-list">
            {list.map((c, i) => (
              <li key={c.contributor_name}>
                <span className={`cbx-rank${i < 3 ? ' top' : ''}`}>{i + 1}</span>
                <span className="cbx-av" aria-hidden="true">{initials(c.contributor_name)}</span>
                <div className="cbx-main">
                  <strong>{c.contributor_name}</strong>
                  {c.latest_title && (c.latest_id
                    ? <Link href={`/resource/${c.latest_id}`} prefetch={false}>Latest: {c.latest_title}</Link>
                    : <span>Latest: {c.latest_title}</span>)}
                </div>
                <span className="cbx-count">{c.uploads} {c.uploads === 1 ? 'upload' : 'uploads'}</span>
              </li>
            ))}
          </ol>
        </>
      )}

      <section className="cbx-join">
        <h2>Have something to share?</h2>
        <p>Upload your notes or papers and they’ll appear here once approved. You can also reach the <span className="quest-word">Quest</span> team and we’ll help get it to the right place.</p>
        <div>
          <Link href="/upload"><Upload /> Upload</Link>
          <a href="https://instagram.com/quest_sjs" target="_blank" rel="noopener noreferrer"><Camera /> @quest_sjs</a>
          <a href="mailto:sjsquest26@gmail.com"><Mail /> sjsquest26@gmail.com</a>
        </div>
      </section>
    </main>
  );
}
