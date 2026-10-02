import { unstable_cache } from 'next/cache';
import { query } from '@/lib/db';
import { Users, Upload, Trophy, Camera, Mail, Heart } from 'lucide-react';
import PageHead from '@/components/PageHead';

// Render on request instead of during `next build`, so a Turso hiccup can never fail a deploy.
// The query result is still cached for 5 minutes by unstable_cache below.
export const dynamic = 'force-dynamic';

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
  ['contributors-v2'],
  { revalidate: 300, tags: ['library'] },
);

export default async function ContributorsPage() {
  let contributors: Contributor[] = [];
  let loadFailed = false;
  try {
    contributors = await getContributors();
  } catch (error) {
    console.error('[contributors] database unavailable', error);
    loadFailed = true;
  }

  return (
    <main className="max-w-6xl mx-auto w-full px-3 sm:px-6 py-6 sm:py-12">
      <PageHead title="People building the archive." art="default" tone="mint">A live list based on approved material actually uploaded to ARCHIVUM. No inflated contributor numbers.</PageHead>

      <section className="contributors-intro contributors-thankyou">
        <div className="contributors-intro-icon"><Heart /></div>
        <div><h2>Thank you to the people behind the archive.</h2><p>Every useful note, paper and study resource shared here helps keep ARCHIVUM alive. Our contributors give their time, material and helping nature to make studying a little easier for everyone who comes after them.</p><p>If you have material you think belongs in the archive, reach out to the <span className="quest-word">Quest</span> team and we’ll help you get it to the right place.</p></div>
      </section>
      <section className="contributors-contact-grid">
        <a href="https://instagram.com/quest_sjs" target="_blank" rel="noopener noreferrer"><Camera /><span><strong>Instagram</strong><small>@quest_sjs</small></span></a>
        <a href="mailto:sjsquest26@gmail.com"><Mail /><span><strong>Email</strong><small>sjsquest26@gmail.com</small></span></a>
      </section>

      <section className="mt-5 grid gap-2.5">
        {loadFailed ? (
          <div className="rounded-xl border p-10 text-center" style={{background:'var(--surface)',borderColor:'var(--border)'}}>
            <Trophy className="w-8 h-8 mx-auto" style={{color:'var(--accent)'}}/>
            <h2 className="font-display font-bold text-xl mt-3">The contributor list is taking a break</h2>
            <p className="text-xs mt-2" style={{color:'var(--ink-muted)'}}>We couldn’t reach the archive just now. Please refresh in a minute.</p>
          </div>
        ) : contributors.length === 0 ? (
          <div className="rounded-xl border p-10 text-center" style={{background:'var(--surface)',borderColor:'var(--border)'}}>
            <Trophy className="w-8 h-8 mx-auto" style={{color:'var(--accent)'}}/>
            <h2 className="font-display font-bold text-xl mt-3">No contributors yet</h2>
            <p className="text-xs mt-2" style={{color:'var(--ink-muted)'}}>Be the first to have approved material listed here.</p>
          </div>
        ) : contributors.map((c, i) => (
          <div key={c.contributor_name} className="rounded-2xl border p-3.5 sm:p-5 flex items-center gap-3 sm:gap-4 min-w-0" style={{background:'var(--surface)',borderColor:'var(--border)'}}>
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center font-display font-bold" style={{background:'var(--accent-light)',color:'var(--accent)'}}>{i+1}</div>
            <div className="min-w-0 flex-1"><div className="font-display font-medium truncate">{c.contributor_name}</div><div className="text-[11px] mt-1 truncate" style={{color:'var(--ink-muted)'}}>{c.latest_title ? `Latest: ${c.latest_title}` : 'Approved contributor'}</div></div>
            <div className="shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] sm:text-xs font-bold" style={{background:'var(--surface-raised)',color:'var(--ink-muted)'}}><Upload className="w-3.5 h-3.5"/>{c.uploads} {c.uploads === 1 ? 'upload' : 'uploads'}</div>
          </div>
        ))}
      </section>
    </main>
  );
}
