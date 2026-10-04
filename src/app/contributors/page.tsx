import Link from 'next/link';
import { unstable_cache } from 'next/cache';
import { query } from '@/lib/db';
import { Upload, Trophy, Camera, Mail, Heart, ArrowUpRight, Sparkles } from 'lucide-react';
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
    LIMIT 50
  `),
  ['contributors-v3'],
  { revalidate: 300, tags: ['library'] },
);

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0] || '?').slice(0, 2);
  return letters.toUpperCase();
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
  const top = list[0]?.uploads || 1;
  const podium = list.slice(0, 3);
  const rest = list.slice(3);

  return (
    <main className="cbx">
      <header className="cbx-hero">
        <span className="cbx-eyebrow"><Sparkles /> Community</span>
        <h1>The people behind<br />the archive.</h1>
        <p>Every note and paper here was shared by a student who thought of the batch after them. This list is live and only counts approved uploads.</p>
        {!loadFailed && list.length > 0 && (
          <dl className="cbx-stats">
            <div><dt>Contributors</dt><dd>{list.length}</dd></div>
            <div><dt>Uploads</dt><dd>{total}</dd></div>
          </dl>
        )}
      </header>

      {loadFailed ? (
        <section className="cbx-empty"><Trophy /><h2>The contributor list is taking a break</h2><p>We couldn’t reach the archive just now. Please refresh in a minute.</p></section>
      ) : list.length === 0 ? (
        <section className="cbx-empty"><Trophy /><h2>No contributors yet</h2><p>Be the first to have approved material listed here.</p></section>
      ) : (
        <>
          <section className="cbx-podium" aria-label="Top contributors">
            {podium.map((c, i) => (
              <article key={c.contributor_name} className={`cbx-pod cbx-pod-${i + 1}`}>
                <span className="cbx-rank">#{i + 1}</span>
                <div className="cbx-avatar">{initials(c.contributor_name)}</div>
                <h2>{c.contributor_name}</h2>
                <div className="cbx-count"><Upload />{c.uploads} {c.uploads === 1 ? 'upload' : 'uploads'}</div>
                {c.latest_title && (c.latest_id
                  ? <Link href={`/resource/${c.latest_id}`} className="cbx-latest" prefetch={false}><small>Latest</small><span>{c.latest_title}</span><ArrowUpRight /></Link>
                  : <div className="cbx-latest"><small>Latest</small><span>{c.latest_title}</span></div>)}
              </article>
            ))}
          </section>

          {rest.length > 0 && (
            <section className="cbx-rest" aria-label="More contributors">
              <h2 className="cbx-sub">More contributors</h2>
              <ol start={4}>
                {rest.map((c, i) => (
                  <li key={c.contributor_name}>
                    <span className="cbx-n">{i + 4}</span>
                    <div className="cbx-avatar cbx-avatar-sm">{initials(c.contributor_name)}</div>
                    <div className="cbx-who">
                      <strong>{c.contributor_name}</strong>
                      {c.latest_title && <small>{c.latest_title}</small>}
                      <i className="cbx-bar"><b style={{ width: `${Math.max(8, Math.round((c.uploads / top) * 100))}%` }} /></i>
                    </div>
                    <span className="cbx-pill">{c.uploads}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </>
      )}

      <section className="cbx-cta">
        <div className="cbx-cta-icon"><Heart /></div>
        <div className="cbx-cta-copy">
          <h2>Got material that belongs here?</h2>
          <p>Upload it yourself, or reach out to the <span className="quest-word">Quest</span> team and we’ll help it reach the right shelf.</p>
        </div>
        <div className="cbx-cta-actions">
          <Link href="/upload" className="cbx-btn cbx-btn-main"><Upload /> Upload notes</Link>
          <a href="https://instagram.com/quest_sjs" target="_blank" rel="noopener noreferrer" className="cbx-btn"><Camera /> @quest_sjs</a>
          <a href="mailto:sjsquest26@gmail.com" className="cbx-btn"><Mail /> Email us</a>
        </div>
      </section>
    </main>
  );
}
